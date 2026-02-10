import asyncio
import json
from contextlib import asynccontextmanager
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from starlette.testclient import TestClient


def _make_sync_client_with_db():
    """Create a sync TestClient with an in-memory DB patched in."""
    engine = create_async_engine("sqlite+aiosqlite://", connect_args={"check_same_thread": False})
    factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # Create tables using a fresh event loop
    loop = asyncio.new_event_loop()

    async def _init():
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)

    loop.run_until_complete(_init())
    loop.close()

    @asynccontextmanager
    async def _get_session():
        async with factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    targets = [
        "src.db.engine.get_session",
        "src.agent.session.get_session",
        "src.goals.repository.get_session",
        "src.api.profile.get_db",
    ]
    patches = [patch(t, _get_session) for t in targets]
    for p in patches:
        p.start()

    from src.app import create_app
    app = create_app()
    client = TestClient(app)
    return client, patches


class TestWebSocket:
    def test_websocket_ping(self):
        client, patches = _make_sync_client_with_db()
        try:
            with client.websocket_connect("/ws/chat") as ws:
                # The server sends a proactive welcome on connect; drain it
                _ = ws.receive_text()
                ws.send_text(json.dumps({"type": "ping"}))
                resp = json.loads(ws.receive_text())
                assert resp["type"] == "pong"
        finally:
            for p in patches:
                p.stop()

    def test_websocket_invalid_json(self):
        client, patches = _make_sync_client_with_db()
        try:
            with client.websocket_connect("/ws/chat") as ws:
                # Drain the welcome message
                _ = ws.receive_text()

                ws.send_text("not json")
                resp = json.loads(ws.receive_text())
                assert resp["type"] == "error"
        finally:
            for p in patches:
                p.stop()

    def test_websocket_skip_onboarding(self):
        client, patches = _make_sync_client_with_db()
        try:
            with client.websocket_connect("/ws/chat") as ws:
                _ = ws.receive_text()
                ws.send_text(json.dumps({"type": "skip_onboarding"}))
                resp = json.loads(ws.receive_text())
                assert resp["type"] == "final"
                assert "skipped" in resp["content"].lower()
        finally:
            for p in patches:
                p.stop()
