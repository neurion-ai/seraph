"""Tests for MCP manager (src/tools/mcp_manager.py)."""

from unittest.mock import MagicMock, patch

import pytest

from src.tools.mcp_manager import MCPManager


class TestMCPManager:
    def test_empty_init(self):
        mgr = MCPManager()
        assert mgr.get_tools() == []
        assert mgr._client is None

    @patch("src.tools.mcp_manager.MCPClient")
    def test_connect_success(self, MockMCPClient):
        mock_client = MagicMock()
        mock_client.get_tools.return_value = [MagicMock(name="tool1")]
        MockMCPClient.return_value = mock_client

        mgr = MCPManager()
        mgr.connect("http://localhost:9000/mcp")
        assert len(mgr.get_tools()) == 1
        assert mgr._client is not None

    @patch("src.tools.mcp_manager.MCPClient")
    def test_connect_failure(self, MockMCPClient):
        MockMCPClient.side_effect = ConnectionError("refused")

        mgr = MCPManager()
        mgr.connect("http://bad-url/mcp")
        assert mgr.get_tools() == []
        assert mgr._client is None

    @patch("src.tools.mcp_manager.MCPClient")
    def test_disconnect(self, MockMCPClient):
        mock_client = MagicMock()
        mock_client.get_tools.return_value = [MagicMock()]
        MockMCPClient.return_value = mock_client

        mgr = MCPManager()
        mgr.connect("http://localhost:9000/mcp")
        mgr.disconnect()
        assert mgr.get_tools() == []
        assert mgr._client is None
        mock_client.disconnect.assert_called_once()

    def test_get_tools_without_connect(self):
        mgr = MCPManager()
        assert mgr.get_tools() == []
