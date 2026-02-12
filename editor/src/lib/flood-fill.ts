/** Flood fill algorithm for the map editor bucket tool */
export function floodFill(
  data: number[],
  width: number,
  height: number,
  startX: number,
  startY: number,
  fillGid: number,
): Array<{ x: number; y: number; oldValue: number }> {
  const targetGid = data[startY * width + startX];
  if (targetGid === fillGid) return [];

  const changes: Array<{ x: number; y: number; oldValue: number }> = [];
  const visited = new Set<number>();
  const queue: [number, number][] = [[startX, startY]];

  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    const idx = y * width + x;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (visited.has(idx)) continue;
    if (data[idx] !== targetGid) continue;

    visited.add(idx);
    changes.push({ x, y, oldValue: data[idx] });
    data[idx] = fillGid;

    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return changes;
}
