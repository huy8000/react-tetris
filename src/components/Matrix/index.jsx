import { useState, useEffect } from 'preact/hooks';
import style from './index.module.less';
import { isClear } from '../../game/utils';
import { useTetrisStore } from '../../game/store';

const fillLine = Array(10).fill(1);
const blankLine = Array(10).fill(0);

export function MatrixDisplay({ matrix, cur, reset }) {
  const [clearState, setClearState] = useState(null);
  const [animateColor, setAnimateColor] = useState(2);
  const [overState, setOverState] = useState(null);

  const finishClearLines = useTetrisStore(s => s.finishClearLines);
  const overEnd = useTetrisStore(s => s.overEnd);

  // Clear lines animation
  useEffect(() => {
    const clears = isClear(matrix);
    if (clears && !clearState) {
      setClearState(clears);

      const anim = (cb) => {
        setTimeout(() => {
          setAnimateColor(0);
          setTimeout(() => {
            setAnimateColor(2);
            if (cb) cb();
          }, 100);
        }, 100);
      };

      anim(() => {
        anim(() => {
          anim(() => {
            setTimeout(() => {
              setClearState(null);
              finishClearLines(clears);
            }, 100);
          });
        });
      });
    }
  }, [matrix]);

  // Game over animation
  useEffect(() => {
    if (reset && !overState) {
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
        <p key={rIdx}>
          {row.map((cell, cIdx) => (
            <b
              key={cIdx}
              className={cell === 1 ? 'c' : cell === 2 ? 'd' : ''}
            />
          ))}
        </p>
      ))}
    </div>
  );
}
