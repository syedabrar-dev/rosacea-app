import { useState } from "react";
import { Link } from "react-router-dom";

const CONTACT = {
  email: "syedabrarhussain12613@gmail.com",
  phone: "7815851461",
  location: "Hyderabad, India",
};

const CONNECT = [
  { icon: "ⓘ", title: "About DermaLens", text: "Learn about the project, its AI scan and its current limitations.", to: "/about", link: "About the project" },
  { icon: "⌕", title: "AI Skin Scan", text: "Explore the image screening prototype for Acne, Eczema and Rosacea.", to: "/detect", link: "Open skin scan" },
  { icon: "⚕", title: "Dermatologist Review", text: "See the concept for a future clinician review service. Reviews are not available yet.", to: "/dermatologist-review", link: "View service preview" },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  function send(e) {
    e.preventDefault();
    const subject = `DermaLens: message from ${name}`;
    const body = `${message}\n\nFrom: ${name} (${from})`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function prepareCall() {
    setMessage("I'd like to arrange a call to discuss DermaLens.");
    window.setTimeout(() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero__inner wrap">
          <span className="contact-eyebrow">GET IN TOUCH</span>
          <h1>We'd Love to Hear From You</h1>
          <p>Whether you're exploring DermaLens, sharing feedback, or interested in the project, we're ready to hear from you.</p>
          <div className="contact-hero__actions">
            <a className="btn contact-btn-primary" href={`mailto:${CONTACT.email}`}><span aria-hidden="true">✉</span> Email Us</a>
            <a className="btn contact-btn-secondary" href="#contact-form" onClick={prepareCall}>Book a Call <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <section className="contact-methods" aria-label="Contact details">
        <div className="wrap contact-methods__grid">
          <article className="contact-method card"><span className="contact-method__icon" aria-hidden="true">✉</span><h2>Email</h2><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><p>Use the form below to draft a message</p></article>
          <article className="contact-method card"><span className="contact-method__icon" aria-hidden="true">⌕</span><h2>Phone</h2><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a><p>Call for project enquiries</p></article>
          <article className="contact-method card"><span className="contact-method__icon" aria-hidden="true">◷</span><h2>Project location</h2><strong>{CONTACT.location}</strong><p>Online project · response times may vary</p></article>
        </div>
      </section>

      <section className="contact-offices">
        <div className="wrap">
          <div className="contact-section-heading"><h2>Where to Find Us</h2><p>DermaLens is an independent project based in Hyderabad, India.</p></div>
          <div className="contact-office-grid">
            <article className="contact-office card">
              <div className="contact-office__map" aria-hidden="true"><span className="contact-map-pin">●</span><i className="contact-map-road contact-map-road--one" /><i className="contact-map-road contact-map-road--two" /><i className="contact-map-road contact-map-road--three" /></div>
              <div className="contact-office__body"><span className="contact-method__icon" aria-hidden="true">⌖</span><div><h3>Hyderabad · India</h3><p>Project base</p><p>DermaLens is developed as an online skin screening project.</p><a href={`mailto:${CONTACT.email}`}>✉ Contact by email</a></div></div>
            </article>
            <article className="contact-office card">
              <div className="contact-office__map contact-office__map--online" aria-hidden="true"><span className="contact-map-globe">◎</span><i className="contact-map-orbit contact-map-orbit--one" /><i className="contact-map-orbit contact-map-orbit--two" /></div>
              <div className="contact-office__body"><span className="contact-method__icon" aria-hidden="true">⌖</span><div><h3>Online · DermaLens</h3><p>Digital project</p><p>We currently connect through the website and email.</p><a href="#contact-form">✉ Send an enquiry</a></div></div>
            </article>
          </div>
        </div>
      </section>

      <section className="contact-connect">
        <div className="wrap"><div className="contact-section-heading"><h2>Other Ways to Connect</h2><p>Explore the project and its current tools before getting in touch.</p></div>
          <div className="contact-connect__grid">{CONNECT.map((item) => <article className="contact-connect__card card" key={item.title}><span className="contact-method__icon" aria-hidden="true">{item.icon}</span><div><h3>{item.title}</h3><p>{item.text}</p><Link to={item.to}>{item.link} <span aria-hidden="true">→</span></Link></div></article>)}</div>
        </div>
      </section>

      <section className="contact-form-section" id="contact-form">
        <div className="wrap contact-form-layout">
          <div><span className="contact-eyebrow">SEND A MESSAGE</span><h2>Tell us what's on your mind.</h2><p>Share a question, feedback, or an idea for DermaLens. Submitting opens a draft in your email app for you to review and send.</p><div className="contact-form-note"><strong>Privacy tip:</strong> Please don't email private medical images or use this form for urgent health concerns.</div></div>
          <form className="form contact-form" onSubmit={send}>
            <div className="field"><label htmlFor="name">Your name</label><input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></div>
            <div className="field"><label htmlFor="from">Your email</label><input id="from" type="email" value={from} onChange={(e) => setFrom(e.target.value)} autoComplete="email" required /></div>
            <div className="field"><label htmlFor="message">Message</label><textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required /></div>
            <button className="btn" type="submit">Open in email app <span aria-hidden="true">→</span></button>
            <p className="form__note">Your message isn't sent until you send it from your email app.</p>
          </form>
        </div>
      </section>

      <section className="contact-cta"><div className="wrap"><span>DERMALENS</span><h2>Let's make skin health easier to explore.</h2><p>Learn about the project or try the current AI scan prototype.</p><Link className="btn contact-cta__btn" to="/about">Explore DermaLens <span aria-hidden="true">→</span></Link></div></section>
    </div>
  );
}
