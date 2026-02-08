import uuid
from dataclasses import dataclass, field


@dataclass
class Session:
    session_id: str
    messages: list[dict[str, str]] = field(default_factory=list)

    def add_message(self, role: str, content: str) -> None:
        self.messages.append({"role": role, "content": content})

    def get_history_text(self) -> str:
        """Return conversation history formatted for agent context."""
        if not self.messages:
            return ""
        lines = []
        for msg in self.messages:
            role = msg["role"].capitalize()
            lines.append(f"{role}: {msg['content']}")
        return "\n".join(lines)


class SessionManager:
    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}

    def get_or_create(self, session_id: str | None = None) -> Session:
        if session_id and session_id in self._sessions:
            return self._sessions[session_id]
        new_id = session_id or uuid.uuid4().hex
        session = Session(session_id=new_id)
        self._sessions[new_id] = session
        return session

    def get(self, session_id: str) -> Session | None:
        return self._sessions.get(session_id)

    def delete(self, session_id: str) -> bool:
        return self._sessions.pop(session_id, None) is not None

    def list_sessions(self) -> list[str]:
        return list(self._sessions.keys())


session_manager = SessionManager()
