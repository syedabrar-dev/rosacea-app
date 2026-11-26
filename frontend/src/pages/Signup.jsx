import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../config.js";

export default function Signup({ onSignedIn = () => {} }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Your passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || "We couldn't create your account. Please try again.");
        return;
      }
      onSignedIn(result.user);
      navigate("/");
    } catch {
      setError("Couldn't reach the DermaLens server. Make sure the Flask backend is running, then try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__intro">
          <span className="eyebrow">DERMALENS ACCOUNT</span>
          <h1>Create your account</h1>
          <p>Sign up to get started with DermaLens.</p>
        </div>

        {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
        <form className="form auth-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="signup-name">Full name</label>
            <input id="signup-name" name="name" autoComplete="name" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="signup-email">Email address</label>
            <input id="signup-email" name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" name="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required />
            <span className="auth-help">Use 8–128 characters.</span>
          </div>
          <div className="field">
            <label htmlFor="signup-confirm">Confirm password</label>
            <input id="signup-confirm" name="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </div>
          <button className="btn auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
            {!loading && <span aria-hidden="true">→</span>}
          </button>
          <p className="auth-privacy">Your password is sent to the DermaLens backend and stored as a hash. This account setup does not yet save scan history.</p>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>

        <Link className="auth-home" to="/">← Back to DermaLens</Link>
      </div>
    </section>
  );
}
