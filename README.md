# Skin Disease / Rosacea Detector

Flask backend + React (Vite) frontend. The model is MobileNetV2 transfer learning.

```
rosacea-app/
  backend/    app.py, train_model.py, skin_info.py, precautions.json, requirements.txt
  frontend/   Vite + React app
  data/       YOUR dataset (not included): data/train/<class folder>/*.jpg
```

## 1. Dataset

Put the dataset in `data/train/` with one sub-folder per class. If you also have
`data/test/` it is used as the test set, otherwise part of the training data is held out.

## 2. Backend setup (MacBook Air M1)

Use Python 3.10 or 3.11 (TensorFlow 2.15 does not support newer versions).

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env        # then paste a NEW Groq key into .env
```

If a pinned version fails to install, send the error message and fix the pin.

## 3. Train

```bash
python train_model.py --data ../data
```

- Plug in the laptop and close other apps. Expect roughly 30-90 minutes with Metal.
- If it is too slow, run the same script on Google Colab (free GPU) with
  `--data /content/data --out /content/output`, then download `skin_disease_model.keras`
  and `class_names.json` into the `backend/` folder.
- Training prints a per-class precision/recall/F1 report and saves `metrics.json`.
  Use those numbers in your report.

## 4. Run

Terminal 1:
```bash
cd backend && source .venv/bin/activate && python app.py
```
Terminal 2:
```bash
cd frontend && npm install && npm run dev
```
Open http://localhost:5173

Check http://127.0.0.1:5000/health: `model_loaded` should be `true`.

## Notes

- The "Acne and Rosacea Photos" dataset class combines both diseases, so the app shows
  "Acne / Rosacea" and cannot separate them. Say this in your report.
- Confidence shown is the real softmax probability. Results below 50% are flagged.
- Edit your contact details in `frontend/src/pages/Contact.jsx`.
- Revoke the old Groq key printed in the original report and never commit `.env`.
