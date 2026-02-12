/** Tiled JSON map format types */

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  orientation: "orthogonal";
  renderorder: "right-down";
  tiledversion: string;
  version: string;
  type: "map";
  layers: (TiledTileLayer | TiledObjectLayer)[];
  tilesets: TiledTilesetRef[];
  properties?: TiledProperty[];
}

export interface TiledTileLayer {
  id: number;
  name: string;
  type: "tilelayer";
  width: number;
  height: number;
  x: number;
  y: number;
  data: number[];
  opacity: number;
  visible: boolean;
  properties?: TiledProperty[];
}

export interface TiledObjectLayer {
  id: number;
  name: string;
  type: "objectgroup";
  x: number;
  y: number;
  objects: TiledObject[];
  opacity: number;
  visible: boolean;
}

export interface TiledObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  properties?: TiledProperty[];
}

export interface TiledProperty {
  name: string;
  type: "string" | "int" | "float" | "bool";
  value: string | number | boolean;
}

export interface TiledTilesetRef {
  firstgid: number;
  source?: string;
  // Embedded tileset fields
  name?: string;
  tilewidth?: number;
  tileheight?: number;
  tilecount?: number;
  columns?: number;
  image?: string;
  imagewidth?: number;
  imageheight?: number;
  tiles?: TiledTileDef[];
}

export interface TiledAnimationFrame {
  tileid: number;
  duration: number;
}

export interface TiledTileDef {
  id: number;
  properties?: TiledProperty[];
  animation?: TiledAnimationFrame[];
}

/** Layer names used in the editor */
export const LAYER_NAMES = [
  "ground",
  "terrain",
  "buildings",
  "decorations",
  "treetops",
  "objects",
] as const;

export type LayerName = (typeof LAYER_NAMES)[number];
