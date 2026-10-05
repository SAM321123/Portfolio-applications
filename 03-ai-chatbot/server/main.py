import uuid
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from bot import match_intent

app = FastAPI(title="AI Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory conversation store: session_id -> list[messages]
sessions: dict[str, list[dict]] = {}


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    intent: str
    history: list[dict]


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    history = sessions.setdefault(session_id, [])

    history.append({"role": "user", "text": req.message, "ts": datetime.utcnow().isoformat()})

    intent, reply = match_intent(req.message)

    history.append({"role": "bot", "text": reply, "ts": datetime.utcnow().isoformat()})

    return ChatResponse(session_id=session_id, reply=reply, intent=intent, history=history)


@app.get("/api/history/{session_id}")
def get_history(session_id: str):
    return {"session_id": session_id, "history": sessions.get(session_id, [])}


@app.delete("/api/history/{session_id}")
def clear_history(session_id: str):
    sessions.pop(session_id, None)
    return {"cleared": True}
