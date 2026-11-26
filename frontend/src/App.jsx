import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Detect from "./pages/Detect.jsx";
import Contact from "./pages/Contact.jsx";
import About from "./pages/About.jsx";
import DermatologistReview from "./pages/DermatologistReview.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Chatbot from "./components/Chatbot.jsx";
import { API } from "./config.js";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (active && response.ok) setAuthUser(result.user);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setAuthChecked(true);
      });
    return () => { active = false; };
  }, []);

  return (
    <>
      <ScrollToTop />
      <header className={`nav ${pathname === "/contact" ? "nav--contact" : ""}`}>
        <div className="wrap nav__in">
          <NavLink to="/" className="brand" aria-label="DermaLens home">
            <span className="brand__mark" aria-hidden="true" />
            <span>DermaLens</span>
          </NavLink>
          <nav className="nav__links" aria-label="Main">
            <NavLink to="/" end>Home</NavLink>
            <details className={`nav__dropdown ${["/detect", "/dermatologist-review"].includes(pathname) ? "nav__dropdown--active" : ""}`}>
              <summary>Services <span aria-hidden="true">⌄</span></summary>
              <div className="nav__menu">
                <NavLink to="/detect" onClick={(event) => { event.currentTarget.closest("details").open = false; }}>AI Skin Scan</NavLink>
                <NavLink to="/dermatologist-review" onClick={(event) => { event.currentTarget.closest("details").open = false; }}>Dermatologist Review</NavLink>
              </div>
            </details>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {!authChecked ? (
              <span className="nav__auth-loading" aria-label="Checking account">…</span>
            ) : authUser ? (
              <NavLink to="/login" className="nav__account" aria-label={`Account for ${authUser.name}`}>
                Hi, {authUser.name}
              </NavLink>
            ) : (
              <NavLink to="/login">Sign in</NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detect" element={<Detect />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/dermatologist-review" element={<DermatologistReview />} />
          <Route path="/signup" element={<Signup onSignedIn={setAuthUser} />} />
          <Route path="/login" element={<Login onSignedIn={setAuthUser} />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="wrap footer__in">
          <span>© 2026 DermaLens</span>
          <span>AI-assisted screening. Not a medical diagnosis.</span>
        </div>
      </footer>

      <Chatbot />
    </>
  );
}
