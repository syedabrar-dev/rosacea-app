import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../config.js";

export default function Login({ onSignedIn = () => {} }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (active && response.ok) {
          setUser(result.user);
          onSignedIn(result.user);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => { active = false; };
  }, [onSignedIn]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || "We couldn't sign you in. Please try again.");
        return;
      }
      setUser(result.user);
      onSignedIn(result.user);
      setPassword("");
      navigate("/");
    } catch {
      setError("Couldn't reach the DermaLens server. Make sure the Flask backend is running, then try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setError("");
    try {
      const response = await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Sign out failed.");
      setUser(null);
      onSignedIn(null);
      setPassword("");
    } catch {
      setError("Couldn't sign out. Please try again.");
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__intro">
          <span className="eyebrow">DERMALENS ACCOUNT</span>
          <h1>{user ? `Welcome, ${user.name}` : "Sign in to DermaLens"}</h1>
          <p>{user ? "You're signed in on this browser." : "Enter your account details to continue."}</p>
        </div>

        {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}

        {checkingSession ? <p className="auth-loading" role="status">Checking your session…</p> : user ? (
          <div className="auth-account">
            <div><span>Signed in as</span><strong>{user.email}</strong></div>
            <button className="btn auth-submit" type="button" onClick={signOut}>Sign out</button>
          </div>
        ) : (
          <form className="form auth-form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="login-email">Email address</label>
              <input id="login-email" name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <button className="btn auth-submit" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
            <p className="auth-switch">New to DermaLens? <Link to="/signup">Create an account</Link></p>
          </form>
        )}

        <Link className="auth-home" to="/">← Back to DermaLens</Link>
      </div>
    </section>
  );
}
