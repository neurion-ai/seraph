from fastapi import APIRouter

from src.api.chat import router as chat_router
from src.api.ws import router as ws_router

api_router = APIRouter()

api_router.include_router(chat_router, prefix="/api", tags=["chat"])
api_router.include_router(ws_router, prefix="/ws", tags=["websocket"])
