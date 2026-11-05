import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupKeyboardListeners } from '../controls';
import { useTetrisStore } from '../store';

describe('Keyboard Listeners & Key Alias Handling', () => {
  let cleanup;

  beforeEach(() => {
    vi.useFakeTimers();
    cleanup = setupKeyboardListeners();
    // Reset virtual keyboard state
    useTetrisStore.setState({
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
    });
  });

  afterEach(() => {
    if (cleanup) cleanup();
    vi.useRealTimers();
  });

  it('should maintain action active when releasing one physical key while its alias is still held', () => {
    // 1. Press ArrowLeft -> action 'left' should be active
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(useTetrisStore.getState().keyboard.left).toBe(true);

    // 2. Press alias 'a' while holding ArrowLeft -> action 'left' remains active
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(useTetrisStore.getState().keyboard.left).toBe(true);

    // 3. Release ArrowLeft -> action 'left' MUST STILL be active because 'a' is held!
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
    expect(useTetrisStore.getState().keyboard.left).toBe(true);

    // 4. Release 'a' -> now all physical keys for 'left' are released, action becomes false
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    expect(useTetrisStore.getState().keyboard.left).toBe(false);
  });

  it('should ignore OS repeat keydown events for already pressed keys', () => {
    // 1. First keydown
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(useTetrisStore.getState().keyboard.down).toBe(true);

    // 2. Second keydown (OS repeat)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(useTetrisStore.getState().keyboard.down).toBe(true);

    // 3. Release
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
    expect(useTetrisStore.getState().keyboard.down).toBe(false);
  });

  it('should ignore keyboard shortcuts when modifier keys are pressed', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', metaKey: true })); // e.g. Cmd+R (refresh)
    expect(useTetrisStore.getState().keyboard.reset).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true })); // e.g. Ctrl+S (save)
    expect(useTetrisStore.getState().keyboard.down).toBe(false);
  });

  it('should release all active actions on window blur', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(useTetrisStore.getState().keyboard.left).toBe(true);
    expect(useTetrisStore.getState().keyboard.down).toBe(true);

    // Window loses focus
    window.dispatchEvent(new Event('blur'));

    expect(useTetrisStore.getState().keyboard.left).toBe(false);
    expect(useTetrisStore.getState().keyboard.down).toBe(false);
  });
});
