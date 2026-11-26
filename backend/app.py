"""Flask API for the skin disease / rosacea detector.

Endpoints
  GET  /health   -> {"status": "ok", "model_loaded": bool}
  POST /predict  -> multipart form field "photo", returns prediction JSON
  POST /chat     -> JSON {"message": str, "history": [{"role","content"}]}

The chatbot uses Google Gemini if GEMINI_API_KEY is set in backend/.env,
otherwise Groq if GROQ_API_KEY is set.
"""
import io
import json
import os
import secrets
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from PIL import Image, ImageOps, UnidentifiedImageError
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from skin_info import describe, load_precautions

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

MODEL_PATH = BASE_DIR / "skin_disease_model.keras"
CLASSES_PATH = BASE_DIR / "class_names.json"
IMG_SIZE = (224, 224)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

SYSTEM_PROMPT = (
    "You are a helpful assistant inside a skin disease screening app. "
    "Give general, educational information about skin conditions and skin care. "
    "You are not a doctor: never give a diagnosis or prescribe medication, and "
    "recommend seeing a dermatologist for anything serious or persistent. "
    "Keep answers short and clear."
)

DISCLAIMER = (
    "This tool is for educational screening only and is not a medical diagnosis. "
    "Please consult a qualified dermatologist."
)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8 MB uploads
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL", f"sqlite:///{(BASE_DIR / 'instance' / 'users.sqlite3').as_posix()}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
Path(app.instance_path).mkdir(parents=True, exist_ok=True)
secret_key = os.getenv("SECRET_KEY")
if not secret_key:
    secret_key_path = Path(app.instance_path) / ".session_key"
    if secret_key_path.exists():
        secret_key = secret_key_path.read_text(encoding="utf-8").strip()
    else:
        secret_key = secrets.token_urlsafe(48)
        secret_key_path.write_text(secret_key, encoding="utf-8")
        secret_key_path.chmod(0o600)
app.config["SECRET_KEY"] = secret_key
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.getenv("COOKIE_SECURE", "false").lower() == "true"
CORS_ORIGINS = os.getenv("CORS_ORIGINS")
if CORS_ORIGINS:
    allowed_origins = [origin.strip() for origin in CORS_ORIGINS.split(",") if origin.strip()]
else:
    # Vite may move to another local port when its default port is busy.
    allowed_origins = [r"^http://(localhost|127\.0\.0\.1)(:\d+)?$"]
CORS(
    app,
    origins=allowed_origins,
    supports_credentials=True,
)
db = SQLAlchemy(app)


class User(db.Model):
    """A registered DermaLens account. Passwords are stored only as hashes."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(254), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


with app.app_context():
    db.create_all()

precautions_data = load_precautions()
model = None
class_names = []


def load_model_assets():
    """Load the trained model and its class list. The API still starts without them."""
    global model, class_names
    if not MODEL_PATH.exists() or not CLASSES_PATH.exists():
        print(f"[warn] {MODEL_PATH.name} or {CLASSES_PATH.name} not found. "
              "Run train_model.py first. /predict will return 503 until then.")
        return
    import tensorflow as tf  # imported here so the chat endpoint works without TF

    model = tf.keras.models.load_model(MODEL_PATH)
    with open(CLASSES_PATH, encoding="utf-8") as f:
        class_names = json.load(f)
    print(f"[ok] Loaded model with {len(class_names)} classes.")


load_model_assets()


@app.errorhandler(413)
def too_large(_):
    return jsonify({"error": "Image is too large. Maximum size is 8 MB."}), 413


@app.get("/health")
def health():
    chat_provider = "gemini" if os.getenv("GEMINI_API_KEY") else (
        "groq" if os.getenv("GROQ_API_KEY") else None)
    return jsonify({"status": "ok", "model_loaded": model is not None,
                    "chat_provider": chat_provider})


@app.get("/")
def index():
    """Give a useful response when someone opens the backend URL directly."""
    return jsonify({
        "service": "DermaLens API",
        "status": "ok",
        "health": "/health",
        "auth": ["/auth/signup", "/auth/login", "/auth/me", "/auth/logout"],
    })


@app.post("/auth/signup")
def signup():
    """Create an account from JSON fields: name, email, and password."""
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({"error": "Send account details as JSON."}), 400

    name = str(body.get("name") or "").strip()
    email = str(body.get("email") or "").strip().lower()
    password = body.get("password")

    if not name or len(name) > 80:
        return jsonify({"error": "Enter your name (up to 80 characters)."}), 400
    if len(email) > 254 or "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        return jsonify({"error": "Enter a valid email address."}), 400
    if not isinstance(password, str) or len(password) < 8 or len(password) > 128:
        return jsonify({"error": "Password must be between 8 and 128 characters."}), 400

    existing = db.session.execute(
        db.select(User).where(User.email == email)
    ).scalar_one_or_none()
    if existing:
        return jsonify({"error": "An account with this email already exists."}), 409

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "An account with this email already exists."}), 409

    # Sign the user in immediately after successful registration.
    session.clear()
    session["user_id"] = user.id
    session.permanent = True

    return jsonify({
        "message": "Account created and signed in.",
        "user": {"id": user.id, "name": user.name, "email": user.email},
    }), 201


@app.post("/auth/login")
def login():
    """Verify credentials and start a seven-day browser session."""
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({"error": "Send your email and password as JSON."}), 400

    email = str(body.get("email") or "").strip().lower()
    password = body.get("password")
    if not email or not isinstance(password, str) or not password:
        return jsonify({"error": "Enter your email and password."}), 400

    user = db.session.execute(
        db.select(User).where(User.email == email)
    ).scalar_one_or_none()
    if user is None or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Email or password is incorrect."}), 401

    session.clear()
    session["user_id"] = user.id
    session.permanent = True
    return jsonify({
        "message": "You are signed in.",
        "user": {"id": user.id, "name": user.name, "email": user.email},
    })


@app.get("/auth/me")
def current_user():
    """Return the signed-in user, if the browser has a valid session cookie."""
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"error": "You are not signed in."}), 401

    user = db.session.get(User, user_id)
    if user is None:
        session.clear()
        return jsonify({"error": "You are not signed in."}), 401

    return jsonify({"user": {"id": user.id, "name": user.name, "email": user.email}})


@app.post("/auth/logout")
def logout():
    session.clear()
    return jsonify({"message": "You are signed out."})


@app.post("/predict")
def predict():
    if model is None:
        return jsonify({"error": "Model is not loaded. Train the model first."}), 503

    file = request.files.get("photo")
    if file is None or not file.filename:
        return jsonify({"error": "No file uploaded."}), 400
    if Path(file.filename).suffix.lower() not in ALLOWED_EXTENSIONS:
        return jsonify({"error": "Unsupported file type. Use a JPG, JPEG or PNG image."}), 400

    try:
        img = Image.open(io.BytesIO(file.read()))
        img = ImageOps.exif_transpose(img).convert("RGB").resize(IMG_SIZE)
    except (UnidentifiedImageError, OSError):
        return jsonify({"error": "Could not read the image. The file may be corrupted."}), 400

    # The model has its own rescaling layer, so it expects raw 0-255 pixel values.
    batch = np.asarray(img, dtype="float32")[np.newaxis, ...]
    probs = model.predict(batch, verbose=0)[0]

    top_idx = np.argsort(probs)[::-1][:3]
    best = int(top_idx[0])
    info = describe(class_names[best], precautions_data)
    top_confidence = float(probs[best])

    return jsonify({
        "predicted_disease": info["display_name"],
        "raw_label": class_names[best],
        "prediction_confidence": round(top_confidence * 100, 2),  # real softmax output, not a diagnosis probability
        "inconclusive": top_confidence < CONFIDENCE_THRESHOLD,
        "confident": top_confidence >= CONFIDENCE_THRESHOLD,
        "top_predictions": [
            {
                "label": describe(class_names[int(i)], precautions_data)["display_name"],
                "confidence": round(float(probs[int(i)]) * 100, 2),
            }
            for i in top_idx
        ],
        "precautions": info["precautions"],
        "doctor_advice": info["doctor_advice"],
        "urgent": info["urgent"],
        "disclaimer": DISCLAIMER,
    })


def clean_history(history):
    cleaned = []
    if not isinstance(history, list):
        return cleaned
    for item in history[-10:]:
        if not isinstance(item, dict):
            continue
        role, content = item.get("role"), item.get("content")
        if role in ("user", "assistant") and isinstance(content, str) and content.strip():
            cleaned.append({"role": role, "content": content[:2000]})
    return cleaned


def ask_gemini(api_key, history, message):
    contents = [
        {"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]}
        for m in history
    ]
    contents.append({"role": "user", "parts": [{"text": message}]})
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 600},
    }
    resp = None
    # Retry a few times when Google is overloaded (503) or rate-limiting (429).
    for attempt in range(4):
        resp = requests.post(
            GEMINI_URL.format(model=GEMINI_MODEL),
            headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
            json=payload,
            timeout=20,
        )
        if resp.status_code not in (429, 500, 503, 504):
            break
        print(f"[gemini] HTTP {resp.status_code}, retrying ({attempt + 1}/4)...")
        time.sleep(1.5 * (attempt + 1))
    if resp.status_code != 200:
        print(f"[gemini] HTTP {resp.status_code}: {resp.text[:300]}")
        return None
    candidates = resp.json().get("candidates") or []
    if not candidates:
        return "I can't answer that one. Please try rephrasing your question."
    parts = (candidates[0].get("content") or {}).get("parts") or []
    return "".join(p.get("text", "") for p in parts) or "No response."


def ask_groq(api_key, history, message):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history
    messages.append({"role": "user", "content": message})
    resp = requests.post(
        GROQ_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": GROQ_MODEL, "messages": messages, "temperature": 0.4, "max_tokens": 600},
        timeout=30,
    )
    if resp.status_code != 200:
        print(f"[groq] HTTP {resp.status_code}: {resp.text[:300]}")
        return None
    reply = (resp.json().get("choices") or [{}])[0].get("message", {}).get("content", "")
    return reply or "No response."


@app.post("/chat")
def chat():
    body = request.get_json(silent=True) or {}
    message = str(body.get("message") or "").strip()[:2000]
    if not message:
        return jsonify({"reply": "Please type a message."}), 400

    gemini_key = os.getenv("GEMINI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    if not gemini_key and not groq_key:
        return jsonify({"reply": "The chatbot is not configured yet. Add GEMINI_API_KEY to backend/.env."}), 503

    history = clean_history(body.get("history"))
    try:
        if gemini_key:
            reply = ask_gemini(gemini_key, history, message)
        else:
            reply = ask_groq(groq_key, history, message)
    except requests.RequestException:
        return jsonify({"reply": "Could not reach the AI service. Please try again."}), 502

    if reply is None:
        return jsonify({"reply": "The AI service returned an error. Check the backend terminal for details."}), 502
    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG") == "1",
    )
