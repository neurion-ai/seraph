# Seraph AI Agent

An AI assistant with tool-calling capabilities, powered by smolagents and LiteLLM via OpenRouter.

## Quick Start

1. Set your OpenRouter API key in `.env.dev`:
   ```
   OPENROUTER_API_KEY=your-key-here
   ```

2. Start with Docker:
   ```bash
   ./manage.sh -e dev up -d
   ```

3. Verify:
   ```bash
   curl http://localhost:8004/health
   # Open http://localhost:3000 for the retro chat UI
   # Open http://localhost:8004/docs for Swagger UI
   ```

## Architecture

- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS, Zustand
- **Backend**: Python 3.12, FastAPI, uvicorn
- **AI**: smolagents ToolCallingAgent + LiteLLM (OpenRouter)
- **Tools**: File I/O, web search (DuckDuckGo), template filling
- **Infra**: Docker Compose, uv package manager

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components (scene, chat, ui)
│   ├── hooks/           # useWebSocket, useAgentAnimation
│   ├── stores/          # Zustand state management
│   ├── lib/             # Tool parser, animation state machine
│   ├── types/           # TypeScript interfaces
│   └── config/          # Constants and env vars

backend/
├── main.py              # Uvicorn entry point
├── config/settings.py   # Pydantic Settings (env vars)
├── src/
│   ├── app.py           # FastAPI app factory
│   ├── models/schemas.py
│   ├── api/             # REST + WebSocket endpoints
│   ├── agent/           # smolagents factory + sessions
│   └── tools/           # @tool implementations
└── tests/
```

## Management

```bash
./manage.sh -e dev up -d      # Start dev
./manage.sh -e dev down        # Stop
./manage.sh -e dev logs -f     # Tail logs
./manage.sh -e dev build       # Rebuild
```

See [backend/README.md](backend/README.md) for detailed API docs.
