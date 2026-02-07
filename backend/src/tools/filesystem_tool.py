import os
from pathlib import Path

from smolagents import tool

from config.settings import settings


def _safe_resolve(file_path: str) -> Path:
    """Resolve a file path ensuring it stays within the workspace directory."""
    workspace = Path(settings.workspace_dir).resolve()
    resolved = (workspace / file_path).resolve()
    if not str(resolved).startswith(str(workspace)):
        raise ValueError(f"Path traversal blocked: {file_path}")
    return resolved


@tool
def read_file(file_path: str) -> str:
    """Read the contents of a file within the workspace directory.

    Args:
        file_path: Relative path to the file within the workspace.

    Returns:
        The text contents of the file.
    """
    resolved = _safe_resolve(file_path)
    if not resolved.exists():
        return f"Error: File not found: {file_path}"
    if not resolved.is_file():
        return f"Error: Not a file: {file_path}"
    return resolved.read_text(encoding="utf-8")


@tool
def write_file(file_path: str, content: str) -> str:
    """Write content to a file within the workspace directory. Creates parent directories if needed.

    Args:
        file_path: Relative path to the file within the workspace.
        content: The text content to write to the file.

    Returns:
        A confirmation message.
    """
    resolved = _safe_resolve(file_path)
    resolved.parent.mkdir(parents=True, exist_ok=True)
    resolved.write_text(content, encoding="utf-8")
    return f"Successfully wrote {len(content)} characters to {file_path}"
