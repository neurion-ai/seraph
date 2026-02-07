import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.agent.factory import create_agent
from src.agent.session import session_manager
from src.models.schemas import WSMessage, WSResponse

logger = logging.getLogger(__name__)

router = APIRouter()


def _run_agent_streaming(agent, message: str):
    """Run agent with streaming in a synchronous context, yielding step strings."""
    for step in agent.run(message, stream=True):
        yield str(step)


@router.websocket("/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint for streaming chat responses."""
    await websocket.accept()

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
                ws_msg = WSMessage(**data)
            except (json.JSONDecodeError, Exception) as e:
                await websocket.send_text(
                    WSResponse(type="error", content=f"Invalid message: {e}").model_dump_json()
                )
                continue

            if ws_msg.type == "ping":
                await websocket.send_text(
                    WSResponse(type="pong", content="pong").model_dump_json()
                )
                continue

            session = session_manager.get_or_create(ws_msg.session_id)
            session.add_message("user", ws_msg.message)

            history = session.get_history_text()
            agent = create_agent(additional_context=history)

            step_num = 0
            final_result = ""

            try:

                def _stream():
                    return list(_run_agent_streaming(agent, ws_msg.message))

                steps = await asyncio.to_thread(_stream)

                for step_text in steps:
                    step_num += 1
                    final_result = step_text
                    await websocket.send_text(
                        WSResponse(
                            type="step",
                            content=step_text,
                            session_id=session.session_id,
                            step=step_num,
                        ).model_dump_json()
                    )

            except Exception as e:
                logger.exception("Agent streaming failed")
                await websocket.send_text(
                    WSResponse(
                        type="error",
                        content=f"Agent error: {e}",
                        session_id=session.session_id,
                    ).model_dump_json()
                )
                continue

            session.add_message("assistant", final_result)
            await websocket.send_text(
                WSResponse(
                    type="final",
                    content=final_result,
                    session_id=session.session_id,
                ).model_dump_json()
            )

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
