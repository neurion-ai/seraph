import type { CellStack } from "../types/editor";

/** Get the topmost GID from a cell stack (0 if empty) */
function topOf(stack: CellStack): number {
  return stack.length > 0 ? stack[stack.length - 1] : 0;
}

/** Flood fill algorithm for the map editor bucket tool (operates on top-of-stack) */
export function floodFill(
  data: CellStack[],
  width: number,
  height: number,
  startX: number,
  startY: number,
  fillGid: number,
): Array<{ x: number; y: number; oldValue: CellStack }> {
  const targetGid = topOf(data[startY * width + startX]);
  if (targetGid === fillGid) return [];

  const changes: Array<{ x: number; y: number; oldValue: CellStack }> = [];
  const visited = new Set<number>();
  const queue: [number, number][] = [[startX, startY]];

  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    const idx = y * width + x;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (visited.has(idx)) continue;
    if (topOf(data[idx]) !== targetGid) continue;

    visited.add(idx);
    changes.push({ x, y, oldValue: [...data[idx]] });
    // Replace topmost GID with fillGid
    if (data[idx].length > 0) {
      data[idx] = [...data[idx].slice(0, -1), fillGid];
    } else {
      data[idx] = [fillGid];
    }

    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return changes;
}
