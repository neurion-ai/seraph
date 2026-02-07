import { GameContainer } from "./components/layout/GameContainer";
import { SceneCanvas } from "./components/scene/SceneCanvas";
import { ChatPanel } from "./components/chat/ChatPanel";
import { useWebSocket } from "./hooks/useWebSocket";

export default function App() {
  const { sendMessage } = useWebSocket();

  return (
    <GameContainer>
      <SceneCanvas />
      <ChatPanel onSend={sendMessage} />
    </GameContainer>
  );
}
