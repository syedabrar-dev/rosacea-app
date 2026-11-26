import { Link } from "react-router-dom";

const STEPS = [
  {
    title: "Upload a clear photo",
    text: "Upload one from your device or use your camera. A close-up in daylight works best.",
  },
  {
    title: "AI analyses the image",
    text: "A neural network trained on labelled skin images scores your photo against each condition group.",
  },
  {
    title: "Review your screening result",
    text: "You get the top three matches with confidence scores, care tips, and advice on when to see a doctor.",
  },
];

const CONDITIONS = [
  {
    name: "Acne and rosacea",
    text: "Red bumps, flushing and visible small blood vessels. The model treats these as one group, so it cannot tell them apart.",
  },
  {
    name: "Eczema",
    text: "Dry, itchy, inflamed patches that can crack or weep.",
  },
  {
    name: "Atopic dermatitis",
    text: "Long-lasting eczema that often starts in childhood and flares in cycles.",
  },
  {
    name: "Actinic keratosis and other malignant lesions",
    text: "Rough, sun-damaged patches and growths that can be pre-cancerous. These always need a doctor's check.",
  },
  {
    name: "Warts, molluscum and other viral infections",
    text: "Small raised growths that spread through skin contact.",
  },
  {
    name: "Lupus and other connective tissue diseases",
    text: "Autoimmune conditions that can show up as rashes, often across the cheeks and nose.",
  },
  {
    name: "Fungal infections",
    text: "Ringworm (tinea) and candidiasis: ring-shaped or moist, itchy patches.",
  },
];

const LIMITS = [
  {
    title: "It does not diagnose",
    text: "Results are a screening aid. Only a dermatologist can confirm a skin condition.",
  },
  {
    title: "It can be wrong",
    text: "Accuracy depends on the images the model learned from. It may be less reliable for rare conditions, poor lighting, and skin tones that were under-represented in the training data.",
  },
  {
    title: "Low confidence means doubt",
    text: "When the model is unsure, the result page says so. Treat those results as unreliable and retake the photo.",
  },
];

const FAQ = [
  {
    q: "Is my photo stored?",
    a: "No. The photo is sent to this app's server, analysed, and discarded. Nothing is saved.",
  },
  {
    q: "What does the confidence number mean?",
    a: "It shows how strongly the model favours one group over the others. It is not the chance that you have the condition.",
  },
  {
    q: "Why does it say Acne / Rosacea?",
    a: "The dataset the model learned from puts both conditions in a single group, so the model cannot separate them.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div>
            <span className="eyebrow">AI-assisted skin screening</span>
            <h1>Get to know your skin better.</h1>
            <p className="lede">
              Upload a clear image to receive preliminary AI-generated skin insights and practical
              guidance on what to do next.
            </p>
            <div className="hero__actions">
              <Link className="btn" to="/detect">Start skin analysis <span aria-hidden="true">→</span></Link>
              <a className="link" href="#how">See how it works</a>
            </div>
            <p className="hero__note">
              Private by design. Your photo is analysed and not saved by this app.
            </p>
            <div className="home-stats" aria-label="About this screening tool">
              <div className="home-stat"><strong>1 photo</strong><span>For each screening</span></div>
              <div className="home-stat"><strong>Top 3</strong><span>Model matches shown</span></div>
              <div className="home-stat"><strong>Private</strong><span>Photos are not retained</span></div>
            </div>
          </div>

          <div className="scope" aria-hidden="true">
            <div className="scope__patch" />
            <span className="scope__corner scope__corner--tl" />
            <span className="scope__corner scope__corner--tr" />
            <span className="scope__corner scope__corner--bl" />
            <span className="scope__corner scope__corner--br" />
            <div className="scope__scan" />
            <p className="scope__hint">Fill the frame with the affected area</p>
          </div>
        </div>
      </section>

      <section className="block" id="how">
        <div className="wrap">
          <div className="block__head">
            <span className="eyebrow">A simple first step</span>
            <h2>How it works</h2>
            <p>Get a preliminary screening insight in three clear steps.</p>
          </div>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="block__head">
            <span className="eyebrow">Model coverage</span>
            <h2>Skin condition groups</h2>
            <p>The current model compares your photo against these broad condition groups.</p>
          </div>
          <dl className="conditions">
            {CONDITIONS.map((c) => (
              <div className="conditions__row" key={c.name}>
                <dt>{c.name}</dt>
                <dd>{c.text}</dd>
              </div>
            ))}
          </dl>
          <p className="fineprint">The groups follow the dataset the model is trained on.</p>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2>What this tool can't do</h2>
          <div className="band__grid">
            {LIMITS.map((l) => (
              <div key={l.title}>
                <h3>{l.title}</h3>
                <p>{l.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="block__head">
            <span className="eyebrow">Good to know</span>
            <h2>Common questions</h2>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
