"""HTTP Request MCP Server — exposes a single http_request tool via FastMCP."""

import ipaddress
from urllib.parse import urlparse

import httpx
from fastmcp import FastMCP

mcp = FastMCP("http-request", port=9200)

_BLOCKED_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0", "[::1]"}


def _is_internal_url(url: str) -> bool:
    """Check if a URL points to an internal/private network address."""
    parsed = urlparse(url)
    hostname = parsed.hostname or ""

    if hostname in _BLOCKED_HOSTS:
        return True

    try:
        ip = ipaddress.ip_address(hostname)
        return ip.is_private or ip.is_loopback or ip.is_link_local
    except ValueError:
        pass

    if hostname.endswith((".local", ".internal", ".localhost")):
        return True

    return False


_ALLOWED_METHODS = {"GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"}


@mcp.tool()
def http_request(
    method: str,
    url: str,
    headers: dict[str, str] | None = None,
    body: str | None = None,
    timeout: int = 30,
) -> dict:
    """Make an HTTP request to an external URL.

    Args:
        method: HTTP method (GET, POST, PUT, DELETE, PATCH, HEAD)
        url: The URL to request
        headers: Optional request headers
        body: Optional request body (string)
        timeout: Request timeout in seconds (1-60, default 30)
    """
    method = method.upper()
    if method not in _ALLOWED_METHODS:
        return {"error": f"Invalid method '{method}'. Allowed: {', '.join(sorted(_ALLOWED_METHODS))}"}

    if _is_internal_url(url):
        return {"error": "Requests to internal/private network addresses are blocked"}

    timeout = max(1, min(60, timeout))

    try:
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            response = client.request(
                method=method,
                url=url,
                headers=headers,
                content=body,
            )
        return {
            "status": response.status_code,
            "headers": dict(response.headers),
            "body": response.text[:50000],  # Cap response size
        }
    except httpx.TimeoutException:
        return {"error": f"Request timed out after {timeout}s"}
    except httpx.RequestError as e:
        return {"error": f"Request failed: {e}"}


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
