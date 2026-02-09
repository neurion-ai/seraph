import type { ReactNode } from "react";

interface DialogFrameProps {
  children: ReactNode;
  title?: string;
  className?: string;
  onMaximize?: () => void;
  maximized?: boolean;
}

export function DialogFrame({ children, title, className = "", onMaximize, maximized }: DialogFrameProps) {
  return (
    <div className={`rpg-frame p-3 ${className}`}>
      {title && (
        <div className="absolute -top-3 left-4 bg-retro-panel px-2 text-retro-border text-[10px] uppercase tracking-wider">
          {title}
        </div>
      )}
      {onMaximize && (
        <button
          onClick={onMaximize}
          className="absolute -top-3 right-4 bg-retro-panel px-2 text-retro-border hover:text-retro-highlight text-[10px] uppercase tracking-wider transition-colors"
          title={maximized ? "Minimize" : "Maximize"}
        >
          {maximized ? "▼" : "▲"}
        </button>
      )}
      {children}
    </div>
  );
}
