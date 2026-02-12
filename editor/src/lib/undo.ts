import type { MapDelta, CellStack } from "../types/editor";

const MAX_UNDO = 100;

export class UndoManager {
  private undoStack: MapDelta[] = [];
  private redoStack: MapDelta[] = [];

  push(delta: MapDelta) {
    this.undoStack.push(delta);
    if (this.undoStack.length > MAX_UNDO) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo(_layers: CellStack[][]): MapDelta | null {
    const delta = this.undoStack.pop();
    if (!delta) return null;
    this.redoStack.push(delta);
    return delta;
  }

  redo(): MapDelta | null {
    const delta = this.redoStack.pop();
    if (!delta) return null;
    this.undoStack.push(delta);
    return delta;
  }

  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
  clear() { this.undoStack = []; this.redoStack = []; }
}
