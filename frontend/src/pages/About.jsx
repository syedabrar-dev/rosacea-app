import { Link } from "react-router-dom";

const FACTS = [
  { value: "3", label: "skin condition classes" },
  { value: "395", label: "images in the held-out test split" },
  { value: "93.16%", label: "internal test accuracy*" },
];

const PRINCIPLES = [
  { icon: "◎", title: "Awareness first", text: "A scan can help you decide what to ask about. It cannot tell you what condition you have." },
  { icon: "⌕", title: "Clear about scope", text: "The current model covers acne, eczema and rosacea only." },
  { icon: "▤", title: "Evidence with context", text: "We share the prototype's test result alongside what that number can and cannot tell you." },
  { icon: "＋", title: "People before predictions", text: "A qualified healthcare professional is the right person to assess symptoms and make a diagnosis." },
];

const FAQ = [
  { q: "What can DermaLens screen for?", a: "The current image classifier has three labels: Acne, Eczema and Rosacea. It may still confuse these conditions with each other or with other skin concerns." },
  { q: "Does a scan diagnose a skin condition?", a: "No. DermaLens is an educational prototype for preliminary screening. A photo-based result is not a diagnosis, treatment recommendation or substitute for a clinician." },
  { q: "What does 93.16% mean?", a: "That was the accuracy on a 395-image held-out test split from the dataset used during development. It is an internal prototype result, not an independent clinical study or a measure of how often the app will be correct for an individual." },
  { q: "Are my uploaded photos saved?", a: "In the current app flow, the image is sent to the analysis server for prediction and is not written to the server's image storage. Avoid uploading images that identify you or that you do not wish to process." },
  { q: "What should I do if I am worried about a spot or rash?", a: "Arrange an assessment with a qualified healthcare professional, especially if a spot is changing, bleeding or not healing, or if a rash is painful, spreading or accompanied by other symptoms. Seek urgent help for severe symptoms." },
];

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="about__heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export default function About() {
  return (
    <div className="about">
      <section className="about-hero">
        <div className="wrap about-hero__inner">
          <span className="eyebrow">About DermaLens · AI-assisted skin screening</span>
          <h1>Skin awareness, with a clearer view of what AI can do.</h1>
          <p className="lede">DermaLens is a learning project exploring how image classification can support early skin awareness. It offers a first look at three common condition groups, while keeping the limits of an AI screening result in view.</p>
          <div className="about__actions">
            <Link className="btn" to="/detect">Explore a scan <span aria-hidden="true">→</span></Link>
            <Link className="btn btn--ghost" to="/contact">Contact us</Link>
          </div>
          <div className="about-hero__stats" aria-label="DermaLens prototype at a glance">
            {FACTS.map((fact) => <div className="about-stat" key={fact.label}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}
          </div>
          <p className="about-hero__note">*Internal test split result only. It is not clinical validation or a guarantee for an individual scan.</p>
        </div>
      </section>

      <nav className="about-toc" aria-label="About page sections">
        <div className="wrap about-toc__links">
          {[ ["glance", "Overview"], ["mission", "Our approach"], ["how-it-works", "How it works"], ["scope", "Scope"], ["evaluation", "Evaluation"], ["responsible-use", "Responsible use"], ["faq", "FAQ"] ].map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </div>
      </nav>

      <section className="about-section" id="glance">
        <div className="wrap">
          <article className="about-glance card">
            <div><span className="about-icon" aria-hidden="true">✳</span></div>
            <div>
              <h2>DermaLens at a glance</h2>
              <p className="about-muted">A small skin image-classification prototype, built to make the process and its limits understandable.</p>
              <div className="about-facts">
                <div><strong>PROJECT</strong><p>DermaLens is a prototype for exploring AI-assisted skin screening from an uploaded image.</p></div>
                <div><strong>SUPPORTED LABELS</strong><p>Acne, Eczema and Rosacea.</p></div>
                <div><strong>MODEL APPROACH</strong><p>Image classification with a MobileNetV2 transfer-learning model.</p></div>
                <div><strong>WHAT A RESULT IS</strong><p>A model's ranked image prediction, not a confirmed medical finding.</p></div>
                <div><strong>TEST CONTEXT</strong><p>395 held-out images from the development dataset were used for the reported internal evaluation.</p></div>
                <div><strong>WHO SHOULD USE IT</strong><p>Anyone curious about the prototype who understands that clinical concerns need professional care.</p></div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="about-section about-section--tint" id="mission">
        <div className="wrap">
          <div className="about-mission">
            <div>
              <SectionHeading eyebrow="Our approach" title="Skin tools should inform, not overpromise." text="Skin changes can be worrying. We want this prototype to make image-based AI easier to explore while being honest about what still needs a clinician's judgement." />
              <p>DermaLens takes a photo and compares it with patterns learned from labelled examples. The output can be a starting point for a conversation, but a photo alone cannot capture symptoms, medical history or an in-person examination.</p>
              <p>We are building with a simple principle: make the technology understandable, keep the scope visible, and encourage professional care when something concerns you.</p>
            </div>
            <aside className="about-quote card"><span>OUR PRINCIPLE</span><h3>“Helpful technology should make its limits easy to see.”</h3><p>AI can support awareness. People and qualified clinicians remain central to care.</p></aside>
          </div>
          <h3 className="about-principles__title">Principles behind the prototype</h3>
          <div className="about-principles">{PRINCIPLES.map((item) => <article className="about-card card" key={item.title}><span className="about-icon" aria-hidden="true">{item.icon}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
        </div>
      </section>

      <section className="about-section" id="how-it-works">
        <div className="wrap">
          <SectionHeading eyebrow="The experience" title="From photo to screening result" text="Three simple steps show how the current DermaLens prototype works." />
          <div className="about-steps">
            {[
              ["01", "Choose a photo", "Upload a clear image of the area you are concerned about. Good light and focus can help the model read the image."],
              ["02", "Model analyses it", "The classifier compares the image with patterns from its labelled training data and scores three supported classes."],
              ["03", "Review with care", "Read the result as an AI estimate. If you are concerned, use it as a prompt to speak with a healthcare professional."],
            ].map(([number, title, text]) => <article className="about-step card" key={number}><span className="about-step__number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <div className="about-scope"><strong>Current scope:</strong> Acne · Eczema · Rosacea <span>Other conditions are outside the model's supported classes.</span></div>
        </div>
      </section>

      <section className="about-section about-section--tint" id="scope">
        <div className="wrap">
          <SectionHeading eyebrow="What it covers" title="A focused first version" text="The current model has three output labels. It is not a general purpose skin checker." />
          <div className="about-condition-grid">
            {[
              ["01", "Acne", "An image label for acne-like patterns. Other causes of bumps or spots may look similar in a photo."],
              ["02", "Eczema", "An image label for eczema-like patterns. A clinician can assess symptoms, triggers and other possible causes."],
              ["03", "Rosacea", "An image label for rosacea-like patterns. The model may confuse redness with other skin concerns."],
            ].map(([n, title, text]) => <article className="about-card card" key={title}><span className="about-condition__number">{n}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <p className="about-condition-note">These are model classes, not confirmed diagnoses. The classifier does not assess every skin condition.</p>
        </div>
      </section>

      <section className="about-section">
        <div className="wrap">
          <SectionHeading eyebrow="The role of AI" title="A first step can still need a human." text="Image analysis can organise a visual pattern. It cannot replace the context and judgement that a healthcare professional brings." />
          <div className="about-care-path">
            {[
              ["01", "Notice a concern", "You choose a skin image to explore."],
              ["02", "AI offers a pattern", "The model scores its three supported labels."],
              ["03", "You review the limits", "The result is an estimate with uncertainty."],
              ["04", "Ask a professional", "A clinician assesses symptoms and history."],
              ["05", "Decide together", "A qualified professional guides care when needed."],
            ].map(([n, title, text]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <p className="about-care-note">DermaLens supports awareness only. It does not diagnose or recommend treatment.</p>
        </div>
      </section>

      <section className="about-section about-section--tint" id="evaluation">
        <div className="wrap">
          <SectionHeading eyebrow="Prototype evaluation" title="A useful result needs its context." text="We report the current test result transparently, without presenting it as clinical proof." />
          <div className="about-eval card">
            <div className="about-eval__score"><strong>93.16%</strong><span>accuracy on the held-out test split</span><small>395 images · 3 labels</small></div>
            <div className="about-eval__copy"><h3>What this number tells us</h3><p>On this internal split, the model predicted the dataset label correctly for about 93 out of every 100 test images. The classes were Acne, Eczema and Rosacea.</p><p>It does <strong>not</strong> show how the system performs across clinics, devices, populations or skin tones, and it does not estimate the chance that a particular person has a condition.</p></div>
          </div>
          <div className="about-caveats">
            <article className="about-card card"><h3>Not an independent study</h3><p>The held-out images came from the dataset used during development. This is not prospective or independent clinical validation.</p></article>
            <article className="about-card card"><h3>Image-level evaluation</h3><p>The split was made at image level, not by patient. Related images may therefore make this score more optimistic than a patient-separated evaluation.</p></article>
            <article className="about-card card"><h3>Three labels only</h3><p>Skin conditions can look alike in photos. The model may misclassify these classes or return a familiar label for something outside its scope.</p></article>
          </div>
        </div>
      </section>

      <section className="about-section" id="responsible-use">
        <div className="wrap">
          <SectionHeading eyebrow="Responsible use" title="Privacy, safety and honest boundaries" text="DermaLens is a prototype. Use it with care and keep a clinician involved when you have a health concern." />
          <div className="about-principles about-responsible">
            <article className="about-card card"><span className="about-icon" aria-hidden="true">⌑</span><h3>Photo handling</h3><p>The current app sends the chosen image to its analysis server for prediction and does not write it to image storage. Avoid sharing images you do not wish to process.</p></article>
            <article className="about-card card"><span className="about-icon" aria-hidden="true">⚕</span><h3>Professional care</h3><p>Do not delay medical advice because of a scan. A clinician can assess your symptoms, history and skin directly.</p></article>
            <article className="about-card card"><span className="about-icon" aria-hidden="true">◌</span><h3>Fairness is still being explored</h3><p>Performance may vary with image quality, lighting, skin tone and the examples represented in training data. The current score does not establish fairness across groups.</p></article>
            <article className="about-card card"><span className="about-icon" aria-hidden="true">!</span><h3>Urgent symptoms</h3><p>Seek prompt medical help for severe or rapidly worsening symptoms. The app is not an emergency service.</p></article>
          </div>
          <div className="about-disclaimer"><strong>Important:</strong> DermaLens provides AI-assisted screening for educational purposes. It does not diagnose, treat or prevent disease, and it is not a substitute for professional medical advice.</div>
        </div>
      </section>

      <section className="about-section about-section--tint" id="faq">
        <div className="wrap about-faq-wrap">
          <SectionHeading eyebrow="FAQ" title="Questions about DermaLens" text="A few clear answers about the prototype and its results." />
          <div className="about-faq">{FAQ.map((item) => <details key={item.q}><summary>{item.q}<span aria-hidden="true">＋</span></summary><p>{item.a}</p></details>)}</div>
        </div>
      </section>

      <section className="about-cta">
        <div className="wrap"><span className="eyebrow">Explore the prototype</span><h2>Curious how a scan works?</h2><p>See the image screening flow and keep its limitations in mind.</p><Link className="btn btn--light" to="/detect">Go to skin scan <span aria-hidden="true">→</span></Link></div>
      </section>
    </div>
  );
}
