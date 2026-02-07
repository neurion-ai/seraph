from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title="Seraph AI Assistant",
        version="0.1.0",
        debug=settings.debug,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    from src.api.router import api_router

    app.include_router(api_router)

    return app
