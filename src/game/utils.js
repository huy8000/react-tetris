import { blockType, StorageKey } from './consts';

export function getNextType() {
  const len = blockType.length;
  return blockType[Math.floor(Math.random() * len)];
}

export function want(next, matrix) {
  const xy = next.xy;
  const shape = next.shape;
  const horizontal = shape[0].length;
  return shape.every((row, k1) =>
    row.every((val, k2) => {
      if (xy[1] < 0) return false;
      if (xy[1] + horizontal > 10) return false;
      if (xy[0] + k1 < 0) return true;
      if (xy[0] + k1 >= 20) return false;
      if (val) {
        if (matrix[xy[0] + k1] && matrix[xy[0] + k1][xy[1] + k2]) {
          return false;
        }
      }
      return true;
    })
  );
}

export function isClear(matrix) {
  const clearLines = [];
  matrix.forEach((row, k) => {
    if (row.every(cell => !!cell)) {
      clearLines.push(k);
    }
  });
  return clearLines.length === 0 ? false : clearLines;
}

export function isOver(matrix) {
  return matrix[0].some(cell => !!cell);
}

export function getStartMatrix(startLines) {
  const getLine = (min, max) => {
    const count = Math.floor(((max - min + 1) * Math.random()) + min);
    const line = [];
    for (let i = 0; i < count; i++) {
      line.push(1);
    }
    for (let i = 0, len = 10 - count; i < len; i++) {
      const index = Math.floor((line.length + 1) * Math.random());
      line.splice(index, 0, 0);
    }
    return line;
  };
  const startMatrix = [];
  for (let i = 0; i < 20 - startLines; i++) {
    startMatrix.push(Array(10).fill(0));
  }
  for (let i = 0; i < startLines; i++) {
    if (i <= 2) {
      startMatrix.push(getLine(5, 8));
    } else if (i <= 6) {
      startMatrix.push(getLine(4, 9));
    } else {
      startMatrix.push(getLine(3, 9));
    }
  }
  return startMatrix;
}

export function loadLastRecord() {
  try {
    const raw = localStorage.getItem(StorageKey);
    if (!raw) return null;
    // Fast path: modern plain JSON
    if (raw.startsWith('{')) {
      return JSON.parse(raw);
    }
    // Backward-compatibility: legacy Base64 encoded records
    try {
      const decoded = decodeURIComponent(atob(raw));
      return JSON.parse(decoded);
    } catch {
      return JSON.parse(raw);
    }
  } catch (e) {
    return null;
  }
}

let saveTimer = null;
let pendingStateGetter = null;

function doSave(state) {
  if (!state || state.lock) return;
  try {
    const dataToSave = {
      matrix: state.matrix,
      cur: state.cur ? {
        type: state.cur.type,
        shape: state.cur.shape,
        xy: state.cur.xy,
        rotateIndex: state.cur.rotateIndex,
      } : null,
      next: state.next,
      speedStart: state.speedStart,
      speedRun: state.speedRun,
      startLines: state.startLines,
      clearLines: state.clearLines,
      points: state.points,
      max: state.max,
      music: state.music,
      pause: state.pause,
    };
    localStorage.setItem(StorageKey, JSON.stringify(dataToSave));
  } catch (e) {
    console.warn('Save record error:', e);
  }
}

export function cancelPendingSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  pendingStateGetter = null;
}

export function saveRecord(state) {
  cancelPendingSave();
  doSave(state);
}

export function saveRecordImmediate(state) {
  saveRecord(state);
}

export function saveRecordDebounced(stateOrGetter) {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  pendingStateGetter = typeof stateOrGetter === 'function' ? stateOrGetter : () => stateOrGetter;
  saveTimer = setTimeout(() => {
    if (pendingStateGetter) {
      const currentState = pendingStateGetter();
      doSave(currentState);
      pendingStateGetter = null;
    }
    saveTimer = null;
  }, 1000);
}
