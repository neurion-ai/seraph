import { useCallback, useRef } from "react";
import { useChatStore } from "../stores/chatStore";
import {
  getToolTarget,
  getFacingDirection,
  getIdleState,
  getThinkingState,
} from "../lib/animationStateMachine";
import { WALK_DURATION_MS, SPEECH_DISPLAY_MS, POSITIONS } from "../config/constants";

export function useAgentAnimation() {
  const { agentVisual, setAgentVisual, resetAgentVisual } = useChatStore();
  const walkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
  }, []);

  const onThinking = useCallback(() => {
    clearTimers();
    const thinking = getThinkingState();
    const facing = getFacingDirection(agentVisual.positionX, thinking.positionX);

    if (agentVisual.positionX !== thinking.positionX) {
      setAgentVisual({
        animationState: "walking",
        positionX: thinking.positionX,
        facing,
        speechText: null,
      });
      walkTimerRef.current = setTimeout(() => {
        setAgentVisual({ animationState: "thinking" });
      }, WALK_DURATION_MS);
    } else {
      setAgentVisual({
        animationState: "thinking",
        speechText: null,
      });
    }
  }, [agentVisual.positionX, setAgentVisual, clearTimers]);

  const onToolDetected = useCallback(
    (toolName: string) => {
      clearTimers();
      const target = getToolTarget(toolName);
      if (!target) return;

      const currentX = useChatStore.getState().agentVisual.positionX;
      const facing = getFacingDirection(currentX, target.positionX);

      setAgentVisual({
        animationState: "walking",
        positionX: target.positionX,
        facing,
        speechText: null,
      });

      walkTimerRef.current = setTimeout(() => {
        setAgentVisual({ animationState: target.animationState });
      }, WALK_DURATION_MS);
    },
    [setAgentVisual, clearTimers]
  );

  const onFinalAnswer = useCallback(
    (answer: string) => {
      clearTimers();
      const currentX = useChatStore.getState().agentVisual.positionX;
      const idle = getIdleState();
      const facing = getFacingDirection(currentX, idle.positionX);

      setAgentVisual({
        animationState: "walking",
        positionX: idle.positionX,
        facing,
        speechText: null,
      });

      walkTimerRef.current = setTimeout(() => {
        const truncated =
          answer.length > 80 ? answer.slice(0, 80) + "..." : answer;
        setAgentVisual({
          animationState: "speaking",
          speechText: truncated,
        });

        speechTimerRef.current = setTimeout(() => {
          resetAgentVisual();
        }, SPEECH_DISPLAY_MS);
      }, WALK_DURATION_MS);
    },
    [setAgentVisual, resetAgentVisual, clearTimers]
  );

  const returnToIdle = useCallback(() => {
    clearTimers();
    const currentX = useChatStore.getState().agentVisual.positionX;
    const idle = getIdleState();
    const facing = getFacingDirection(currentX, idle.positionX);

    setAgentVisual({
      animationState: "walking",
      positionX: idle.positionX,
      facing,
    });

    walkTimerRef.current = setTimeout(() => {
      resetAgentVisual();
    }, WALK_DURATION_MS);
  }, [setAgentVisual, resetAgentVisual, clearTimers]);

  return {
    currentPosition: agentVisual.positionX,
    facingDirection: agentVisual.facing,
    animationState: agentVisual.animationState,
    onThinking,
    onToolDetected,
    onFinalAnswer,
    returnToIdle,
  };
}

// Re-export for convenience
export { POSITIONS };
