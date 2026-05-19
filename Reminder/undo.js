// ===== UNDO / REDO STACK =====

const undoStack = [];
const redoStack = [];

function pushUndo(op) {
    undoStack.push(op);
    redoStack.length = 0;
    if (typeof renderStackVisual === 'function') renderStackVisual();
}
