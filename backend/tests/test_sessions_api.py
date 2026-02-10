"""Tests for session HTTP endpoints (src/api/sessions.py)."""

import pytest

from src.agent.session import SessionManager


@pytest.fixture
def sm():
    return SessionManager()


class TestListSessions:
    async def test_empty(self, client):
        res = await client.get("/api/sessions")
        assert res.status_code == 200
        assert res.json() == []

    async def test_with_data(self, client, async_db):
        sm = SessionManager()
        await sm.get_or_create("s1")
        await sm.get_or_create("s2")
        res = await client.get("/api/sessions")
        assert res.status_code == 200
        assert len(res.json()) == 2


class TestGetMessages:
    async def test_success(self, client, async_db):
        sm = SessionManager()
        await sm.get_or_create("s1")
        await sm.add_message("s1", "user", "hello")
        res = await client.get("/api/sessions/s1/messages")
        assert res.status_code == 200
        msgs = res.json()
        assert len(msgs) == 1
        assert msgs[0]["content"] == "hello"

    async def test_not_found(self, client):
        res = await client.get("/api/sessions/nonexistent/messages")
        assert res.status_code == 404


class TestUpdateTitle:
    async def test_success(self, client, async_db):
        sm = SessionManager()
        await sm.get_or_create("s1")
        res = await client.patch(
            "/api/sessions/s1",
            json={"title": "New Title"},
        )
        assert res.status_code == 200

    async def test_not_found(self, client):
        res = await client.patch(
            "/api/sessions/nonexistent",
            json={"title": "Nope"},
        )
        assert res.status_code == 404


class TestDeleteSession:
    async def test_success(self, client, async_db):
        sm = SessionManager()
        await sm.get_or_create("s1")
        res = await client.delete("/api/sessions/s1")
        assert res.status_code == 200

    async def test_not_found(self, client):
        res = await client.delete("/api/sessions/nonexistent")
        assert res.status_code == 404
