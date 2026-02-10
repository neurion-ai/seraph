"""Tests for MCP manager (src/tools/mcp_manager.py)."""

from unittest.mock import MagicMock, patch

import pytest

from src.tools.mcp_manager import MCPManager


class TestMCPManager:
    def test_empty_init(self):
        mgr = MCPManager()
        assert mgr.get_tools() == []
        assert mgr._clients == {}
        assert mgr._tools == {}

    @patch("src.tools.mcp_manager.MCPClient")
    def test_connect_success(self, MockMCPClient):
        mock_client = MagicMock()
        mock_client.get_tools.return_value = [MagicMock(name="tool1")]
        MockMCPClient.return_value = mock_client

        mgr = MCPManager()
        mgr.connect("things", "http://localhost:9000/mcp")
        assert len(mgr.get_tools()) == 1
        assert "things" in mgr._clients

    @patch("src.tools.mcp_manager.MCPClient")
    def test_connect_failure(self, MockMCPClient):
        MockMCPClient.side_effect = ConnectionError("refused")

        mgr = MCPManager()
        mgr.connect("things", "http://bad-url/mcp")
        assert mgr.get_tools() == []
        assert "things" not in mgr._clients

    @patch("src.tools.mcp_manager.MCPClient")
    def test_connect_multiple_servers(self, MockMCPClient):
        mock_client_a = MagicMock()
        mock_client_a.get_tools.return_value = [MagicMock(name="tool_a")]
        mock_client_b = MagicMock()
        mock_client_b.get_tools.return_value = [MagicMock(name="tool_b1"), MagicMock(name="tool_b2")]
        MockMCPClient.side_effect = [mock_client_a, mock_client_b]

        mgr = MCPManager()
        mgr.connect("things", "http://things:9100/mcp")
        mgr.connect("github", "http://github:8090/mcp")
        assert len(mgr.get_tools()) == 3
        assert len(mgr.get_server_tools("things")) == 1
        assert len(mgr.get_server_tools("github")) == 2

    @patch("src.tools.mcp_manager.MCPClient")
    def test_disconnect_one_server(self, MockMCPClient):
        mock_client_a = MagicMock()
        mock_client_a.get_tools.return_value = [MagicMock(name="tool_a")]
        mock_client_b = MagicMock()
        mock_client_b.get_tools.return_value = [MagicMock(name="tool_b")]
        MockMCPClient.side_effect = [mock_client_a, mock_client_b]

        mgr = MCPManager()
        mgr.connect("things", "http://things:9100/mcp")
        mgr.connect("github", "http://github:8090/mcp")
        mgr.disconnect("things")

        assert len(mgr.get_tools()) == 1
        assert mgr.get_server_tools("things") == []
        assert len(mgr.get_server_tools("github")) == 1
        mock_client_a.disconnect.assert_called_once()
        mock_client_b.disconnect.assert_not_called()

    @patch("src.tools.mcp_manager.MCPClient")
    def test_disconnect_all(self, MockMCPClient):
        mock_client_a = MagicMock()
        mock_client_a.get_tools.return_value = [MagicMock()]
        mock_client_b = MagicMock()
        mock_client_b.get_tools.return_value = [MagicMock()]
        MockMCPClient.side_effect = [mock_client_a, mock_client_b]

        mgr = MCPManager()
        mgr.connect("things", "http://things:9100/mcp")
        mgr.connect("github", "http://github:8090/mcp")
        mgr.disconnect_all()

        assert mgr.get_tools() == []
        assert mgr._clients == {}
        mock_client_a.disconnect.assert_called_once()
        mock_client_b.disconnect.assert_called_once()

    @patch("src.tools.mcp_manager.MCPClient")
    def test_get_tools_merges_all(self, MockMCPClient):
        tool1 = MagicMock(name="t1")
        tool2 = MagicMock(name="t2")
        tool3 = MagicMock(name="t3")

        mock_client_a = MagicMock()
        mock_client_a.get_tools.return_value = [tool1]
        mock_client_b = MagicMock()
        mock_client_b.get_tools.return_value = [tool2, tool3]
        MockMCPClient.side_effect = [mock_client_a, mock_client_b]

        mgr = MCPManager()
        mgr.connect("a", "http://a/mcp")
        mgr.connect("b", "http://b/mcp")

        merged = mgr.get_tools()
        assert merged == [tool1, tool2, tool3]

    def test_get_tools_without_connect(self):
        mgr = MCPManager()
        assert mgr.get_tools() == []

    def test_get_server_tools_unknown(self):
        mgr = MCPManager()
        assert mgr.get_server_tools("nonexistent") == []

    def test_disconnect_unknown_server(self):
        mgr = MCPManager()
        # Should not raise
        mgr.disconnect("nonexistent")
