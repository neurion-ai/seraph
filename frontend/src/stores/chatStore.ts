import { create } from "zustand";
import type {
  ChatMessage,
  ConnectionStatus,
  AgentVisualState,
} from "../types";

interface ChatStore {
  messages: ChatMessage[];
  sessionId: string | null;
  connectionStatus: ConnectionStatus;
  isAgentBusy: boolean;
  agentVisual: AgentVisualState;

  addMessage: (message: ChatMessage) => void;
  setSessionId: (id: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setAgentBusy: (busy: boolean) => void;
  setAgentVisual: (visual: Partial<AgentVisualState>) => void;
  resetAgentVisual: () => void;
}

const defaultVisual: AgentVisualState = {
  animationState: "idle",
  positionX: 50,
  facing: "right",
  speechText: null,
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  sessionId: null,
  connectionStatus: "disconnected",
  isAgentBusy: false,
  agentVisual: { ...defaultVisual },

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setSessionId: (id) => set({ sessionId: id }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setAgentBusy: (busy) => set({ isAgentBusy: busy }),

  setAgentVisual: (visual) =>
    set((state) => ({
      agentVisual: { ...state.agentVisual, ...visual },
    })),

  resetAgentVisual: () => set({ agentVisual: { ...defaultVisual } }),
}));
