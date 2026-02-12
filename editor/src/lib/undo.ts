import type { MapDelta } from "../types/editor";

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

  undo(layers: number[][]): MapDelta | null {
    const delta = this.undoStack.pop();
    if (!delta) return null;

    // Apply inverse
    const layer = layers[delta.layerIndex];
    const inverseDelta: MapDelta = {
      layerIndex: delta.layerIndex,
      changes: [],
    };

    for (const change of delta.changes) {
      const idx = change.y * Math.sqrt(layer.length) | 0; // not clean but works
      inverseDelta.changes.push({
        x: change.x,
        y: change.y,
        oldValue: change.newValue,
        newValue: change.oldValue,
      });
    }

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
