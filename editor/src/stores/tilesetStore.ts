import { create } from "zustand";
import type { LoadedTileset, TileSelection, TileAnimationGroup, AnimationLookup } from "../types/editor";
import { loadAllTilesets, type TilesetCategory } from "../lib/tileset-loader";

interface TilesetStore {
  tilesets: LoadedTileset[];
  activeTilesetIndex: number;
  selectedTiles: TileSelection | null;
  loaded: boolean;
  loadError: string | null;
  loadProgress: { loaded: number; total: number; currentName: string };

  /** Active category filter (null = show all) */
  activeCategory: TilesetCategory | null;

  /** Cache of loaded sprite images keyed by path */
  spriteImageCache: Map<string, HTMLImageElement>;

  /** User-defined animation groups */
  animationGroups: TileAnimationGroup[];
  /** Pre-computed GID → animation frames lookup */
  animationLookup: AnimationLookup;
  /** Whether the animation definer panel is open */
  animDefinerOpen: boolean;

  loadTilesets: (basePath: string) => Promise<void>;
  setActiveTileset: (index: number) => void;
  setSelectedTiles: (sel: TileSelection | null) => void;
  toggleWalkability: (tilesetIndex: number, localId: number) => void;
  setWalkability: (tilesetIndex: number, localId: number, walkable: boolean) => void;
  getSelectedGids: () => number[];
  setActiveCategory: (category: TilesetCategory | null) => void;
  loadSpriteImage: (path: string) => Promise<HTMLImageElement>;

  addAnimationGroup: (group: TileAnimationGroup) => void;
  updateAnimationGroup: (id: string, group: TileAnimationGroup) => void;
  removeAnimationGroup: (id: string) => void;
  setAnimDefinerOpen: (open: boolean) => void;
  setAnimationGroups: (groups: TileAnimationGroup[]) => void;
  _rebuildAnimationLookup: () => void;
}

export const useTilesetStore = create<TilesetStore>((set, get) => ({
  tilesets: [],
  activeTilesetIndex: 0,
  selectedTiles: null,
  loaded: false,
  loadError: null,
  loadProgress: { loaded: 0, total: 0, currentName: "" },
  activeCategory: null,
  spriteImageCache: new Map(),
  animationGroups: [],
  animationLookup: new Map(),
  animDefinerOpen: false,

  loadTilesets: async (basePath: string) => {
    try {
      const tilesets = await loadAllTilesets(basePath, (loaded, total, name) => {
        set({ loadProgress: { loaded, total, currentName: name } });
      });
      set({ tilesets, loaded: true });
    } catch (err) {
      set({ loadError: err instanceof Error ? err.message : String(err) });
    }
  },

  setActiveTileset: (index) => set({ activeTilesetIndex: index, selectedTiles: null }),

  setSelectedTiles: (sel) => set({ selectedTiles: sel }),

  toggleWalkability: (tilesetIndex, localId) => {
    const { tilesets } = get();
    const ts = tilesets[tilesetIndex];
    if (!ts) return;
    const newWalkability = [...ts.walkability];
    newWalkability[localId] = !newWalkability[localId];
    const newTilesets = [...tilesets];
    newTilesets[tilesetIndex] = { ...ts, walkability: newWalkability };
    set({ tilesets: newTilesets });
  },

  setWalkability: (tilesetIndex, localId, walkable) => {
    const { tilesets } = get();
    const ts = tilesets[tilesetIndex];
    if (!ts) return;
    if (ts.walkability[localId] === walkable) return;
    const newWalkability = [...ts.walkability];
    newWalkability[localId] = walkable;
    const newTilesets = [...tilesets];
    newTilesets[tilesetIndex] = { ...ts, walkability: newWalkability };
    set({ tilesets: newTilesets });
  },

  getSelectedGids: () => {
    const { tilesets, activeTilesetIndex, selectedTiles } = get();
    if (!selectedTiles) return [];
    const ts = tilesets[activeTilesetIndex];
    if (!ts) return [];

    const gids: number[] = [];
    const minCol = Math.min(selectedTiles.startCol, selectedTiles.endCol);
    const maxCol = Math.max(selectedTiles.startCol, selectedTiles.endCol);
    const minRow = Math.min(selectedTiles.startRow, selectedTiles.endRow);
    const maxRow = Math.max(selectedTiles.startRow, selectedTiles.endRow);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const localId = r * ts.columns + c;
        gids.push(ts.firstGid + localId);
      }
    }
    return gids;
  },

  setActiveCategory: (category) => {
    const { tilesets } = get();
    const firstIndex = category === null
      ? 0
      : tilesets.findIndex((ts) => ts.category === category);
    set({
      activeCategory: category,
      activeTilesetIndex: firstIndex >= 0 ? firstIndex : 0,
      selectedTiles: null,
    });
  },

  loadSpriteImage: async (path: string) => {
    const { spriteImageCache } = get();
    const cached = spriteImageCache.get(path);
    if (cached) return cached;

    const img = new Image();
    img.src = path;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load sprite: ${path}`));
    });

    const newCache = new Map(get().spriteImageCache);
    newCache.set(path, img);
    set({ spriteImageCache: newCache });
    return img;
  },

  addAnimationGroup: (group) => {
    set((s) => ({ animationGroups: [...s.animationGroups, group] }));
    get()._rebuildAnimationLookup();
  },

  updateAnimationGroup: (id, group) => {
    set((s) => ({
      animationGroups: s.animationGroups.map((g) => (g.id === id ? group : g)),
    }));
    get()._rebuildAnimationLookup();
  },

  removeAnimationGroup: (id) => {
    set((s) => ({
      animationGroups: s.animationGroups.filter((g) => g.id !== id),
    }));
    get()._rebuildAnimationLookup();
  },

  setAnimDefinerOpen: (open) => set({ animDefinerOpen: open }),

  setAnimationGroups: (groups) => {
    set({ animationGroups: groups });
    get()._rebuildAnimationLookup();
  },

  _rebuildAnimationLookup: () => {
    const { animationGroups, tilesets } = get();
    const lookup: AnimationLookup = new Map();

    for (const group of animationGroups) {
      const ts = tilesets[group.tilesetIndex];
      if (!ts) continue;

      for (const entry of group.entries) {
        const anchorGid = ts.firstGid + entry.anchorLocalId;
        const frames = entry.frames.map((localId) => ({
          gid: ts.firstGid + localId,
          duration: group.frameDuration,
        }));
        const totalDuration = frames.length * group.frameDuration;
        if (frames.length > 0) {
          lookup.set(anchorGid, { frames, totalDuration });
        }
      }
    }

    set({ animationLookup: lookup });
  },
}));
