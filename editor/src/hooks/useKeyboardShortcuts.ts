import { useEffect } from "react";
import { useEditorStore } from "../stores/editorStore";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      const store = useEditorStore.getState();

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && e.shiftKey) {
          e.preventDefault();
          store.redo();
        } else if (e.key === "z") {
          e.preventDefault();
          store.undo();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case "p":
          store.setActiveTool("hand");
          break;
        case "b":
          store.setActiveTool("brush");
          break;
        case "e":
          store.setActiveTool("eraser");
          break;
        case "g":
          store.setActiveTool("fill");
          break;
        case "o":
          store.setActiveTool("object");
          break;
        case "w":
          store.setActiveTool("walkability");
          break;
        case "h":
          store.toggleGrid();
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          store.setActiveLayer(parseInt(e.key) - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
