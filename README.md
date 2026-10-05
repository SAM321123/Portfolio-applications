# Mini App Portfolio

Five self-contained full-stack mini apps, built to showcase **React** on the frontend paired with both a **Node.js** and a **Python** backend. Each app lives in its own folder with its own README, `client/` (React + Vite) and `server/` directory, and runs independently.

| # | App | Frontend | Backend | Highlights |
|---|-----|----------|---------|------------|
| 1 | [Office Chat App](./01-office-chat-app) | React + Vite | Node.js + Express + Socket.io | Real-time channels, presence, typing indicators |
| 2 | [Mini CRM](./02-mini-crm) | React + Vite | Node.js + Express | Contact/lead pipeline, search & filters, dashboard stats |
| 3 | [AI Chatbot](./03-ai-chatbot) | React + Vite | Python + FastAPI | Intent-based support bot, session history |
| 4 | [Task Kanban Board](./04-task-kanban-board) | React + Vite | Node.js + Express | Drag-and-drop board, priorities, reordering |
| 5 | [Expense Tracker Dashboard](./05-expense-tracker-dashboard) | React + Vite | Python + FastAPI + SQLAlchemy | Charts (Recharts), category/month analytics |

## Tech Stack Summary
- **Frontend (all apps):** React 18, Vite, plain CSS (no heavy UI framework, so the code is easy to read)
- **Node.js backends:** Express, REST APIs, JSON file storage via lowdb
- **Python backends:** FastAPI, Pydantic, SQLAlchemy/SQLite (expense tracker) or in-memory state (chatbot)
- **Real-time:** Socket.io (office chat app)

## Running an App
Each app folder has its own `server/` and `client/` — start the backend first, then the frontend, per that app's README:

```bash
cd 0X-app-name/server
npm install && npm run dev      # Node.js apps
# or
pip install -r requirements.txt && uvicorn main:app --reload   # Python apps

cd ../client
npm install && npm run dev
```

## Why These Projects
This set is designed to demonstrate range across a GitHub profile:
- Real-time systems (WebSockets)
- CRUD + REST API design
- Two backend ecosystems (Node.js and Python)
- State management and data visualization in React
- Practical, recognizable product types (chat, CRM, chatbot, kanban, dashboard) that are easy for reviewers to understand at a glance

## Suggested Next Steps
- Add automated tests (Jest/Vitest for React, pytest for FastAPI)
- Containerize each app with Docker + docker-compose
- Deploy demos (Vercel/Netlify for frontends, Render/Railway/Fly.io for backends)
- Swap file/SQLite storage for Postgres or MongoDB where relevant
- Add auth (JWT) to CRM, Kanban, and Chat apps
