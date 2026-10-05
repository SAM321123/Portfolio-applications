"""
Lightweight rule/intent-based chatbot engine.

Not backed by an LLM on purpose, so the project runs fully offline with
zero API keys. Swap `match_intent` for a call to an LLM provider (OpenAI,
Anthropic, etc.) to upgrade it to a generative assistant.
"""
import random
import re
from dataclasses import dataclass, field
from typing import Callable


@dataclass
class Intent:
    name: str
    patterns: list[str]
    responses: list[str]
    handler: Callable[[re.Match, str], str] | None = None


def _rand(responses: list[str]) -> str:
    return random.choice(responses)


INTENTS: list[Intent] = [
    Intent(
        "greeting",
        [r"\b(hi|hello|hey|good morning|good evening)\b"],
        [
            "Hey there! 👋 How can I help you today?",
            "Hello! What can I do for you?",
            "Hi! Ask me about our pricing, hours, or support — or just chat.",
        ],
    ),
    Intent(
        "farewell",
        [r"\b(bye|goodbye|see you|later)\b"],
        ["Goodbye! Have a great day. 👋", "See you soon!"],
    ),
    Intent(
        "thanks",
        [r"\b(thanks|thank you|appreciate it)\b"],
        ["You're welcome!", "Anytime! Let me know if there's anything else."],
    ),
    Intent(
        "bot_identity",
        [r"\b(who are you|what are you|your name)\b"],
        ["I'm a demo support chatbot built with FastAPI + React. I can answer FAQs and chat a bit!"],
    ),
    Intent(
        "pricing",
        [r"\b(price|pricing|cost|how much)\b"],
        [
            "We offer three plans: Free ($0), Pro ($19/mo), and Team ($49/mo). "
            "Want details on a specific plan?"
        ],
    ),
    Intent(
        "hours",
        [r"\b(hours|open|support hours|available)\b"],
        ["Our support team is available Monday–Friday, 9am–6pm IST."],
    ),
    Intent(
        "contact",
        [r"\b(contact|email|phone|reach you)\b"],
        ["You can reach us at support@example.com or through the in-app chat."],
    ),
    Intent(
        "help",
        [r"\b(help|what can you do|options)\b"],
        [
            "I can help with: pricing info, support hours, contact details, "
            "and general questions. Try asking 'what are your prices?' or 'how do I reset my password?'"
        ],
    ),
    Intent(
        "reset_password",
        [r"\b(reset|forgot).*(password)\b"],
        ["To reset your password, go to Settings → Security → Reset Password, or click 'Forgot password' on the login page."],
    ),
    Intent(
        "bug_report",
        [r"\b(bug|error|not working|broken|crash)\b"],
        ["Sorry to hear that! Please describe the issue and I'll log a support ticket for our team."],
    ),
    Intent(
        "joke",
        [r"\b(joke|funny)\b"],
        [
            "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
            "I would tell you a UDP joke, but you might not get it.",
        ],
    ),
]

FALLBACKS = [
    "I'm not sure I understood that — could you rephrase?",
    "Hmm, I don't have an answer for that yet. Try asking about pricing, support hours, or say 'help'.",
    "Sorry, I didn't catch that. Type 'help' to see what I can do.",
]


def match_intent(message: str) -> tuple[str, str]:
    """Return (intent_name, response) for a user message."""
    text = message.lower().strip()
    for intent in INTENTS:
        for pattern in intent.patterns:
            m = re.search(pattern, text)
            if m:
                if intent.handler:
                    return intent.name, intent.handler(m, text)
                return intent.name, _rand(intent.responses)
    return "fallback", _rand(FALLBACKS)
