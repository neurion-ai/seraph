from src.agent.session import Session, SessionManager


class TestSession:
    def test_create_session(self):
        session = Session(session_id="test-1")
        assert session.session_id == "test-1"
        assert session.messages == []

    def test_add_message(self):
        session = Session(session_id="test-1")
        session.add_message("user", "Hello")
        session.add_message("assistant", "Hi there!")
        assert len(session.messages) == 2
        assert session.messages[0] == {"role": "user", "content": "Hello"}
        assert session.messages[1] == {"role": "assistant", "content": "Hi there!"}

    def test_get_history_text_empty(self):
        session = Session(session_id="test-1")
        assert session.get_history_text() == ""

    def test_get_history_text(self):
        session = Session(session_id="test-1")
        session.add_message("user", "Hello")
        session.add_message("assistant", "Hi!")
        history = session.get_history_text()
        assert "User: Hello" in history
        assert "Assistant: Hi!" in history


class TestSessionManager:
    def test_get_or_create_new(self):
        mgr = SessionManager()
        session = mgr.get_or_create()
        assert session.session_id
        assert len(mgr.list_sessions()) == 1

    def test_get_or_create_with_id(self):
        mgr = SessionManager()
        session = mgr.get_or_create("my-session")
        assert session.session_id == "my-session"

    def test_get_or_create_existing(self):
        mgr = SessionManager()
        s1 = mgr.get_or_create("s1")
        s1.add_message("user", "Hello")
        s2 = mgr.get_or_create("s1")
        assert s1 is s2
        assert len(s2.messages) == 1

    def test_get_existing(self):
        mgr = SessionManager()
        mgr.get_or_create("s1")
        assert mgr.get("s1") is not None

    def test_get_nonexistent(self):
        mgr = SessionManager()
        assert mgr.get("nope") is None

    def test_delete(self):
        mgr = SessionManager()
        mgr.get_or_create("s1")
        assert mgr.delete("s1") is True
        assert mgr.get("s1") is None

    def test_delete_nonexistent(self):
        mgr = SessionManager()
        assert mgr.delete("nope") is False

    def test_list_sessions(self):
        mgr = SessionManager()
        mgr.get_or_create("a")
        mgr.get_or_create("b")
        assert sorted(mgr.list_sessions()) == ["a", "b"]
