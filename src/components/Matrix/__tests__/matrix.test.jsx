import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from 'preact';
import { MatrixDisplay } from '../index';
import { useTetrisStore } from '../../../game/store';
import { createBlankMatrix } from '../../../game/consts';

describe('MatrixDisplay & Clear Animation Integration', () => {
  let container;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    useTetrisStore.getState().startGame();
  });

  afterEach(() => {
    render(null, container);
    container.remove();
    vi.useRealTimers();
  });

  it('should complete line-clear animation and update store when not interrupted', () => {
    const matrixWithClear = createBlankMatrix();
    matrixWithClear[19] = Array(10).fill(1);
    useTetrisStore.setState({ matrix: matrixWithClear, points: 0, clearLines: 0, lock: true });

    render(<MatrixDisplay matrix={matrixWithClear} cur={null} reset={false} />, container);

    // Animation takes: 100+100 + 100+100 + 100+100 + 100 = ~700ms
    vi.advanceTimersByTime(800);

    const state = useTetrisStore.getState();
    expect(state.clearLines).toBe(1);
    expect(state.points).toBe(100);
    expect(state.lock).toBe(false);
  });

  it('should cancel clear animation and block stale callbacks when reset occurs midway', () => {
    const matrixWithClear = createBlankMatrix();
    matrixWithClear[19] = Array(10).fill(1);
    useTetrisStore.setState({ matrix: matrixWithClear, points: 0, clearLines: 0, lock: true });

    // 1. Mount MatrixDisplay with clear in progress
    render(<MatrixDisplay matrix={matrixWithClear} cur={null} reset={false} />, container);

    // 2. Advance time midway through the flashing animation (e.g. 250ms)
    vi.advanceTimersByTime(250);

    // 3. User triggers reset midway through clear animation
    useTetrisStore.getState().resetGame(); // sets reset: true, increments roundId

    // 4. Update component with reset={true}
    render(<MatrixDisplay matrix={matrixWithClear} cur={null} reset={true} />, container);

    const stateAfterReset = useTetrisStore.getState();
    expect(stateAfterReset.reset).toBe(true);
    expect(stateAfterReset.lock).toBe(true);

    // 5. Advance time by 500ms (during Game Over curtain animation)
    vi.advanceTimersByTime(500);
    expect(useTetrisStore.getState().reset).toBe(true);
    expect(useTetrisStore.getState().clearLines).toBe(0);
    expect(useTetrisStore.getState().points).toBe(0);

    // 6. Advance remaining time until Game Over curtain finishes and calls overEnd() (~1600ms total)
    vi.advanceTimersByTime(1500);
    const finalState = useTetrisStore.getState();
    expect(finalState.clearLines).toBe(0); // Stale clear callback never incremented clearLines
    expect(finalState.points).toBe(0); // Stale clear callback never awarded points
    expect(finalState.reset).toBe(false); // Cleanly transitioned to idle through overEnd()
  });
});
