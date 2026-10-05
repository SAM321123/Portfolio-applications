import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// In-memory state: channels, messages, online users
const channels = ["general", "random", "engineering", "announcements"];
const messagesByChannel = Object.fromEntries(channels.map((c) => [c, []]));
const onlineUsers = new Map(); // socket.id -> { username, channel }

app.get("/api/channels", (_req, res) => res.json(channels));

app.get("/api/messages/:channel", (req, res) => {
  const { channel } = req.params;
  res.json(messagesByChannel[channel] || []);
});

app.get("/api/online", (_req, res) => {
  res.json([...onlineUsers.values()]);
});

io.on("connection", (socket) => {
  socket.on("join", ({ username, channel }) => {
    onlineUsers.set(socket.id, { username, channel });
    socket.join(channel);
    io.to(channel).emit("system", {
      text: `${username} joined #${channel}`,
      ts: Date.now(),
    });
    io.emit("presence", [...onlineUsers.values()]);
  });

  socket.on("switch_channel", ({ username, from, to }) => {
    socket.leave(from);
    socket.join(to);
    const user = onlineUsers.get(socket.id);
    if (user) {
      user.channel = to;
      onlineUsers.set(socket.id, user);
    }
    io.emit("presence", [...onlineUsers.values()]);
  });

  socket.on("message", ({ username, channel, text }) => {
    const msg = { id: Date.now() + Math.random(), username, text, ts: Date.now() };
    if (!messagesByChannel[channel]) messagesByChannel[channel] = [];
    messagesByChannel[channel].push(msg);
    io.to(channel).emit("message", { channel, msg });
  });

  socket.on("typing", ({ username, channel }) => {
    socket.to(channel).emit("typing", { username });
  });

  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    if (user) {
      io.to(user.channel).emit("system", {
        text: `${user.username} left #${user.channel}`,
        ts: Date.now(),
      });
    }
    io.emit("presence", [...onlineUsers.values()]);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Office chat server running on :${PORT}`));
