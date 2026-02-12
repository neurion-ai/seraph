import { useEditorStore } from "../stores/editorStore";
import { Tooltip } from "./Tooltip";

const LAYER_ICONS: Record<string, string> = {
  ground: "~",
  terrain: "#",
  buildings: "B",
  decorations: "*",
  treetops: "T",
};

const LAYER_HINTS: Record<string, string> = {
  ground: "Bottom layer — fill entirely with base tiles: grass, dirt, sand, water. Every cell should have a tile here. This is what shows through when higher layers are empty.",
  terrain: "Draws on top of ground — terrain edges, path borders, cliff transitions, fences, shorelines. Use this for tiles that blend two ground types together (e.g. grass-to-dirt edges).",
  buildings: "Structures layer — house walls, roofs, doors, bridges, large props. Tiles here block character movement by default.",
  decorations: "Small details on top of everything — flowers, signs, barrels, rocks, small props. Does not block movement unless marked.",
  treetops: "Highest layer — tree canopy, overhanging roofs. Renders above characters so they walk 'under' these tiles. Blocks movement by default.",
};

export function LayerPanel() {
  const { layerNames, activeLayerIndex, layerVisibility, setActiveLayer, toggleLayerVisibility } =
    useEditorStore();

  return (
    <div className="flex flex-col">
      <div className="px-2 py-1 text-xs font-bold text-gray-300 border-b border-gray-700">
        Layers
      </div>
      <div className="flex flex-col">
        {layerNames.map((name, i) => (
          <Tooltip key={name} text={`${name.charAt(0).toUpperCase() + name.slice(1)} (${i + 1})`} desc={LAYER_HINTS[name]} side="left">
            <div
              className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer text-xs ${
                i === activeLayerIndex
                  ? "bg-yellow-900/40 text-yellow-300"
                  : "text-gray-400 hover:bg-gray-700/50"
              }`}
              onClick={() => setActiveLayer(i)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(i);
                }}
                className={`w-4 h-4 flex items-center justify-center text-[10px] rounded ${
                  layerVisibility[i] ? "text-green-400" : "text-gray-600"
                }`}
              >
                {layerVisibility[i] ? "\u25C9" : "\u25CB"}
              </button>
              <span className="w-4 text-center text-gray-500 font-mono">
                {LAYER_ICONS[name] ?? "?"}
              </span>
              <span className="flex-1 capitalize">{name}</span>
              <span className="text-[10px] text-gray-600">{i + 1}</span>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
