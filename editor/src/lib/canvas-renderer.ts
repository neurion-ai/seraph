import type { CellStack, LoadedTileset, AnimationLookup } from "../types/editor";
import { resolveTileGid, getTileSourceRect } from "./tileset-loader";

export interface Viewport {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

const GRID_COLOR = "rgba(255, 255, 255, 0.12)";
const GRID_COLOR_ZOOM = "rgba(255, 255, 255, 0.2)";
const WALKABLE_COLOR = "rgba(0, 255, 0, 0.25)";
const BLOCKED_COLOR = "rgba(255, 0, 0, 0.3)";

export function renderMap(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  layers: CellStack[][],
  layerNames: string[],
  tilesets: LoadedTileset[],
  mapWidth: number,
  mapHeight: number,
  tileSize: number,
  viewport: Viewport,
  layerVisibility: boolean[],
  activeLayerIndex: number,
  showGrid: boolean,
  showWalkability: boolean,
  animationLookup?: AnimationLookup,
  timestamp?: number,
  showAnimations?: boolean,
) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Background
  ctx.fillStyle = "#2d2d2d";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const { offsetX, offsetY, zoom } = viewport;
  const scaledTile = tileSize * zoom;

  // Draw map background
  ctx.fillStyle = "#4a8c3f";
  ctx.fillRect(offsetX, offsetY, mapWidth * scaledTile, mapHeight * scaledTile);

  // Calculate visible tile range for culling
  const startCol = Math.max(0, Math.floor(-offsetX / scaledTile));
  const startRow = Math.max(0, Math.floor(-offsetY / scaledTile));
  const endCol = Math.min(mapWidth, Math.ceil((canvasWidth - offsetX) / scaledTile));
  const endRow = Math.min(mapHeight, Math.ceil((canvasHeight - offsetY) / scaledTile));

  // Render tile layers
  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li];
    if (!layerVisibility[li]) continue;

    // Dim non-active layers slightly
    const isActive = li === activeLayerIndex;
    ctx.globalAlpha = isActive ? 1.0 : 0.7;

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const stack = layer[row * mapWidth + col];
        if (!stack || stack.length === 0) continue;

        // Draw all GIDs in the stack, bottom to top
        for (let si = 0; si < stack.length; si++) {
          let gid = stack[si];
          if (gid <= 0) continue;

          // Resolve animated tile if applicable
          if (showAnimations && animationLookup && timestamp !== undefined) {
            const anim = animationLookup.get(gid);
            if (anim && anim.frames.length > 0) {
              const elapsed = timestamp % anim.totalDuration;
              let accum = 0;
              for (const frame of anim.frames) {
                accum += frame.duration;
                if (elapsed < accum) {
                  gid = frame.gid;
                  break;
                }
              }
            }
          }

          const resolved = resolveTileGid(gid, tilesets);
          if (!resolved) continue;

          const { sx, sy, sw, sh } = getTileSourceRect(resolved.localId, resolved.tileset);
          const dx = offsetX + col * scaledTile;
          const dy = offsetY + row * scaledTile;

          ctx.drawImage(resolved.tileset.image, sx, sy, sw, sh, dx, dy, scaledTile, scaledTile);
        }
      }
    }
  }

  ctx.globalAlpha = 1.0;

  // Walkability overlay
  if (showWalkability) {
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const walkable = isTileWalkable(col, row, layers, mapWidth, tilesets);
        ctx.fillStyle = walkable ? WALKABLE_COLOR : BLOCKED_COLOR;
        ctx.fillRect(
          offsetX + col * scaledTile,
          offsetY + row * scaledTile,
          scaledTile,
          scaledTile
        );
      }
    }
  }

  // Grid
  if (showGrid) {
    ctx.strokeStyle = zoom >= 2 ? GRID_COLOR_ZOOM : GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let col = startCol; col <= endCol; col++) {
      const x = Math.round(offsetX + col * scaledTile) + 0.5;
      ctx.moveTo(x, offsetY + startRow * scaledTile);
      ctx.lineTo(x, offsetY + endRow * scaledTile);
    }
    for (let row = startRow; row <= endRow; row++) {
      const y = Math.round(offsetY + row * scaledTile) + 0.5;
      ctx.moveTo(offsetX + startCol * scaledTile, y);
      ctx.lineTo(offsetX + endCol * scaledTile, y);
    }

    ctx.stroke();
  }

  // Active layer highlight border
  const mapPixelW = mapWidth * scaledTile;
  const mapPixelH = mapHeight * scaledTile;
  ctx.strokeStyle = "#e2b714";
  ctx.lineWidth = 2;
  ctx.strokeRect(offsetX, offsetY, mapPixelW, mapPixelH);
}

/** Check if a tile position is walkable across all layers (checks ALL GIDs in stacks) */
export function isTileWalkable(
  col: number,
  row: number,
  layers: CellStack[][],
  mapWidth: number,
  tilesets: LoadedTileset[]
): boolean {
  for (const layer of layers) {
    const stack = layer[row * mapWidth + col];
    if (!stack) continue;
    for (const gid of stack) {
      if (gid <= 0) continue;
      const resolved = resolveTileGid(gid, tilesets);
      if (resolved && !resolved.tileset.walkability[resolved.localId]) {
        return false;
      }
    }
  }
  return true;
}

/** Render a single tileset into a canvas for the tileset panel */
export function renderTilesetPreview(
  ctx: CanvasRenderingContext2D,
  tileset: LoadedTileset,
  scale: number,
  selectedTiles: { startCol: number; startRow: number; endCol: number; endRow: number } | null,
  showWalkability: boolean,
) {
  ctx.imageSmoothingEnabled = false;
  const w = tileset.imageWidth * scale;
  const h = tileset.imageHeight * scale;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(tileset.image, 0, 0, w, h);

  const ts = tileset.tileWidth * scale;

  // Walkability overlay on tileset
  if (showWalkability) {
    for (let localId = 0; localId < tileset.tileCount; localId++) {
      const col = localId % tileset.columns;
      const row = Math.floor(localId / tileset.columns);
      ctx.fillStyle = tileset.walkability[localId] ? WALKABLE_COLOR : BLOCKED_COLOR;
      ctx.fillRect(col * ts, row * ts, ts, ts);
    }
  }

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 0; c <= tileset.columns; c++) {
    const x = Math.round(c * ts) + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let r = 0; r <= tileset.rows; r++) {
    const y = Math.round(r * ts) + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Selection highlight
  if (selectedTiles) {
    const sx = Math.min(selectedTiles.startCol, selectedTiles.endCol);
    const sy = Math.min(selectedTiles.startRow, selectedTiles.endRow);
    const ex = Math.max(selectedTiles.startCol, selectedTiles.endCol);
    const ey = Math.max(selectedTiles.startRow, selectedTiles.endRow);
    ctx.strokeStyle = "#e2b714";
    ctx.lineWidth = 2;
    ctx.strokeRect(sx * ts, sy * ts, (ex - sx + 1) * ts, (ey - sy + 1) * ts);
    ctx.fillStyle = "rgba(226, 183, 20, 0.2)";
    ctx.fillRect(sx * ts, sy * ts, (ex - sx + 1) * ts, (ey - sy + 1) * ts);
  }
}
