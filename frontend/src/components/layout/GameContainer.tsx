import type { ReactNode } from "react";

interface GameContainerProps {
  children: ReactNode;
}

export function GameContainer({ children }: GameContainerProps) {
  return (
    <div className="h-screen w-screen bg-[#0a0a1a] flex items-center justify-center">
      <div className="w-full h-full max-w-4xl max-h-[900px] flex flex-col overflow-hidden relative">
        {children}
        <div className="crt-overlay" />
      </div>
    </div>
  );
}
