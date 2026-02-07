"""Stub for future MCP (Model Context Protocol) server integration.

This module will eventually manage connections to MCP servers for
extended tool capabilities. For MVP, tools are implemented directly
using the @tool decorator from smolagents.
"""


class MCPManager:
    """Placeholder for MCP server connection management."""

    def __init__(self) -> None:
        self._servers: dict[str, dict] = {}

    def register_server(self, name: str, config: dict) -> None:
        """Register an MCP server configuration for future use."""
        self._servers[name] = config

    def list_servers(self) -> list[str]:
        return list(self._servers.keys())
