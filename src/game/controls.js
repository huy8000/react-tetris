import { useTetrisStore } from './store';
import { speeds } from './consts';
import { want } from './utils';

class KeyManager {
  constructor() {
    this.timers = {};
    this.keydownActive = '';
  }

  press(key, action, options = {}) {
    const { begin = 200, interval = 100, once = false } = options;
    this.release(key);
    action();
    if (once) return;

    this.timers[key] = setTimeout(() => {
      const loop = () => {
        action();
        this.timers[key] = setTimeout(loop, interval);
      };
      loop();
    }, begin);
  }

  release(key) {
    if (this.timers[key]) {
      clearTimeout(this.timers[key]);
      delete this.timers[key];
    }
  }

  clearAll() {
    Object.keys(this.timers).forEach(k => {
      clearTimeout(this.timers[k]);
      delete this.timers[k];
    });
  }
}

export const keyManager = new KeyManager();

export const actions = {
  left: {
    down: () => {
      const store = useTetrisStore.getState();
      store.setVirtualKey('left', true);
      keyManager.press('left', () => {
        useTetrisStore.getState().moveLeft();
      }, { begin: 200, interval: 100 });
    },
    up: () => {
      useTetrisStore.getState().setVirtualKey('left', false);
      keyManager.release('left');
    },
  },

  right: {
    down: () => {
      const store = useTetrisStore.getState();
      store.setVirtualKey('right', true);
      keyManager.press('right', () => {
        useTetrisStore.getState().moveRight();
      }, { begin: 200, interval: 100 });
    },
    up: () => {
      useTetrisStore.getState().setVirtualKey('right', false);
      keyManager.release('right');
    },
  },

  down: {
    down: () => {
      const store = useTetrisStore.getState();
      store.setVirtualKey('down', true);
      const isPlaying = !!store.cur;
      keyManager.press('down', () => {
        useTetrisStore.getState().moveDown();
      }, {
        begin: isPlaying ? 40 : 200,
        interval: isPlaying ? 40 : 100,
      });
    },
    up: () => {
      useTetrisStore.getState().setVirtualKey('down', false);
      keyManager.release('down');
    },
  },

  rotate: {
    down: () => {
      const store = useTetrisStore.getState();
      store.setVirtualKey('rotate', true);
      const isPlaying = !!store.cur;
      keyManager.press('rotate', () => {
        useTetrisStore.getState().rotate();
      }, {
        once: isPlaying,
        begin: 200,
        interval: 100,
      });
    },
    up: () => {
      useTetrisStore.getState().setVirtualKey('rotate', false);
      keyManager.release('rotate');
    },
  },

  space: {
    down: () => {
      const store = useTetrisStore.getState();
      store.setVirtualKey('drop', true);
      keyManager.press('space', () => {
        useTetrisStore.getState().hardDrop();
      }, { once: true });
    },
    up: () => {
      useTetrisStore.getState().setVirtualKey('drop', false);
      keyManager.release('space');
    },
  },

  p: {
    down: () => {
      const store = useTetrisStore.getState();
      store.setVirtualKey('pause', true);
      keyManager.press('p', () => {
        useTetrisStore.getState().pauseGame();
      }, { once: true });
    },
    up: () => {
      useTetrisStore.getState().setVirtualKey('pause', false);
      keyManager.release('p');
    },
  },

  r: {
    down: () => {
      const store = useTetrisStore.getState();
      store.setVirtualKey('reset', true);
      keyManager.press('r', () => {
        useTetrisStore.getState().resetGame();
      }, { once: true });
    },
    up: () => {
      useTetrisStore.getState().setVirtualKey('reset', false);
      keyManager.release('r');
    },
  },

  music: {
    down: () => {
      const store = useTetrisStore.getState();
      store.setVirtualKey('music', true);
      keyManager.press('music', () => {
        useTetrisStore.getState().toggleMusic();
      }, { once: true });
    },
    up: () => {
      useTetrisStore.getState().setVirtualKey('music', false);
      keyManager.release('music');
    },
  },
};

const keyMap = {
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowUp: 'rotate',
  w: 'rotate',
  W: 'rotate',
  ' ': 'space',
  m: 'music',
  M: 'music',
  r: 'r',
  R: 'r',
  p: 'p',
  P: 'p',
};

export function setupKeyboardListeners() {
  const pressedKeys = new Set();

  const onKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || !(e.key in keyMap)) return;
    e.preventDefault();
    const actionKey = keyMap[e.key];
    if (pressedKeys.has(actionKey)) return;
    pressedKeys.add(actionKey);
    if (actions[actionKey]) {
      actions[actionKey].down();
    }
  };

  const onKeyUp = (e) => {
    if (e.metaKey || !(e.key in keyMap)) return;
    e.preventDefault();
    const actionKey = keyMap[e.key];
    pressedKeys.delete(actionKey);
    if (actions[actionKey]) {
      actions[actionKey].up();
    }
  };

  const onBlur = () => {
    pressedKeys.forEach(actionKey => {
      if (actions[actionKey]) {
        actions[actionKey].up();
      }
    });
    pressedKeys.clear();
    keyManager.clearAll();
  };

  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('keyup', onKeyUp, true);
  window.addEventListener('blur', onBlur);

  return () => {
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('keyup', onKeyUp, true);
    window.removeEventListener('blur', onBlur);
    keyManager.clearAll();
  };
}

// requestAnimationFrame Game Loop
export function startGameLoop() {
  let lastTime = performance.now();
  let fallTimer = 0;
  let rafId = null;

  const loop = (currentTime) => {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    const state = useTetrisStore.getState();
    if (state.cur && !state.pause && !state.lock && !state.reset) {
      fallTimer += deltaTime;
      const speedDelay = speeds[state.speedRun - 1] || 800;
      if (fallTimer >= speedDelay) {
        fallTimer = 0;
        const next = state.cur.fall();
        if (want(next, state.matrix)) {
          useTetrisStore.setState({ cur: next });
        } else {
          state.lockPiece(state.cur, state.matrix);
        }
      }
    } else {
      fallTimer = 0;
    }

    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
  };
}
