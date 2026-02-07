import { useChatStore } from "../../stores/chatStore";
import type { AgentAnimationState } from "../../types";

const ANIMATION_CLASS: Record<AgentAnimationState, string> = {
  idle: "animate-idle",
  thinking: "animate-think",
  walking: "animate-walk",
  "at-computer": "animate-type",
  "at-cabinet": "animate-search",
  "at-desk": "animate-write",
  speaking: "animate-idle",
};

export function Avatar() {
  const { animationState, positionX, facing } = useChatStore(
    (s) => s.agentVisual
  );

  const animClass = ANIMATION_CLASS[animationState] ?? "animate-idle";
  const scaleX = facing === "left" ? "-1" : "1";

  return (
    <div
      className="avatar-container absolute"
      style={{
        left: `${positionX}%`,
        bottom: "35%",
        transform: `translateX(-50%) scaleX(${scaleX})`,
      }}
    >
      <div className={animClass}>
        {/* Character body - pixel art placeholder */}
        <div className="relative w-8 h-12">
          {/* Head */}
          <div className="absolute top-0 left-1 w-6 h-5 bg-amber-200 border border-amber-300">
            {/* Eyes */}
            <div className="absolute top-1 left-1 w-1 h-1 bg-gray-800" />
            <div className="absolute top-1 right-1 w-1 h-1 bg-gray-800" />
            {/* Mouth - changes with state */}
            {animationState === "speaking" ? (
              <div className="absolute bottom-1 left-2 w-2 h-1 bg-red-400 rounded-full" />
            ) : (
              <div className="absolute bottom-1 left-2 w-2 h-[1px] bg-gray-600" />
            )}
          </div>
          {/* Hair */}
          <div className="absolute -top-1 left-0 w-8 h-2 bg-indigo-900 border-t border-indigo-800" />
          {/* Body / Robe */}
          <div className="absolute top-5 left-0 w-8 h-5 bg-indigo-700 border border-indigo-600">
            {/* Robe detail */}
            <div className="absolute inset-x-[3px] top-0 h-full border-x border-indigo-500/30" />
            {/* Belt */}
            <div className="absolute bottom-1 inset-x-0 h-[2px] bg-retro-border" />
          </div>
          {/* Legs */}
          <div className="absolute top-10 left-1 w-2 h-2 bg-gray-800" />
          <div className="absolute top-10 right-1 w-2 h-2 bg-gray-800" />
        </div>
        {/* Thought bubble for thinking state */}
        {animationState === "thinking" && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-thought">
            <div className="text-[10px] text-retro-highlight">?</div>
            <div className="absolute -bottom-1 left-1/2 w-1 h-1 bg-retro-highlight/40 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
