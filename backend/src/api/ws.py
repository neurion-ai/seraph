import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from smolagents import ActionStep, ToolCall, FinalAnswerStep

from src.agent.factory import create_agent
from src.agent.session import session_manager
from src.models.schemas import WSMessage, WSResponse

logger = logging.getLogger(__name__)

router = APIRouter()


def _run_agent(agent, message: str) -> list:
    """Run agent with streaming, collecting all step objects."""
    return list(agent.run(message, stream=True))


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
                steps = await asyncio.to_thread(_run_agent, agent, ws_msg.message)

                for step in steps:
                    if isinstance(step, ToolCall):
                        # Tool invocation — skip final_answer tool calls
                        if step.name == "final_answer":
                            continue
                        step_num += 1
                        content = f"Calling tool: {step.name}({json.dumps(step.arguments)})"
                        await websocket.send_text(
                            WSResponse(
                                type="step",
                                content=content,
                                session_id=session.session_id,
                                step=step_num,
                            ).model_dump_json()
                        )

                    elif isinstance(step, ActionStep):
                        # Completed step with observations (skip final-answer steps)
                        if step.observations and not step.is_final_answer:
                            step_num += 1
                            await websocket.send_text(
                                WSResponse(
                                    type="step",
                                    content=step.observations,
                                    session_id=session.session_id,
                                    step=step_num,
                                ).model_dump_json()
                            )

                    elif isinstance(step, FinalAnswerStep):
                        final_result = str(step.output)

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
