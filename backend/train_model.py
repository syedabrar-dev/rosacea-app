"""Train the skin disease classifier (MobileNetV2 transfer learning).

Dataset layout (one sub-folder per class):
    data/train/<class name>/*.jpg
    data/test/<class name>/*.jpg      (optional)
If there is no test folder, part of the training data is held out for
validation and testing.

Usage (from the backend folder):
    python train_model.py --data ../data
Google Colab:
    python train_model.py --data /content/data --out /content/output
"""
import argparse
import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

IMG_SIZE = (224, 224)
SEED = 42


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--data", required=True, help="folder containing train/ (and optionally test/)")
    p.add_argument("--out", default=str(Path(__file__).resolve().parent), help="where to save the model")
    p.add_argument("--batch", type=int, default=16)
    p.add_argument("--epochs", type=int, default=15)
    p.add_argument("--fine-tune-epochs", type=int, default=10)
    return p.parse_args()


def load_datasets(data_dir, batch):
    train_dir = data_dir / "train" if (data_dir / "train").exists() else data_dir
    test_dir = data_dir / "test"
    extensions = {".jpg", ".jpeg", ".png"}
    class_dirs = sorted(p for p in train_dir.iterdir() if p.is_dir())
    class_names = [p.name for p in class_dirs]
    if len(class_names) < 2:
        raise ValueError(f"Expected at least 2 class folders inside {train_dir}.")

    rng = np.random.default_rng(SEED)
    train_paths, train_labels = [], []
    val_paths, val_labels = [], []
    test_paths, test_labels = [], []
    has_external_test = test_dir.is_dir() and any(
        p.is_file() and p.suffix.lower() in extensions for p in test_dir.rglob("*")
    )

    for label, class_dir in enumerate(class_dirs):
        files = sorted(p for p in class_dir.rglob("*")
                       if p.is_file() and p.suffix.lower() in extensions)
        if len(files) < 3:
            raise ValueError(f"Class '{class_dir.name}' needs at least 3 supported images.")
        rng.shuffle(files)

        if has_external_test:
            test_class_dir = test_dir / class_dir.name
            heldout = sorted(p for p in test_class_dir.rglob("*")
                             if p.is_file() and p.suffix.lower() in extensions) if test_class_dir.is_dir() else []
            if not heldout:
                raise ValueError(f"No test images found for '{class_dir.name}' in {test_class_dir}.")
            n_val = max(1, int(len(files) * 0.2))
            val_files, train_files = files[:n_val], files[n_val:]
        else:
            # Split each class separately so the held-out sets include every class.
            n_test = max(1, int(len(files) * 0.1))
            n_val = max(1, int(len(files) * 0.1))
            test_files = files[:n_test]
            val_files = files[n_test:n_test + n_val]
            train_files = files[n_test + n_val:]
            heldout = test_files

        train_paths.extend(str(p) for p in train_files)
        train_labels.extend([label] * len(train_files))
        val_paths.extend(str(p) for p in val_files)
        val_labels.extend([label] * len(val_files))
        test_paths.extend(str(p) for p in heldout)
        test_labels.extend([label] * len(heldout))

    def make_dataset(paths, labels, shuffle):
        ds = tf.data.Dataset.from_tensor_slices((paths, labels))
        if shuffle:
            ds = ds.shuffle(len(paths), seed=SEED, reshuffle_each_iteration=True)

        def load_image(path, label):
            image = tf.io.read_file(path)
            image = tf.io.decode_image(image, channels=3, expand_animations=False)
            image.set_shape([None, None, 3])
            image = tf.image.resize(image, IMG_SIZE)
            return image, tf.one_hot(label, len(class_names))

        return (ds.map(load_image, num_parallel_calls=tf.data.AUTOTUNE)
                .batch(batch).prefetch(tf.data.AUTOTUNE))

    class_counts = np.bincount(train_labels, minlength=len(class_names)).astype(float)
    print("Stratified split (train / validation / test):")
    for label, name in enumerate(class_names):
        print(f"  {name}: {train_labels.count(label)} / {val_labels.count(label)} / {test_labels.count(label)}")

    return (make_dataset(train_paths, train_labels, shuffle=True),
            make_dataset(val_paths, val_labels, shuffle=False),
            make_dataset(test_paths, test_labels, shuffle=False),
            class_names, class_counts)


def class_weights_from(counts):
    total = counts.sum()
    return {i: float(total / (len(counts) * c)) for i, c in enumerate(counts) if c > 0}


def build_model(n_classes):
    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    # Augmentation layers are only active during training.
    x = tf.keras.layers.RandomFlip("horizontal")(inputs)
    x = tf.keras.layers.RandomRotation(0.06)(x)
    x = tf.keras.layers.RandomZoom(0.2)(x)
    x = tf.keras.layers.RandomContrast(0.15)(x)
    # MobileNetV2 expects inputs in [-1, 1]. Doing it inside the model means the
    # backend can pass raw 0-255 pixels.
    x = tf.keras.layers.Rescaling(1.0 / 127.5, offset=-1)(x)

    base = tf.keras.applications.MobileNetV2(
        input_shape=IMG_SIZE + (3,), include_top=False, weights="imagenet")
    base.trainable = False
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    x = tf.keras.layers.Dense(128, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.4)(x)
    outputs = tf.keras.layers.Dense(n_classes, activation="softmax")(x)
    return tf.keras.Model(inputs, outputs), base


def compile_model(model, lr):
    model.compile(
        # Legacy Adam avoids a known optimizer/Metal graph issue on Apple Silicon.
        optimizer=tf.keras.optimizers.legacy.Adam(learning_rate=lr),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )


def evaluate(model, test_ds, class_names, out_dir):
    y_true, y_pred = [], []
    for images, labels in test_ds:
        probs = model.predict(images, verbose=0)
        y_true.extend(np.argmax(labels.numpy(), axis=1))
        y_pred.extend(np.argmax(probs, axis=1))

    report = classification_report(
        y_true, y_pred, labels=list(range(len(class_names))),
        target_names=class_names, output_dict=True, zero_division=0)
    matrix = confusion_matrix(y_true, y_pred, labels=list(range(len(class_names))))

    print("\n=== Test set results ===")
    print(classification_report(
        y_true, y_pred, labels=list(range(len(class_names))),
        target_names=class_names, zero_division=0))

    with open(out_dir / "metrics.json", "w", encoding="utf-8") as f:
        json.dump({"classification_report": report,
                   "confusion_matrix": matrix.tolist(),
                   "classes": class_names}, f, indent=2)
    return report["accuracy"]


def main():
    args = parse_args()
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    print("GPUs visible:", tf.config.list_physical_devices("GPU"))
    train_ds, val_ds, test_ds, class_names, counts = load_datasets(Path(args.data), args.batch)
    print("Classes:", class_names)
    print("Training images per class:", dict(zip(class_names, counts.astype(int))))

    weights = class_weights_from(counts)
    model, base = build_model(len(class_names))

    early_stop = tf.keras.callbacks.EarlyStopping(
        monitor="val_loss", patience=4, restore_best_weights=True)
    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6)

    # Phase 1: train only the new classification head.
    compile_model(model, 1e-3)
    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs,
              class_weight=weights, callbacks=[early_stop, reduce_lr])

    # Phase 2: fine-tune the top of the base model. BatchNorm layers stay frozen,
    # which keeps training stable on a small dataset.
    if args.fine_tune_epochs > 0:
        base.trainable = True
        for layer in base.layers[:-30]:
            layer.trainable = False
        for layer in base.layers:
            if isinstance(layer, tf.keras.layers.BatchNormalization):
                layer.trainable = False
        compile_model(model, 3e-5)
        model.fit(train_ds, validation_data=val_ds, epochs=args.fine_tune_epochs,
                  class_weight=weights, callbacks=[early_stop, reduce_lr])

    accuracy = evaluate(model, test_ds, class_names, out_dir)

    model.save(out_dir / "skin_disease_model.keras")
    with open(out_dir / "class_names.json", "w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=2)
    print(f"\nSaved model and class_names.json to {out_dir}")
    print(f"Test accuracy: {accuracy:.4f}")


if __name__ == "__main__":
    main()
