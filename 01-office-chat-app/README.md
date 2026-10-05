# 💬 Office Chat App

A real-time team chat application (Slack-style) built with **React** and **Node.js**.

## Features
- Multiple channels (#general, #random, #engineering, #announcements)
- Real-time messaging via WebSockets (Socket.io)
- Live online-presence list
- Typing indicators
- Join/leave system notifications

## Tech Stack
- **Frontend:** React 18, Vite, socket.io-client
- **Backend:** Node.js, Express, Socket.io (in-memory store)

## Getting Started

### 1. Start the backend
```bash
cd server
npm install
npm run dev   # http://localhost:4000
```

### 2. Start the frontend
```bash
cd client
npm install
npm run dev   # http://localhost:5173
```

Open two browser windows with different display names to see real-time chat in action.

## Project Structure
```
office-chat-app/
├── server/   # Express + Socket.io API
└── client/   # React + Vite UI
```

## Possible Extensions
- Persist messages in MongoDB/Postgres
- Direct messages between users
- File/image sharing
- Authentication (JWT / OAuth)
