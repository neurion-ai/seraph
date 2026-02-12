import { useState, useRef, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  text: string;
  desc?: string;
  side?: "right" | "top" | "bottom" | "left";
  children: ReactNode;
}

const GAP = 8;

export function Tooltip({ text, desc, side = "top", children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const computePosition = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (side) {
      case "right":
        top = rect.top;
        left = rect.right + GAP;
        break;
      case "left":
        top = rect.top;
        left = rect.left - GAP;
        break;
      case "top":
        top = rect.top - GAP;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + GAP;
        left = rect.left + rect.width / 2;
        break;
    }

    setPos({ top, left });
  }, [side]);

  const show = () => {
    timer.current = setTimeout(() => {
      computePosition();
      setVisible(true);
    }, 300);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };

  // Determine transform based on side so the tooltip anchors correctly
  const transform =
    side === "left"
      ? "translate(-100%, 0)"
      : side === "top"
        ? "translate(-50%, -100%)"
        : side === "bottom"
          ? "translate(-50%, 0)"
          : undefined; // right: no transform needed

  return (
    <div ref={wrapperRef} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: pos.top,
              left: pos.left,
              width: "max-content",
              maxWidth: 260,
              transform,
            }}
          >
            <div className="bg-gray-950 border border-gray-600 rounded px-2.5 py-1.5 shadow-lg">
              <div className="text-xs text-gray-100 font-medium whitespace-nowrap">{text}</div>
              {desc && (
                <div className="text-[10px] text-gray-400 mt-0.5 leading-snug whitespace-normal">{desc}</div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
