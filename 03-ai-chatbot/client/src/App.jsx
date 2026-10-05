import { useEffect, useRef, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const SUGGESTIONS = [
  "What are your prices?",
  "What are your support hours?",
  "How do I reset my password?",
  "Tell me a joke",
];

export default function App() {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem("chat_session") || null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const content = (text ?? draft).trim();
    if (!content) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", text: content }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: content }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      localStorage.setItem("chat_session", data.session_id);
      setMessages((m) => [...m, { role: "bot", text: data.reply, intent: data.intent }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "⚠️ Couldn't reach the server. Is the FastAPI backend running?" }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (sessionId) await fetch(`${API}/history/${sessionId}`, { method: "DELETE" });
    setMessages([]);
  };

  return (
    <div className="chatbot-shell">
      <div className="chatbot-window">
        <header>
          <div>
            <h1>🤖 Support Bot</h1>
            <span className="status">● Online</span>
          </div>
          <button onClick={clearChat}>Reset</button>
        </header>

        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome">
              <p>👋 Hi! I'm a demo support chatbot. Ask me anything, or try:</p>
              <div className="suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              {m.text}
            </div>
          ))}
          {loading && <div className="bubble bot typing">…</div>}
          <div ref={bottomRef} />
        </div>

        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="primary">Send</button>
        </form>
      </div>
    </div>
  );
}
