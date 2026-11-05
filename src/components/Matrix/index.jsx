import { useState, useEffect, useRef } from 'preact/hooks';
import { memo } from 'preact/compat';
import style from './index.module.less';
import { isClear } from '../../game/utils';
import { useTetrisStore } from '../../game/store';

const fillLine = Array(10).fill(1);
const blankLine = Array(10).fill(0);

const Cell = memo(function Cell({ value }) {
  return <b className={value === 1 ? 'c' : value === 2 ? 'd' : ''} />;
});

const Row = memo(function Row({ row }) {
  return (
    <p>
      {row.map((cell, cIdx) => (
        <Cell key={cIdx} value={cell} />
      ))}
    </p>
  );
});

export const MatrixDisplay = memo(function MatrixDisplay({ matrix, cur, reset }) {
  const [clearState, setClearState] = useState(null);
  const [animateColor, setAnimateColor] = useState(2);
  const [overState, setOverState] = useState(null);
  const clearTimers = useRef([]);

  const finishClearLines = useTetrisStore(s => s.finishClearLines);
  const roundId = useTetrisStore(s => s.roundId);
  const overEnd = useTetrisStore(s => s.overEnd);

  // Clear lines animation
  useEffect(() => {
    if (reset) {
      clearTimers.current.forEach(clearTimeout);
      clearTimers.current = [];
      setClearState(null);
      return;
    }

    const clears = isClear(matrix);
    if (clears && !clearState) {
      setClearState(clears);

      let cancelled = false;
      const currentRound = roundId;

      const addTimer = (fn, delay) => {
        const id = setTimeout(() => {
          if (!cancelled) fn();
        }, delay);
        clearTimers.current.push(id);
        return id;
      };

      const anim = (cb) => {
        addTimer(() => {
          setAnimateColor(0);
          addTimer(() => {
            setAnimateColor(2);
            if (cb) cb();
          }, 100);
        }, 100);
      };

      anim(() => {
        anim(() => {
          anim(() => {
            addTimer(() => {
              setClearState(null);
              finishClearLines(clears, currentRound);
            }, 100);
          });
        });
      });

      return () => {
        cancelled = true;
        clearTimers.current.forEach(clearTimeout);
        clearTimers.current = [];
      };
    }
  }, [matrix, reset, roundId]);

  // Game over animation
  useEffect(() => {
    if (!reset) {
      if (overState) setOverState(null);
      return;
    }

    if (!overState) {
      let currentDisplay = getDisplayMatrix();
      setOverState(currentDisplay);

      const timers = [];
      for (let i = 0; i <= 40; i++) {
        const timer = setTimeout(() => {
          if (i <= 19) {
            currentDisplay = currentDisplay.map((row, idx) => (idx === 19 - i ? [...fillLine] : row));
          } else if (i >= 20 && i <= 39) {
            currentDisplay = currentDisplay.map((row, idx) => (idx === i - 20 ? [...blankLine] : row));
          } else {
            setOverState(null);
            overEnd();
            return;
          }
          setOverState(currentDisplay);
        }, 40 * (i + 1));
        timers.push(timer);
      }

      return () => {
        timers.forEach(t => clearTimeout(t));
        setOverState(null);
      };
    }
  }, [reset]);

  function getDisplayMatrix() {
    let result = matrix.map(row => [...row]);

    if (clearState) {
      clearState.forEach(rowIdx => {
        result[rowIdx] = Array(10).fill(animateColor);
      });
      return result;
    }

    if (cur && cur.shape && cur.xy) {
      const shape = cur.shape;
      const xy = cur.xy;
      shape.forEach((row, k1) => {
        row.forEach((val, k2) => {
          if (val && xy[0] + k1 >= 0 && xy[0] + k1 < 20 && xy[1] + k2 >= 0 && xy[1] + k2 < 10) {
            const r = xy[0] + k1;
            const c = xy[1] + k2;
            result[r][c] = (result[r][c] === 1) ? 2 : 1;
          }
        });
      });
    }

    return result;
  }

  const displayMatrix = reset && overState ? overState : getDisplayMatrix();

  return (
    <div className={style.matrix}>
      {displayMatrix.map((row, rIdx) => (
        <Row key={rIdx} row={row} />
      ))}
    </div>
  );
});
