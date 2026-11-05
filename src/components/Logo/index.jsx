import { useState, useEffect, useRef } from 'preact/hooks';
import { memo } from 'preact/compat';
import style from './index.module.less';
import { cn } from '../../utils/cn';
import { i18n } from '../../game/consts';

export const LogoDisplay = memo(function LogoDisplay({ cur = false, reset = false }) {
  const [dragonStyle, setDragonStyle] = useState(style.r1);
  const [display, setDisplay] = useState('none');
  const timers = useRef([]);

  useEffect(() => {
    if (cur || reset) {
      setDisplay('none');
      return;
    }

    let cancelled = false;
    let m = 'r';
    let count = 0;

    const set = (fn, delay) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
      timers.current.push(id);
    };

    const show = (fn) => {
      set(() => {
        setDisplay('block');
        if (fn) fn();
      }, 150);
    };

    const hide = (fn) => {
      set(() => {
        setDisplay('none');
        if (fn) fn();
      }, 150);
    };

    const eyes = (fn, d1, d2) => {
      set(() => {
        setDragonStyle(style[m + 2]);
        set(() => {
          setDragonStyle(style[m + 1]);
          if (fn) fn();
        }, d2);
      }, d1);
    };

    const run = (fn) => {
      set(() => {
        setDragonStyle(style[m + 4]);
        set(() => {
          setDragonStyle(style[m + 3]);
          count++;
          if (count === 10 || count === 20 || count === 30) {
            m = m === 'r' ? 'l' : 'r';
          }
          if (count < 40) {
            run(fn);
            return;
          }
          setDragonStyle(style[m + 1]);
          if (fn) set(fn, 4000);
        }, 100);
      }, 100);
    };

    const dra = () => {
      count = 0;
      eyes(() => {
        eyes(() => {
          eyes(() => {
            setDragonStyle(style[m + 2]);
            run(dra);
          }, 150, 150);
        }, 150, 150);
      }, 1000, 1500);
    };

    show(() => {
      hide(() => {
        show(() => {
          hide(() => {
            show(() => {
              dra();
            });
          });
        });
      });
    });

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [cur, reset]);

  if (cur) return null;

  return (
    <div className={style.logo} style={{ display }}>
      <div className={cn('bg', style.dragon, dragonStyle)} />
      <p>{i18n.title}<br />TETRIS</p>
    </div>
  );
});
