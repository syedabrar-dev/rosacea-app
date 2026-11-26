import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { API } from "../config.js";

const GREETING = {
  role: "assistant",
  content: "Hi! Ask me about skin conditions or skin care. I can't diagnose, but I can explain.",
};

const SUGGESTIONS = ["What is rosacea?", "How do I care for eczema?", "When should I see a doctor?"];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(override) {
    const text = (override ?? input).trim();
    if (!text || loading) return;

    const history = messages.slice(1); // skip the greeting
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "No response." }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Can't reach the server. Check that the backend is running and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatbot">
      {open && (
        <div className="chatbox" role="dialog" aria-label="Skin assistant chat">
          <div className="chatbox__head">
            <span>Skin assistant</span>
            <button className="chatbox__close" onClick={() => setOpen(false)} aria-label="Close chat">
              ×
            </button>
          </div>

          <div className="chatbox__log">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === "assistant" ? "msg--bot" : "msg--user"}`}>
                {m.role === "assistant" ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chip" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {loading && <div className="msg msg--bot msg--typing">Thinking…</div>}
            <div ref={endRef} />
          </div>

          <form
            className="chatbox__form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question"
              aria-label="Your question"
            />
            <button type="submit" disabled={loading}>Send</button>
          </form>
        </div>
      )}

      <button
        className="chatbot__toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
        </svg>
      </button>
    </div>
  );
}
