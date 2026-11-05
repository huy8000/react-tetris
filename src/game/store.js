import { create } from 'zustand';
import { Block } from './block';
import {
  speeds,
  delays,
  clearPoints,
  eachLines,
  createBlankMatrix,
} from './consts';
import {
  getNextType,
  want,
  isClear,
  isOver,
  getStartMatrix,
  loadLastRecord,
  saveRecord,
} from './utils';
import { sound } from './audio';

const record = loadLastRecord();

export const useTetrisStore = create((set, get) => ({
  matrix: createBlankMatrix(),
  cur: null,
  next: getNextType(),
  speedStart: record ? record.speedStart || 1 : 1,
  speedRun: record ? record.speedRun || 1 : 1,
  startLines: record ? record.startLines || 0 : 0,
  clearLines: record ? record.clearLines || 0 : 0,
  points: record ? record.points || 0 : 0,
  max: record ? record.max || 0 : 0,
  reset: false,
  drop: false,
  pause: false,
  music: record ? record.music !== false : true,
  lock: false,
  keyboard: {
    drop: false,
    down: false,
    left: false,
    right: false,
    rotate: false,
    reset: false,
    music: false,
    pause: false,
  },

  setVirtualKey: (key, pressed) => {
    set(state => ({
      keyboard: { ...state.keyboard, [key]: pressed },
    }));
  },

  toggleMusic: () => {
    const nextState = !get().music;
    sound.enabled = nextState;
    set({ music: nextState });
    saveRecord(get());
  },

  pauseGame: () => {
    const { cur, pause } = get();
    if (!cur) {
      get().startGame();
      return;
    }
    set({ pause: !pause });
    saveRecord(get());
  },

  startGame: () => {
    const { speedStart, startLines } = get();
    sound.start();
    const startMatrix = getStartMatrix(startLines);
    const firstType = get().next;
    const nextType = getNextType();
    const cur = new Block({ type: firstType });

    set({
      points: 0,
      speedRun: speedStart,
      matrix: startMatrix,
      cur,
      next: nextType,
      pause: false,
      reset: false,
      lock: false,
      clearLines: 0,
    });
    saveRecord(get());
  },

  resetGame: () => {
    get().overStart();
  },

  moveLeft: () => {
    const { cur, matrix, speedRun, pause, lock } = get();
    if (lock) return;
    sound.move();
    if (!cur) {
      let speed = get().speedStart - 1;
      if (speed < 1) speed = 6;
      set({ speedStart: speed });
      return;
    }
    if (pause) {
      set({ pause: false });
      return;
    }
    const next = cur.left();
    const delay = delays[speedRun - 1];
    if (want(next, matrix)) {
      next.timeStamp += parseInt(delay, 10);
      set({ cur: next });
    } else {
      cur.timeStamp += parseInt(delay / 1.5, 10);
      set({ cur });
    }
    saveRecord(get());
  },

  moveRight: () => {
    const { cur, matrix, speedRun, pause, lock } = get();
    if (lock) return;
    sound.move();
    if (!cur) {
      let speed = get().speedStart + 1;
      if (speed > 6) speed = 1;
      set({ speedStart: speed });
      return;
    }
    if (pause) {
      set({ pause: false });
      return;
    }
    const next = cur.right();
    const delay = delays[speedRun - 1];
    if (want(next, matrix)) {
      next.timeStamp += parseInt(delay, 10);
      set({ cur: next });
    } else {
      cur.timeStamp += parseInt(delay / 1.5, 10);
      set({ cur });
    }
    saveRecord(get());
  },

  rotate: () => {
    const { cur, matrix, pause, lock } = get();
    if (lock) return;
    if (!cur) {
      let lines = get().startLines + 1;
      if (lines > 10) lines = 0;
      set({ startLines: lines });
      sound.move();
      return;
    }
    if (pause) {
      set({ pause: false });
    }
    sound.rotate();
    const next = cur.rotate();
    if (want(next, matrix)) {
      set({ cur: next });
      saveRecord(get());
    }
  },

  moveDown: () => {
    const { cur, matrix, pause, lock } = get();
    if (lock) return;
    if (!cur) {
      let lines = get().startLines - 1;
      if (lines < 0) lines = 10;
      set({ startLines: lines });
      sound.move();
      return;
    }
    if (pause) {
      set({ pause: false });
      return;
    }
    sound.move();
    const next = cur.fall();
    if (want(next, matrix)) {
      set({ cur: next });
    } else {
      get().lockPiece(cur, matrix);
    }
    saveRecord(get());
  },

  hardDrop: () => {
    const { cur, matrix, pause, lock } = get();
    if (lock) return;
    if (!cur) {
      get().startGame();
      return;
    }
    if (pause) {
      set({ pause: false });
      return;
    }
    sound.fall();
    let index = 0;
    let bottom = cur.fall(index);
    while (want(bottom, matrix)) {
      index++;
      bottom = cur.fall(index);
    }
    bottom = cur.fall(index - 1);
    set({ drop: true, cur: bottom });
    setTimeout(() => {
      set({ drop: false });
    }, 100);
    get().lockPiece(bottom, matrix);
  },

  lockPiece: (curPiece, currentMatrix) => {
    let newMatrix = currentMatrix.map(row => [...row]);
    const shape = curPiece.shape;
    const xy = curPiece.xy;
    shape.forEach((row, k1) => {
      row.forEach((val, k2) => {
        if (val && xy[0] + k1 >= 0) {
          newMatrix[xy[0] + k1][xy[1] + k2] = 1;
        }
      });
    });

    const addPoints = get().points + 10 + (get().speedRun - 1) * 2;
    const newMax = Math.max(get().max, addPoints);

    set({
      matrix: newMatrix,
      points: addPoints,
      max: newMax,
      lock: true,
    });

    // Check clear
    const clears = isClear(newMatrix);
    if (clears) {
      sound.clear();
      // Matrix component will handle clear animation, then call finishClearLines
      return;
    }

    // Check game over
    if (isOver(newMatrix)) {
      sound.gameover();
      get().overStart();
      return;
    }

    // Proceed to next piece
    setTimeout(() => {
      const nextType = get().next;
      const futureNext = getNextType();
      set({
        lock: false,
        cur: new Block({ type: nextType }),
        next: futureNext,
      });
      saveRecord(get());
    }, 100);
  },

  finishClearLines: (clearedRows) => {
    const { matrix, clearLines, speedStart } = get();
    let newMatrix = matrix.filter((_, idx) => !clearedRows.includes(idx));
    for (let i = 0; i < clearedRows.length; i++) {
      newMatrix.unshift(Array(10).fill(0));
    }
    const newClearLines = clearLines + clearedRows.length;
    const addPoints = get().points + clearPoints[clearedRows.length - 1];
    const newMax = Math.max(get().max, addPoints);
    const speedAdd = Math.floor(newClearLines / eachLines);
    let speedNow = Math.min(6, speedStart + speedAdd);

    set({
      matrix: newMatrix,
      clearLines: newClearLines,
      points: addPoints,
      max: newMax,
      speedRun: speedNow,
      lock: false,
      cur: new Block({ type: get().next }),
      next: getNextType(),
    });
    saveRecord(get());
  },

  overStart: () => {
    set({
      lock: true,
      reset: true,
      pause: false,
    });
  },

  overEnd: () => {
    set({
      matrix: createBlankMatrix(),
      cur: null,
      reset: false,
      lock: false,
      clearLines: 0,
    });
    saveRecord(get());
  },
}));
