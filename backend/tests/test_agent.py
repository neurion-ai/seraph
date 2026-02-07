from unittest.mock import MagicMock, patch

from src.agent.factory import create_agent, get_model, get_tools


class TestAgentFactory:
    def test_get_tools_returns_list(self):
        tools = get_tools()
        assert len(tools) == 4
        tool_names = [t.name for t in tools]
        assert "read_file" in tool_names
        assert "write_file" in tool_names
        assert "web_search" in tool_names
        assert "fill_template" in tool_names

    @patch("src.agent.factory.LiteLLMModel")
    def test_get_model(self, mock_litellm_cls):
        mock_litellm_cls.return_value = MagicMock()
        model = get_model()
        mock_litellm_cls.assert_called_once()
        assert model is not None

    @patch("src.agent.factory.ToolCallingAgent")
    @patch("src.agent.factory.get_model")
    def test_create_agent(self, mock_get_model, mock_agent_cls):
        mock_get_model.return_value = MagicMock()
        mock_agent_cls.return_value = MagicMock()

        agent = create_agent()
        mock_agent_cls.assert_called_once()
        assert agent is not None

    @patch("src.agent.factory.ToolCallingAgent")
    @patch("src.agent.factory.get_model")
    def test_create_agent_with_context(self, mock_get_model, mock_agent_cls):
        mock_get_model.return_value = MagicMock()
        mock_agent_cls.return_value = MagicMock()

        create_agent(additional_context="User: Hello\nAssistant: Hi!")
        call_kwargs = mock_agent_cls.call_args[1]
        assert "Conversation history" in call_kwargs["system_prompt"]
        assert "User: Hello" in call_kwargs["system_prompt"]
