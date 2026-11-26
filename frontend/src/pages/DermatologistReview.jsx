import { Link } from "react-router-dom";

const REVIEW_STEPS = [
  ["01", "Describe your concern", "Share what changed, when you noticed it and any symptoms you want to discuss."],
  ["02", "Add clear photos", "Photos can help explain a concern, but they cannot replace an in-person examination."],
  ["03", "Choose how to get help", "This page previews a possible service. DermaLens does not currently accept clinician-review requests."],
  ["04", "Discuss next steps", "A qualified dermatologist can provide advice after a real clinical review is available."],
];

const EXPERT_POINTS = [
  ["Image observations", "A clinician may describe visible features and what cannot be assessed from a photo."],
  ["Context and questions", "Your symptoms and history matter alongside an image."],
  ["Possible next steps", "A clinician can advise whether an in-person appointment or other care is appropriate."],
  ["Clear boundaries", "A photo review cannot provide a complete examination or guarantee a diagnosis."],
];

const DOCTORS = [
  { name: "Illustrative profile 01", role: "Dermatology profile concept", position: "0% 50%" },
  { name: "Illustrative profile 02", role: "Dermatology profile concept", position: "50% 50%" },
  { name: "Illustrative profile 03", role: "Dermatology profile concept", position: "100% 50%" },
];

const FAQ = [
  ["Can I request a paid dermatologist review now?", "No. This is a concept page for a possible future feature. DermaLens does not currently provide or accept paid dermatologist reviews."],
  ["Does the AI scan include a dermatologist?", "No. The AI scan is an automated image-classification prototype and is separate from a clinician's assessment."],
  ["Can a photo review diagnose me?", "A photo can provide limited context. A clinician decides whether an in-person examination or other assessment is needed."],
  ["What if I need urgent medical help?", "Do not use this website for urgent care. Contact local emergency services or seek immediate medical attention for severe or rapidly worsening symptoms."],
];

function ReviewHeading({ eyebrow, title, text }) {
  return <div className="review__heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

export default function DermatologistReview() {
  return (
    <div className="review-page">
      <section className="review-hero">
        <div className="wrap review-hero__inner">
          <span className="eyebrow">A future DermaLens service · Concept preview</span>
          <h1>Dermatologist Review — expert context for your skin concern.</h1>
          <p className="lede">A photo can start a conversation. A qualified clinician can help interpret what they see alongside your symptoms and history. This page previews that experience; clinician reviews are not available through DermaLens yet.</p>
          <div className="review-hero__actions"><Link className="btn" to="/detect">Start with an AI scan <span aria-hidden="true">→</span></Link><Link className="btn btn--ghost" to="/contact">Ask about future reviews</Link></div>
          <div className="review-trust-row"><span>◈ Concept preview</span><span>⌕ Photo-based context</span><span>♧ Clinician-led care matters</span></div>
        </div>
      </section>

      <section className="review-section review-section--compact">
        <div className="wrap review-availability">
          <div><span className="review-kicker">SERVICE STATUS</span><h2>Clinician review is not available yet</h2><p>This page is a design preview only. No payment, medical records or review request is collected here.</p></div>
          <Link className="btn btn--ghost" to="/detect">Try the current scan</Link>
        </div>
      </section>

      <section className="review-section">
        <div className="wrap">
          <ReviewHeading eyebrow="The difference" title="AI screening and expert review are different." text="An AI estimate is not a medical opinion. A clinician can consider context that a photo model cannot." />
          <div className="review-table-wrap"><table className="review-table"><thead><tr><th>What to expect</th><th>AI skin scan</th><th>Dermatologist review</th></tr></thead><tbody>
            <tr><th scope="row">Who responds</th><td>Automated image classifier</td><td>A qualified clinician, if a future service is established</td></tr>
            <tr><th scope="row">Information considered</th><td>Uploaded image</td><td>Photo plus relevant symptoms and history</td></tr>
            <tr><th scope="row">Current availability</th><td>Available as a prototype</td><td>Not currently available</td></tr>
            <tr><th scope="row">Can diagnose?</th><td>No</td><td>A photo-only review may still be limited; an in-person assessment may be needed</td></tr>
          </tbody></table></div>
          <p className="review-footnote">The dermatologist column describes a possible future service, not a DermaLens service currently being offered.</p>
        </div>
      </section>

      <section className="review-section review-section--tint">
        <div className="wrap review-two-col">
          <div><span className="eyebrow">A helpful first step</span><h2>Can an online dermatologist review help?</h2><p className="review-copy">A remote review may help you organise a non-urgent concern and understand whether further assessment is appropriate. It works best when paired with clear information about symptoms and timing.</p><p className="review-copy">A photo cannot show everything. If a clinician needs to examine the area in person, they should guide you to the right next step.</p><Link className="link" to="/about">Learn about the DermaLens prototype →</Link></div>
          <aside className="review-quick card"><span className="review-kicker">QUICK ANSWER</span><h3>Can a photo review replace a visit?</h3><p>No. A remote review can have limits, and it cannot replace an in-person examination when one is needed.</p><div><strong>Available today</strong><span>AI scan prototype only</span></div><div><strong>Not available yet</strong><span>Clinician review service</span></div></aside>
        </div>
      </section>

      <section className="review-section">
        <div className="wrap">
          <ReviewHeading eyebrow="Possible future flow" title="How a clinician review could work" text="This four-step outline is illustrative; DermaLens has not launched this service." />
          <div className="review-steps">{REVIEW_STEPS.map(([n, title, text]) => <article className="review-step card" key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>

      <section className="review-section review-section--tint">
        <div className="wrap">
          <ReviewHeading eyebrow="What an expert may add" title="More context, more thoughtful next steps" text="A clinician's comments should explain observations and uncertainty, not promise a particular diagnosis from a photo." />
          <div className="review-expert-grid">{EXPERT_POINTS.map(([title, text]) => <article className="review-expert card" key={title}><span aria-hidden="true">✓</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
          <div className="review-note"><strong>Current status:</strong> These are examples of possible review topics. No expert review or clinical commentary is being provided by this page.</div>
        </div>
      </section>

      <section className="review-section">
        <div className="wrap">
          <ReviewHeading eyebrow="Illustrative portraits" title="A clinician network would be built around qualified people." text="These generated portraits are visual placeholders only. They do not depict real DermaLens clinicians or represent verified qualifications." />
          <div className="review-doctors">{DOCTORS.map((doctor) => <article className="review-doctor card" key={doctor.name}><div className="review-doctor__portrait" role="img" aria-label={`AI-generated illustrative dermatologist portrait, ${doctor.name}`} style={{ backgroundPosition: doctor.position }} /><div className="review-doctor__info"><span>AI-GENERATED ILLUSTRATION</span><h3>{doctor.name}</h3><p>{doctor.role}</p><small>Not a real clinician · No affiliation implied</small></div></article>)}</div>
        </div>
      </section>

      <section className="review-section review-section--tint">
        <div className="wrap">
          <ReviewHeading eyebrow="Before sharing a photo" title="Simple photo tips" text="If you choose to use the current scan prototype, a clear image may be easier for the model to process." />
          <div className="review-guidelines">{[["Natural light", "Use even light and avoid strong shadows."], ["Close but comfortable", "Include the affected area and a little surrounding skin."], ["Steady and focused", "Hold the camera still and tap to focus."], ["Keep it private", "Avoid including your face or identifying details when possible."]].map(([title, text]) => <article className="review-guideline card" key={title}><span aria-hidden="true">✳</span><h3>{title}</h3><p>{text}</p></article>)}</div>
          <p className="review-footnote">Only upload an image if you are comfortable sending it to the app for processing. See the <Link to="/about">privacy and scope notes</Link>.</p>
        </div>
      </section>

      <section className="review-section">
        <div className="wrap review-limits">
          <div><ReviewHeading eyebrow="Important boundaries" title="Photo-based reviews have limits." text="Neither the current AI scan nor this concept page can examine your skin in person." /></div>
          <div className="review-limit-list"><p>⚠ A photo cannot show texture, tenderness or other examination findings reliably.</p><p>⚠ Image quality, lighting and skin tone may affect what can be seen.</p><p>⚠ An AI estimate may be wrong or may not include the condition you have.</p><p>⚠ A changing, bleeding or non-healing spot needs professional assessment.</p></div>
        </div>
      </section>

      <section className="review-emergency"><div className="wrap"><strong>Not for emergencies</strong><p>Do not wait for an online review if symptoms are severe, rapidly worsening, very painful, or accompanied by serious illness. Contact local emergency services or seek urgent medical care.</p></div></section>

      <section className="review-section review-section--tint" id="review-faq">
        <div className="wrap review-faq-wrap"><ReviewHeading eyebrow="FAQ" title="Dermatologist review questions" text="What this concept page does and does not offer." /><div className="review-faq">{FAQ.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">＋</span></summary><p>{answer}</p></details>)}</div></div>
      </section>

      <section className="review-cta"><div className="wrap"><span className="eyebrow">Explore DermaLens</span><h2>Start with the skin scan prototype</h2><p>Try the current AI image flow, or contact us with questions about future features.</p><div><Link className="btn btn--light" to="/detect">Go to AI scan <span aria-hidden="true">→</span></Link><Link className="review-cta__link" to="/contact">Contact DermaLens</Link></div></div></section>
    </div>
  );
}
