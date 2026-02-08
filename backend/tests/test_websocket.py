import json
from unittest.mock import MagicMock, patch

import pytest
from starlette.testclient import TestClient


class TestWebSocket:
    def _get_sync_client(self):
        """Create a synchronous TestClient for WebSocket testing."""
        from src.app import create_app

        app = create_app()
        return TestClient(app)

    def test_websocket_ping(self):
        client = self._get_sync_client()
        with client.websocket_connect("/ws/chat") as ws:
            ws.send_text(json.dumps({"type": "ping"}))
            resp = json.loads(ws.receive_text())
            assert resp["type"] == "pong"

    @patch("src.api.ws.create_agent")
    def test_websocket_message(self, mock_create_agent):
        mock_agent = MagicMock()
        mock_agent.run.return_value = iter(["Step 1", "Final answer"])
        mock_create_agent.return_value = mock_agent

        client = self._get_sync_client()
        with client.websocket_connect("/ws/chat") as ws:
            ws.send_text(json.dumps({"type": "message", "message": "Hello"}))

            responses = []
            while True:
                resp = json.loads(ws.receive_text())
                responses.append(resp)
                if resp["type"] in ("final", "error"):
                    break

            assert any(r["type"] == "step" for r in responses)
            assert responses[-1]["type"] == "final"

    def test_websocket_invalid_json(self):
        client = self._get_sync_client()
        with client.websocket_connect("/ws/chat") as ws:
            ws.send_text("not json")
            resp = json.loads(ws.receive_text())
            assert resp["type"] == "error"
