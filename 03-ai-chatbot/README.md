# 🤖 AI Support Chatbot

A chat widget-style support assistant built with **React** and **Python (FastAPI)**. Uses a lightweight intent-matching engine so it runs fully offline with zero API keys — the engine is structured so it's easy to swap in an LLM (OpenAI/Anthropic) for generative responses.

## Features
- Chat widget UI with typing indicator and quick-reply suggestions
- Intent detection (pricing, support hours, password reset, bug reports, jokes, etc.)
- Per-session conversation history (server-side, in-memory)
- Reset conversation button

## Tech Stack
- **Frontend:** React 18, Vite
- **Backend:** Python, FastAPI, Uvicorn

## Getting Started

### 1. Start the backend
```bash
cd server
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Start the frontend
```bash
cd client
npm install
npm run dev   # http://localhost:5175
```

## API Overview
| Method | Endpoint                  | Description             |
|--------|-----------------------------|---------------------------|
| POST   | /api/chat                    | Send a message, get a reply |
| GET    | /api/history/{session_id}    | Fetch conversation history |
| DELETE | /api/history/{session_id}    | Clear a conversation       |

## Upgrading to a real LLM
Replace `match_intent()` in `server/bot.py` with a call to your model
provider of choice (pass the running `history` as context for multi-turn
conversations).

## Possible Extensions
- Streaming responses (Server-Sent Events)
- Persist conversations to a database
- RAG over a knowledge base / FAQ docs
- Multi-language support
