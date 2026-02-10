"""MCP (Model Context Protocol) server integration.

Manages connections to external MCP servers (e.g. Things3, GitHub) and exposes
their tools for use by the smolagents ToolCallingAgent.
"""

import logging

from smolagents import MCPClient

logger = logging.getLogger(__name__)


class MCPManager:
    """Connects to multiple named MCP servers and provides their tools."""

    def __init__(self) -> None:
        self._clients: dict[str, MCPClient] = {}
        self._tools: dict[str, list] = {}

    def connect(self, name: str, url: str) -> None:
        """Connect to a named MCP server via HTTP/SSE. Fails gracefully."""
        try:
            client = MCPClient({"url": url, "transport": "streamable-http"})
            tools = client.get_tools()
            self._clients[name] = client
            self._tools[name] = tools
            logger.info("Connected to MCP server '%s': %d tools loaded", name, len(tools))
        except Exception:
            logger.warning("Failed to connect to MCP server '%s' at %s", name, url, exc_info=True)

    def disconnect(self, name: str) -> None:
        """Disconnect a specific named MCP server."""
        client = self._clients.pop(name, None)
        self._tools.pop(name, None)
        if client:
            try:
                client.disconnect()
            except Exception:
                logger.warning("Error disconnecting MCP client '%s'", name, exc_info=True)

    def disconnect_all(self) -> None:
        """Disconnect all MCP servers."""
        for name in list(self._clients):
            self.disconnect(name)

    def get_tools(self) -> list:
        """Return a flat list of tools from all connected servers."""
        tools: list = []
        for server_tools in self._tools.values():
            tools.extend(server_tools)
        return tools

    def get_server_tools(self, name: str) -> list:
        """Return tools for a specific named server."""
        return self._tools.get(name, [])


mcp_manager = MCPManager()
