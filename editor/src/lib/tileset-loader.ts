import type { LoadedTileset } from "../types/editor";

const TILE_SIZE = 16;

export type TilesetCategory = "village" | "world" | "dungeon" | "interior" | "animations";

export interface TilesetConfig {
  name: string;
  file: string;
  category: TilesetCategory;
  /** Which subdirectory under /assets/ */
  dir: "tilesets" | "animations";
  hint: string;
}

/** Tileset configurations for the village editor — all 20 tilesets + 13 animation sheets */
const TILESET_CONFIGS: TilesetConfig[] = [
  // --- Village group ---
  { name: "CuteRPG_Field_Tiles", file: "CuteRPG_Field_Tiles.png", category: "village", dir: "tilesets", hint: "Grass, dirt, flowers, fences — ground layer." },
  { name: "CuteRPG_Village", file: "CuteRPG_Village.png", category: "village", dir: "tilesets", hint: "Village paths, props, signs, bridges." },
  { name: "CuteRPG_Forest", file: "CuteRPG_Forest.png", category: "village", dir: "tilesets", hint: "Trees, bushes — place on buildings/treetops layers." },
  { name: "CuteRPG_Houses_A", file: "CuteRPG_Houses_A.png", category: "village", dir: "tilesets", hint: "Orange roof buildings — walls, roofs, doors." },
  { name: "CuteRPG_Houses_B", file: "CuteRPG_Houses_B.png", category: "village", dir: "tilesets", hint: "Green roof buildings — walls, roofs, doors." },
  { name: "CuteRPG_Houses_C", file: "CuteRPG_Houses_C.png", category: "village", dir: "tilesets", hint: "Gray roof buildings — walls, roofs, doors." },
  { name: "CuteRPG_Harbor", file: "CuteRPG_Harbor.png", category: "village", dir: "tilesets", hint: "Docks, barrels, water props, boats." },
  { name: "CuteRPG_Village_House", file: "CuteRPG_Village_House.png", category: "village", dir: "tilesets", hint: "Village house interiors and details." },
  { name: "CuteRPG_Village_Inn", file: "CuteRPG_Village_Inn.png", category: "village", dir: "tilesets", hint: "Inn furniture, bar, beds, tables." },

  // --- World group ---
  { name: "CuteRPG_Mountains", file: "CuteRPG_Mountains.png", category: "world", dir: "tilesets", hint: "Mountain terrain, cliffs, rocks." },
  { name: "CuteRPG_Winter", file: "CuteRPG_Winter.png", category: "world", dir: "tilesets", hint: "Snow, ice, winter terrain." },
  { name: "CuteRPG_Desert_Outside", file: "CuteRPG_Desert_Outside.png", category: "world", dir: "tilesets", hint: "Desert sand, cacti, oasis." },
  { name: "CuteRPG_Desert_Inside", file: "CuteRPG_Desert_Inside.png", category: "world", dir: "tilesets", hint: "Desert building interiors, pyramids." },

  // --- Dungeon group ---
  { name: "CuteRPG_Castle", file: "CuteRPG_Castle.png", category: "dungeon", dir: "tilesets", hint: "Castle walls, towers, battlements." },
  { name: "CuteRPG_Castle_New", file: "CuteRPG_Castle_New.png", category: "dungeon", dir: "tilesets", hint: "Updated castle tileset — walls, floors." },
  { name: "CuteRPG_Dark_Castle", file: "CuteRPG_Dark_Castle.png", category: "dungeon", dir: "tilesets", hint: "Dark castle, haunted walls, evil decor." },
  { name: "CuteRPG_Dungeon", file: "CuteRPG_Dungeon.png", category: "dungeon", dir: "tilesets", hint: "Dungeon floors, walls, traps, torches." },
  { name: "CuteRPG_Dungeon_Entrance", file: "CuteRPG_Dungeon_Entrance.png", category: "dungeon", dir: "tilesets", hint: "Dungeon entrance, stairs, gates." },
  { name: "CuteRPG_Caves", file: "CuteRPG_Caves.png", category: "dungeon", dir: "tilesets", hint: "Cave walls, stalactites, underground." },

  // --- Interior ---
  { name: "CuteRPG_Interior_custom", file: "CuteRPG_Interior_custom.png", category: "interior", dir: "tilesets", hint: "Indoor furniture, floors, decorations." },

  // --- Animation sheets (same 16px grid, usable as tilesets) ---
  { name: "CuteRPG_Field_Animations", file: "CuteRPG_Field_Animations.png", category: "animations", dir: "animations", hint: "Field animation frames (water, flowers)." },
  { name: "CuteRPG_Forest_Animation", file: "CuteRPG_Forest_Animation.png", category: "animations", dir: "animations", hint: "Forest animation frames." },
  { name: "CuteRPG_Harbor_Animations", file: "CuteRPG_Harbor_Animations.png", category: "animations", dir: "animations", hint: "Harbor animation frames (waves, flags)." },
  { name: "CuteRPG_Castle_Animations", file: "CuteRPG_Castle_Animations.png", category: "animations", dir: "animations", hint: "Castle animation frames (torches, flags)." },
  { name: "CuteRPG_Castle_New_Animations", file: "CuteRPG_Castle_New_Animations.png", category: "animations", dir: "animations", hint: "New castle animation frames." },
  { name: "CuteRPG_Dark_Castle_Animations", file: "CuteRPG_Dark_Castle_Animations.png", category: "animations", dir: "animations", hint: "Dark castle animation frames." },
  { name: "CuteRPG_Desert_Animations", file: "CuteRPG_Desert_Animations.png", category: "animations", dir: "animations", hint: "Desert animation frames." },
  { name: "CuteRPG_Dungeon_Animations", file: "CuteRPG_Dungeon_Animations.png", category: "animations", dir: "animations", hint: "Dungeon animation frames (fire, water)." },
  { name: "CuteRPG_Dungeon_Entrance_Animations01", file: "CuteRPG_Dungeon_Entrance_Animations01.png", category: "animations", dir: "animations", hint: "Dungeon entrance animations (part 1)." },
  { name: "CuteRPG_Dungeon_Entrance_Animations02", file: "CuteRPG_Dungeon_Entrance_Animations02.png", category: "animations", dir: "animations", hint: "Dungeon entrance animations (part 2)." },
  { name: "CuteRPG_Magical", file: "CuteRPG_Magical.png", category: "animations", dir: "animations", hint: "Magical effect sprites." },
  { name: "CuteRPG_Mountains_animations", file: "CuteRPG_Mountains_animations.png", category: "animations", dir: "animations", hint: "Mountain animation frames." },
  { name: "CuteRPG_Mountains_Water", file: "CuteRPG_Mountains_Water.png", category: "animations", dir: "animations", hint: "Mountain water animation frames." },
];

export const CATEGORIES: { key: TilesetCategory; label: string }[] = [
  { key: "village", label: "Village" },
  { key: "world", label: "World" },
  { key: "dungeon", label: "Dungeon" },
  { key: "interior", label: "Interior" },
  { key: "animations", label: "Animations" },
];

export function getTilesetConfigs() {
  return TILESET_CONFIGS;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

/** Yield to browser so React can repaint between loads */
const yieldToUI = () => new Promise<void>((r) => setTimeout(r, 0));

export async function loadAllTilesets(
  basePath: string,
  onProgress?: (loaded: number, total: number, name: string) => void,
): Promise<LoadedTileset[]> {
  const tilesets: LoadedTileset[] = [];
  let gid = 1; // GID 0 = empty tile
  const total = TILESET_CONFIGS.length;

  for (let i = 0; i < total; i++) {
    const config = TILESET_CONFIGS[i];
    onProgress?.(i, total, config.name);
    await yieldToUI(); // let React render the progress update

    // Resolve the correct path based on the asset subdirectory
    const img = await loadImage(`${basePath}/${config.dir}/${config.file}`);
    const columns = Math.floor(img.width / TILE_SIZE);
    const rows = Math.floor(img.height / TILE_SIZE);
    const tileCount = columns * rows;

    tilesets.push({
      name: config.name,
      image: img,
      imageWidth: img.width,
      imageHeight: img.height,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      columns,
      rows,
      tileCount,
      firstGid: gid,
      category: config.category,
      walkability: new Array(tileCount).fill(true), // default: all walkable
    });

    gid += tileCount;
  }

  onProgress?.(total, total, "");
  return tilesets;
}

/** Get the tileset and local tile ID for a global tile ID */
export function resolveTileGid(
  gid: number,
  tilesets: LoadedTileset[]
): { tileset: LoadedTileset; localId: number } | null {
  if (gid <= 0) return null;
  for (let i = tilesets.length - 1; i >= 0; i--) {
    if (gid >= tilesets[i].firstGid) {
      return { tileset: tilesets[i], localId: gid - tilesets[i].firstGid };
    }
  }
  return null;
}

/** Get pixel position of a tile within its tileset image */
export function getTileSourceRect(
  localId: number,
  tileset: LoadedTileset
): { sx: number; sy: number; sw: number; sh: number } {
  const col = localId % tileset.columns;
  const row = Math.floor(localId / tileset.columns);
  return {
    sx: col * tileset.tileWidth,
    sy: row * tileset.tileHeight,
    sw: tileset.tileWidth,
    sh: tileset.tileHeight,
  };
}
