import type { ReactNode } from "react";

interface PixelBorderProps {
  children: ReactNode;
  className?: string;
  thin?: boolean;
}

export function PixelBorder({ children, className = "", thin = false }: PixelBorderProps) {
  return (
    <div className={`${thin ? "pixel-border-thin" : "pixel-border"} ${className}`}>
      {children}
    </div>
  );
}
