"""Label cleaning and precaution lookup.

Kept free of TensorFlow imports so it can be tested on its own.
The class names come from the dataset folder names saved at training time
(class_names.json), so the model output always maps to the right label.
"""
import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# (all keywords must appear in the lower-cased folder name) -> (display name, precautions key)
# Order matters: the first matching rule wins.
LABEL_RULES = [
    (("acne", "rosacea"), "Acne / Rosacea", "Acne_Rosacea"),
    (("rosacea",), "Rosacea", "Rosacea"),
    (("acne",), "Acne", "Acne"),
    (("actinic",), "Actinic Keratosis / Possible Malignant Lesion", "Actinic_Keratosis"),
    (("malignant",), "Actinic Keratosis / Possible Malignant Lesion", "Actinic_Keratosis"),
    (("atopic",), "Atopic Dermatitis", "Atopic Dermatitis"),
    (("eczema",), "Eczema", "Eczema"),
    (("wart",), "Warts / Viral Skin Infection", "Warts"),
    (("lupus",), "Lupus / Connective Tissue Disease", "Lupus"),
    (("tinea",), "Fungal Infection (Tinea / Candidiasis)", "Tinea"),
    (("fungal",), "Fungal Infection (Tinea / Candidiasis)", "Tinea"),
    (("candid",), "Fungal Infection (Tinea / Candidiasis)", "Tinea"),
    (("normal",), "Normal / Unknown", "Unknown_Normal"),
    (("unknown",), "Normal / Unknown", "Unknown_Normal"),
]

DEFAULT_INFO = {
    "precautions": ["No specific precautions found for this result."],
    "doctor_advice": "Consult a doctor if symptoms persist.",
    "urgent": False,
}


def load_precautions(path=None):
    path = Path(path) if path else BASE_DIR / "precautions.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def prettify(folder_name):
    name = re.sub(r"_+", " ", folder_name).strip()
    name = re.sub(r"\s+photos?$", "", name, flags=re.IGNORECASE)
    return name


def describe(folder_name, precautions_data):
    """Return display name, precautions and doctor advice for a dataset class."""
    lowered = folder_name.lower()
    display, key = None, None
    for keywords, disp, k in LABEL_RULES:
        if all(word in lowered for word in keywords):
            display, key = disp, k
            break
    if display is None:
        display = prettify(folder_name)

    info = precautions_data.get(key) if key else None
    if info is None:
        info = precautions_data.get("_default", DEFAULT_INFO)

    return {
        "display_name": display,
        "precautions": info.get("precautions", []),
        "doctor_advice": info.get("doctor_advice", ""),
        "urgent": bool(info.get("urgent", False)),
    }
