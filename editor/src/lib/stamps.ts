import type { Stamp } from "../types/editor";

/**
 * Pre-defined multi-tile building stamps.
 * GIDs reference tiles from the loaded tilesets.
 * These are populated dynamically after tilesets load,
 * since exact GIDs depend on tileset ordering and firstGid values.
 *
 * For now, we define stamps with LOCAL tile IDs and a tilesetIndex.
 * The editor converts to global GIDs when placing.
 */

// Helper to create a collision mask (true = NOT walkable)
function solidMask(w: number, h: number): boolean[][] {
  return Array.from({ length: h }, () => new Array(w).fill(true));
}

function emptyMask(w: number, h: number): boolean[][] {
  return Array.from({ length: h }, () => new Array(w).fill(false));
}

/** These are template stamps - actual tile IDs will be set by the user via the editor */
export const DEFAULT_STAMPS: Stamp[] = [
  // Placeholder stamps - users will create their own via multi-tile selection
  {
    name: "Small Tree (Green)",
    category: "Trees",
    tiles: [[0]], // placeholder - user selects from tileset
    collisionMask: solidMask(1, 1),
    width: 1,
    height: 1,
    tilesetIndex: 2, // Forest tileset
  },
];

export function getStampsByCategory(stamps: Stamp[]): Map<string, Stamp[]> {
  const map = new Map<string, Stamp[]>();
  for (const stamp of stamps) {
    const list = map.get(stamp.category) ?? [];
    list.push(stamp);
    map.set(stamp.category, list);
  }
  return map;
}
