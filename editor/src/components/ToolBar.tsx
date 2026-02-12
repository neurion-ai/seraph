import { useEditorStore } from "../stores/editorStore";
import { Tooltip } from "./Tooltip";
import type { EditorTool } from "../types/editor";

const TOOLS: Array<{ id: EditorTool; label: string; icon: string; shortcut: string; desc: string }> = [
  { id: "hand", label: "Hand", icon: "\u270B", shortcut: "P", desc: "Pan the map by clicking and dragging. Also works with Space+drag or middle-click." },
  { id: "brush", label: "Brush", icon: "\u270E", shortcut: "B", desc: "Paint tiles on the active layer. Select tiles from the tileset panel first." },
  { id: "eraser", label: "Eraser", icon: "\u2716", shortcut: "E", desc: "Remove tiles from the active layer by clicking or dragging." },
  { id: "fill", label: "Fill", icon: "\u25A7", shortcut: "G", desc: "Flood-fill a connected area with the selected tile." },
  { id: "object", label: "Object", icon: "\u2690", shortcut: "O", desc: "Place and move map objects (tool stations, spawn points, NPCs)." },
  { id: "walkability", label: "Walkability", icon: "\u2611", shortcut: "W", desc: "Toggle which tiles characters can walk on. Red = blocked, green = walkable." },
];

export function ToolBar() {
  const { activeTool, setActiveTool, showGrid, toggleGrid, showWalkability, toggleWalkability, showAnimations, toggleAnimations } =
    useEditorStore();

  return (
    <div className="flex flex-col gap-1 p-1">
      {TOOLS.map((tool) => (
        <Tooltip key={tool.id} text={`${tool.label} (${tool.shortcut})`} desc={tool.desc} side="right">
          <button
            onClick={() => setActiveTool(tool.id)}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
              activeTool === tool.id
                ? "bg-yellow-600 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
          >
            {tool.icon}
          </button>
        </Tooltip>
      ))}

      <div className="border-t border-gray-700 my-1" />

      <Tooltip text="Grid (H)" desc="Show a 16px grid overlay on the map canvas." side="right">
        <button
          onClick={toggleGrid}
          className={`w-8 h-8 flex items-center justify-center rounded text-xs ${
            showGrid ? "bg-blue-700 text-white" : "bg-gray-700 text-gray-400"
          }`}
        >
          #
        </button>
      </Tooltip>

      <Tooltip text="Walkability Overlay" desc="Highlight walkable (green) and blocked (red) tiles on the map." side="right">
        <button
          onClick={toggleWalkability}
          className={`w-8 h-8 flex items-center justify-center rounded text-xs ${
            showWalkability ? "bg-green-700 text-white" : "bg-gray-700 text-gray-400"
          }`}
        >
          W
        </button>
      </Tooltip>

      <Tooltip text="Animate Tiles" desc="Play/pause tile animations, NPC walk cycles, and spawn point sprites on the map canvas." side="right">
        <button
          onClick={toggleAnimations}
          className={`w-8 h-8 flex items-center justify-center rounded text-xs ${
            showAnimations ? "bg-purple-700 text-white" : "bg-gray-700 text-gray-400"
          }`}
        >
          {showAnimations ? "\u25B6" : "\u23F8"}
        </button>
      </Tooltip>
    </div>
  );
}
