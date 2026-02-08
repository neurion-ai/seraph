import asyncio
import logging

from fastapi import APIRouter, HTTPException

from src.agent.factory import create_agent
from src.agent.session import session_manager
from src.models.schemas import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message and receive an AI response."""
    session = session_manager.get_or_create(request.session_id)
    session.add_message("user", request.message)

    history = session.get_history_text()
    agent = create_agent(additional_context=history)

    try:
        result = await asyncio.to_thread(agent.run, request.message)
        # agent.run returns a FinalAnswerStep; extract its output
        response_text = str(result.output) if hasattr(result, "output") else str(result)
    except Exception as e:
        logger.exception("Agent execution failed")
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")

    session.add_message("assistant", response_text)

    return ChatResponse(
        response=response_text,
        session_id=session.session_id,
    )
