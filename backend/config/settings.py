from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openrouter_api_key: str = ""
    default_model: str = "openrouter/anthropic/claude-sonnet-4"
    model_temperature: float = 0.7
    model_max_tokens: int = 4096
    agent_max_steps: int = 10
    debug: bool = False
    workspace_dir: str = "/app/data"

    model_config = {"env_file": ".env.dev", "env_file_encoding": "utf-8"}


settings = Settings()
