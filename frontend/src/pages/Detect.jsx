import { useEffect, useRef, useState } from "react";
import { API } from "../config.js";

const MAX_MB = 8;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

const TIPS = [
  "Use daylight or a bright, even light.",
  "Hold the camera 20 to 30 cm from the skin.",
  "Fill the frame with the affected area.",
  "Keep the photo sharp. Rest your hand on something steady.",
  "Skip filters, makeup and flash.",
];

export default function Detect() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [dragging, setDragging] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const resultRef = useRef(null);

  // Preview URL for the chosen image
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Attach the camera stream once the <video> element exists
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

  // Bring the result into view when it arrives
  useEffect(() => {
    if (result && resultRef.current) {
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultRef.current.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    }
  }, [result]);

  // Stop the camera when leaving the page
  useEffect(() => () => stopCamera(), []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  }

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setError("The camera is blocked or unavailable. Allow camera access in your browser, or upload a photo instead.");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
        setResult(null);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  }

  function acceptFile(picked) {
    if (!picked) return;
    if (!ALLOWED_TYPES.has(picked.type.toLowerCase())) {
      setError("Choose a JPG, JPEG or PNG photo.");
      return;
    }
    if (picked.size > MAX_MB * 1024 * 1024) {
      setError(`That photo is larger than ${MAX_MB} MB. Choose a smaller one.`);
      return;
    }
    setError("");
    setResult(null);
    setFile(picked);
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError("");
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(`${API}/predict`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The scan failed. Try again.");
      setResult(data);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Can't reach the server. Start the backend (python app.py) and try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap detect">
      <header className="page-head">
        <span className="eyebrow">DermaLens screening</span>
        <h1>Upload your skin image</h1>
        <p className="lede">
          Add one clear photo of the area you want to check. The AI will compare it with the
          condition groups supported by this model and offer preliminary guidance.
        </p>
      </header>

      <div className="detect__grid">
        <aside className="tips">
          <h2>Photo tips</h2>
          <ul>
            {TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p>Your photo is analysed by this app's server and is not saved.</p>
        </aside>

        <div>
          <div className="stage">
            {cameraOn ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted />
                <div className="stage__row">
                  <button className="btn" onClick={capture}>Take photo</button>
                  <button className="btn btn--ghost" onClick={stopCamera}>Cancel</button>
                </div>
              </>
            ) : preview ? (
              <>
                <img className="preview" src={preview} alt="The photo you chose" />
                <div className="stage__row">
                  <button className="btn" onClick={analyze} disabled={loading}>
                    {loading ? "Analysing…" : "Analyse photo"}
                  </button>
                  <button className="btn btn--ghost" onClick={reset} disabled={loading}>
                    Choose another photo
                  </button>
                </div>
              </>
            ) : (
              <>
                <label
                  className={`drop${dragging ? " drop--over" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    acceptFile(e.dataTransfer.files?.[0]);
                  }}
                >
                  <input
                    className="sr-only"
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={(e) => acceptFile(e.target.files?.[0])}
                  />
                  <strong>Drop your photo here or browse files</strong>
                  <span>JPG, JPEG or PNG · up to {MAX_MB} MB</span>
                </label>
                <p className="stage__or">Or take a photo now:</p>
                <button className="btn btn--ghost" onClick={startCamera}>Use camera</button>
              </>
            )}
            {loading && (
              <div className="analysis-status" role="status" aria-live="polite">
                <span className="analysis-spinner" aria-hidden="true" />
                <div><strong>Analysing your image</strong><span>The AI model is processing your photo. Please wait for the result.</span></div>
              </div>
            )}
          </div>

          {error && <p className="alert" role="alert">{error}</p>}
        </div>
      </div>

      {result && (
        <section className="result" ref={resultRef} aria-live="polite">
          <div className="result__grid">
            <div>
              <p className="result__label">AI screening result · Closest match</p>
              <h2 className="result__name">{result.predicted_disease}</h2>
              <p className="result__conf">Model confidence: {result.prediction_confidence}%</p>
              <p className="result__hint">
                How strongly the model favours this group. It isn't the chance that you have the
                condition.
              </p>

              {!result.confident && (
                <div className="notice">
                  <p>
                    The model isn't sure about this photo. Treat the result as unreliable and try a
                    clearer, well-lit photo.
                  </p>
                </div>
              )}
              {result.urgent && (
                <div className="notice notice--urgent">
                  <p>
                    This result can relate to a condition that needs a doctor's attention. Book an
                    appointment soon.
                  </p>
                </div>
              )}

              <h3>Other possible matches</h3>
              <ul className="bars">
                {result.top_predictions.map((p) => (
                  <li key={p.label}>
                    <span>{p.label}</span>
                    <span className="bars__track">
                      <span className="bars__fill" style={{ width: `${p.confidence}%` }} />
                    </span>
                    <span>{p.confidence}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3>General care guidance</h3>
              <ul className="list">
                {result.precautions.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>

              <h3>When to see a doctor</h3>
              <p>{result.doctor_advice}</p>

              <p className="result__fine">{result.disclaimer}</p>
              <button className="btn btn--ghost" onClick={reset}>Scan another photo</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
