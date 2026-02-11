"""Fire-and-forget background task tracking with error logging."""

import asyncio
import logging
from typing import Coroutine

logger = logging.getLogger(__name__)

_tasks: set[asyncio.Task] = set()


def track_task(coro: Coroutine, name: str = "background") -> asyncio.Task:
    """Create a tracked background task with automatic cleanup and error logging."""
    task = asyncio.create_task(coro, name=name)
    _tasks.add(task)

    def _done(t: asyncio.Task):
        _tasks.discard(t)
        if t.cancelled():
            return
        exc = t.exception()
        if exc:
            logger.error("Background task %r failed: %s", t.get_name(), exc, exc_info=exc)

    task.add_done_callback(_done)
    return task
