import os

from smolagents import LiteLLMModel, ToolCallingAgent

from config.settings import settings
from src.tools.filesystem_tool import read_file, write_file
from src.tools.template_tool import fill_template
from src.tools.web_search_tool import web_search


def get_model() -> LiteLLMModel:
    """Create a LiteLLMModel configured for OpenRouter."""
    return LiteLLMModel(
        model_id=settings.default_model,
        api_key=settings.openrouter_api_key,
        api_base="https://openrouter.ai/api/v1",
        temperature=settings.model_temperature,
        max_tokens=settings.model_max_tokens,
    )


def get_tools() -> list:
    """Return the list of tools available to the agent."""
    return [read_file, write_file, web_search, fill_template]


def create_agent(additional_context: str = "") -> ToolCallingAgent:
    """Create a ToolCallingAgent with LiteLLM model and tools.

    Args:
        additional_context: Extra context (e.g. conversation history) to include
                           in the agent's system prompt.
    """
    model = get_model()
    tools = get_tools()

    system_prompt = (
        "You are Seraph, a helpful AI assistant. "
        "You can read and write files, search the web, and fill templates. "
        "Be concise and helpful in your responses."
    )
    if additional_context:
        system_prompt += f"\n\nConversation history:\n{additional_context}"

    agent = ToolCallingAgent(
        tools=tools,
        model=model,
        max_steps=settings.agent_max_steps,
        system_prompt=system_prompt,
    )
    return agent
