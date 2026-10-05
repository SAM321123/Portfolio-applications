import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
const CHANNELS = ["general", "random", "engineering", "announcements"];

export default function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [channel, setChannel] = useState("general");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [online, setOnline] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!joined) return;
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.emit("join", { username, channel });

    fetch(`${SERVER_URL}/api/messages/${channel}`)
      .then((r) => r.json())
      .then(setMessages);

    socket.on("message", ({ channel: c, msg }) => {
      if (c === channel) setMessages((m) => [...m, msg]);
    });
    socket.on("system", (msg) => {
      setMessages((m) => [...m, { ...msg, system: true, id: Math.random() }]);
    });
    socket.on("presence", setOnline);
    socket.on("typing", ({ username: u }) => {
      setTypingUser(u);
      setTimeout(() => setTypingUser(""), 1500);
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);

  const switchChannel = (to) => {
    if (to === channel) return;
    socketRef.current.emit("switch_channel", { username, from: channel, to });
    setChannel(to);
    setMessages([]);
    fetch(`${SERVER_URL}/api/messages/${to}`)
      .then((r) => r.json())
      .then(setMessages);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    socketRef.current.emit("message", { username, channel, text: draft.trim() });
    setDraft("");
  };

  const handleTyping = (value) => {
    setDraft(value);
    clearTimeout(typingTimeout.current);
    socketRef.current.emit("typing", { username, channel });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!joined) {
    return (
      <div className="login-screen">
        <form
          className="login-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) setJoined(true);
          }}
        >
          <h1>💬 Office Chat</h1>
          <p>Enter a display name to join the workspace</p>
          <input
            autoFocus
            placeholder="e.g. Sanjay"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit">Join workspace</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Channels</h2>
        <ul>
          {CHANNELS.map((c) => (
            <li
              key={c}
              className={c === channel ? "active" : ""}
              onClick={() => switchChannel(c)}
            >
              # {c}
            </li>
          ))}
        </ul>
        <h2>Online ({online.length})</h2>
        <ul className="online-list">
          {online.map((u, i) => (
            <li key={i}>
              <span className="dot" /> {u.username}
            </li>
          ))}
        </ul>
      </aside>

      <main className="chat-panel">
        <header>
          <h3># {channel}</h3>
        </header>
        <div className="messages">
          {messages.map((m) => (
            <div key={m.id} className={m.system ? "system-msg" : "msg"}>
              {m.system ? (
                <em>{m.text}</em>
              ) : (
                <>
                  <span className="author">{m.username}</span>
                  <span className="text">{m.text}</span>
                </>
              )}
            </div>
          ))}
          {typingUser && <div className="typing">{typingUser} is typing…</div>}
          <div ref={bottomRef} />
        </div>
        <form className="composer" onSubmit={sendMessage}>
          <input
            value={draft}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={`Message #${channel}`}
          />
          <button type="submit">Send</button>
        </form>
      </main>
    </div>
  );
}
