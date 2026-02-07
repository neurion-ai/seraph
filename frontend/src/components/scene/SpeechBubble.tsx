import { useChatStore } from "../../stores/chatStore";

export function SpeechBubble() {
  const { speechText, positionX, animationState } = useChatStore(
    (s) => s.agentVisual
  );

  if (animationState !== "speaking" || !speechText) return null;

  return (
    <div
      className="absolute animate-speech"
      style={{
        left: `${positionX}%`,
        bottom: "58%",
        transform: "translateX(-50%)",
      }}
    >
      <div className="relative bg-retro-text text-retro-bg font-pixel text-[7px] px-3 py-2 max-w-48 leading-relaxed pixel-border-thin">
        {speechText}
        {/* Speech bubble tail */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "6px solid #e0e0e0",
          }}
        />
      </div>
    </div>
  );
}
