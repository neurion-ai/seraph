import { useState, useEffect, useRef, useCallback } from "react";
import { getCharacters, getEnemies, getSpriteBasePath, type SpriteEntry } from "../lib/sprite-registry";
import { useEditorStore } from "../stores/editorStore";
import { useTilesetStore } from "../stores/tilesetStore";
import { Tooltip } from "./Tooltip";
import type { NPC } from "../types/editor";

type SpriteTab = "characters" | "enemies";

export function NPCBrowser({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [activeTab, setActiveTab] = useState<SpriteTab>("characters");
  const sprites = activeTab === "characters" ? getCharacters() : getEnemies();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-2 py-1 text-xs font-bold text-gray-300 border-b border-gray-700 flex items-center justify-between">
        <Tooltip text="NPCs" desc="Browse and place character and enemy sprites on the map." side="left">
          <span>NPCs</span>
        </Tooltip>
        <button onClick={onToggle} className="text-gray-500 hover:text-gray-300 text-[10px]">
          {collapsed ? "+" : "\u2212"}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 px-2 py-1 border-b border-gray-700">
            <Tooltip text="Characters" desc="212 characters (4 per sheet, 53 sheets). 24x24 frames." side="bottom">
              <button
                onClick={() => setActiveTab("characters")}
                className={`px-2 py-0.5 text-[10px] rounded ${
                  activeTab === "characters"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                }`}
              >
                Characters ({getCharacters().length})
              </button>
            </Tooltip>
            <Tooltip text="Enemies" desc={`${getEnemies().length} enemy sprites (24x24).`} side="bottom">
              <button
                onClick={() => setActiveTab("enemies")}
                className={`px-2 py-0.5 text-[10px] rounded ${
                  activeTab === "enemies"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                }`}
              >
                Enemies ({getEnemies().length})
              </button>
            </Tooltip>
          </div>

          {/* Sprite grid */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-4 gap-1 p-2">
              {sprites.map((sprite) => (
                <SpriteThumb key={sprite.name} sprite={sprite} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SpriteThumb({ sprite }: { sprite: SpriteEntry }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const basePath = getSpriteBasePath(sprite.spriteType);
  const imgPath = `${basePath}/${sprite.file}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loadAndDraw = async () => {
      try {
        const img = await useTilesetStore.getState().loadSpriteImage(imgPath);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = 48;
        canvas.width = size;
        canvas.height = size;

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, size, size);

        // Draw the first frame of this character (using colOffset for multi-char sheets)
        const sx = sprite.colOffset * sprite.frameWidth;
        const sy = 0; // row 0 = first direction
        const scale = Math.min(size / sprite.frameWidth, size / sprite.frameHeight);
        const dw = sprite.frameWidth * scale;
        const dh = sprite.frameHeight * scale;
        const dx = (size - dw) / 2;
        const dy = (size - dh) / 2;

        ctx.drawImage(
          img,
          sx, sy, sprite.frameWidth, sprite.frameHeight,
          dx, dy, dw, dh
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "load failed");
      }
    };

    loadAndDraw();
  }, [imgPath, sprite.frameWidth, sprite.frameHeight, sprite.colOffset]);

  const addNPC = useCallback(() => {
    const npc: NPC = {
      name: sprite.name,
      type: "npc",
      x: 256,
      y: 256,
      spriteSheet: sprite.file.replace(".png", ""),
      spriteType: sprite.spriteType,
      frameCol: sprite.colOffset,
      frameRow: 0,
    };
    useEditorStore.getState().addObject(npc);
  }, [sprite]);

  return (
    <Tooltip text={sprite.name} desc={error ?? `Click to place ${sprite.spriteType}. ${sprite.frameWidth}x${sprite.frameHeight}px frames.`} side="top">
      <button
        onClick={addNPC}
        className="flex flex-col items-center gap-0.5 p-1 rounded bg-gray-700/50 hover:bg-gray-600 transition-colors"
      >
        <canvas
          ref={canvasRef}
          width={48}
          height={48}
          className="w-12 h-12"
          style={{ imageRendering: "pixelated" }}
        />
        <span className={`text-[8px] truncate w-full text-center ${error ? "text-red-400" : "text-gray-400"}`}>
          {sprite.name.replace("Character_", "C").replace("Enemy", "E")}
        </span>
      </button>
    </Tooltip>
  );
}
