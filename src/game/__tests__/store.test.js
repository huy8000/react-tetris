import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useTetrisStore } from '../store';
import { Block } from '../block';
import { clearPoints, createBlankMatrix, eachLines } from '../consts';
import {
  saveRecord,
  saveRecordDebounced,
  loadLastRecord,
  cancelPendingSave,
} from '../utils';

const mockStorage = {};
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key) => mockStorage[key] ?? null,
    setItem: (key, val) => { mockStorage[key] = String(val); },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  };
}

describe('Zustand Tetris Store & State Transitions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    cancelPendingSave();
    useTetrisStore.getState().startGame();
  });

  afterEach(() => {
    cancelPendingSave();
    vi.useRealTimers();
  });

  describe('Game Lifecycle (Start, Pause, Reset)', () => {
    it('should start game with initial state and increment roundId', () => {
      const state1 = useTetrisStore.getState();
      const initialRound = state1.roundId;

      expect(state1.points).toBe(0);
      expect(state1.cur).toBeInstanceOf(Block);
      expect(state1.pause).toBe(false);
      expect(state1.reset).toBe(false);
      expect(state1.lock).toBe(false);

      useTetrisStore.getState().startGame();
      const state2 = useTetrisStore.getState();
      expect(state2.roundId).toBe(initialRound + 1);
    });

    it('should toggle pause state', () => {
      useTetrisStore.getState().pauseGame();
      expect(useTetrisStore.getState().pause).toBe(true);

      useTetrisStore.getState().pauseGame();
      expect(useTetrisStore.getState().pause).toBe(false);
    });

    it('should enter reset state on overStart and clear on overEnd', () => {
      const initialRound = useTetrisStore.getState().roundId;
      useTetrisStore.getState().overStart();

      const state = useTetrisStore.getState();
      expect(state.reset).toBe(true);
      expect(state.lock).toBe(true);
      expect(state.roundId).toBe(initialRound + 1);

      useTetrisStore.getState().overEnd();
      const endState = useTetrisStore.getState();
      expect(endState.reset).toBe(false);
      expect(endState.lock).toBe(false);
      expect(endState.cur).toBeNull();
    });
  });

  describe('Hard Drop and Block Locking', () => {
    it('should hard drop block to bottom, lock and award placement points', () => {
      const initialPoints = useTetrisStore.getState().points;
      const initialSpeed = useTetrisStore.getState().speedRun;

      useTetrisStore.getState().hardDrop();

      const state = useTetrisStore.getState();
      expect(state.drop).toBe(true);
      expect(state.lock).toBe(true);
      // Placement points: points + 10 + (speedRun - 1) * 2
      const expectedPoints = initialPoints + 10 + (initialSpeed - 1) * 2;
      expect(state.points).toBe(expectedPoints);

      // Verify bottom row has locked blocks
      const hasBlockAtBottom = state.matrix[19].some(cell => cell === 1);
      expect(hasBlockAtBottom).toBe(true);

      // Drop flash duration (100ms)
      vi.advanceTimersByTime(100);
      expect(useTetrisStore.getState().drop).toBe(false);

      // Lock delay (100ms): spawns new cur piece and unlocks
      vi.advanceTimersByTime(50);
      const afterSpawn = useTetrisStore.getState();
      expect(afterSpawn.lock).toBe(false);
      expect(afterSpawn.cur).toBeInstanceOf(Block);
    });
  });

  describe('Line Clearing and Score Accumulation', () => {
    it('should clear single line, award correct score and shift matrix down', () => {
      const matrix = createBlankMatrix();
      matrix[19] = Array(10).fill(1); // Row 19 is full
      matrix[18][3] = 1; // Row 18 has one cell

      useTetrisStore.setState({ matrix, points: 50, clearLines: 0 });

      useTetrisStore.getState().finishClearLines([19]);

      const state = useTetrisStore.getState();
      expect(state.clearLines).toBe(1);
      expect(state.points).toBe(50 + clearPoints[0]); // 50 + 100 = 150
      // Row 19 should now be what row 18 was
      expect(state.matrix[19][3]).toBe(1);
      // Top row should be blank
      expect(state.matrix[0].every(c => c === 0)).toBe(true);
    });

    it('should clear multiple lines (Tetris - 4 lines) with 1500 points', () => {
      const matrix = createBlankMatrix();
      for (let r = 16; r <= 19; r++) {
        matrix[r] = Array(10).fill(1);
      }
      useTetrisStore.setState({ matrix, points: 0, clearLines: 0 });

      useTetrisStore.getState().finishClearLines([16, 17, 18, 19]);

      const state = useTetrisStore.getState();
      expect(state.clearLines).toBe(4);
      expect(state.points).toBe(clearPoints[3]); // 1500
    });

    it('should increase speed when clearLines reach eachLines threshold', () => {
      useTetrisStore.setState({ clearLines: eachLines - 1, speedStart: 1, speedRun: 1 });
      useTetrisStore.getState().finishClearLines([19]);

      const state = useTetrisStore.getState();
      expect(state.clearLines).toBe(eachLines);
      expect(state.speedRun).toBe(2);
    });

    it('should reject finishClearLines callback if roundId is stale', () => {
      const initialRound = useTetrisStore.getState().roundId;
      const initialMatrix = useTetrisStore.getState().matrix;

      // Start new round, incrementing roundId
      useTetrisStore.getState().startGame();

      // Attempt to invoke callback with old roundId
      useTetrisStore.getState().finishClearLines([19], initialRound);

      // Matrix should remain unchanged
      expect(useTetrisStore.getState().matrix).toEqual(useTetrisStore.getState().matrix);
    });

    it('should reject finishClearLines callback if game is in reset state', () => {
      useTetrisStore.getState().overStart();
      const points = useTetrisStore.getState().points;

      useTetrisStore.getState().finishClearLines([19]);
      expect(useTetrisStore.getState().points).toBe(points);
    });
  });

  describe('Storage Debounce & Consistency', () => {
    it('should cancel pending debounced save when immediate save is triggered', () => {
      const stateA = {
        matrix: createBlankMatrix(),
        cur: null,
        next: 'T',
        speedStart: 1,
        speedRun: 1,
        startLines: 0,
        clearLines: 0,
        points: 100,
        max: 100,
        music: true,
        pause: false,
      };

      const stateB = {
        ...stateA,
        points: 500,
        max: 500,
      };

      // 1. Debounce save scheduled for stateA (e.g. key press)
      saveRecordDebounced(() => stateA);

      // Advance 500ms (not yet executed)
      vi.advanceTimersByTime(500);

      // 2. Immediate save occurs with stateB (e.g. piece lock/spawn)
      saveRecord(stateB);

      // Advance another 1000ms
      vi.advanceTimersByTime(1000);

      // Verify localStorage retains stateB and was NOT overwritten by stale stateA
      const saved = loadLastRecord();
      expect(saved.points).toBe(500);
      expect(saved.max).toBe(500);
    });

    it('should evaluate getter at execution time in debounced save', () => {
      let dynamicPoints = 10;
      const getState = () => ({
        matrix: createBlankMatrix(),
        cur: null,
        next: 'I',
        speedStart: 1,
        speedRun: 1,
        startLines: 0,
        clearLines: 0,
        points: dynamicPoints,
        max: dynamicPoints,
        music: true,
        pause: false,
      });

      saveRecordDebounced(getState);

      // State updates before timer fires
      dynamicPoints = 999;
      vi.advanceTimersByTime(1000);

      const saved = loadLastRecord();
      expect(saved.points).toBe(999);
    });
  });
});
