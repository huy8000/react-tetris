import { useState, useEffect } from 'preact/hooks';
import { NumberDisplay } from '../Number';
import { i18n } from '../../game/consts';

export function PointDisplay({ cur = false, point = 0, max = 0 }) {
  const [label, setLabel] = useState('');
  const [number, setNumber] = useState(0);

  useEffect(() => {
    let timer = null;
    if (cur) {
      setLabel(point >= max ? i18n.highestScore : i18n.point);
      setNumber(point);
    } else {
      if (point !== 0) {
        let showLast = true;
        const toggle = () => {
          if (showLast) {
            setLabel(i18n.lastRound);
            setNumber(point);
          } else {
            setLabel(i18n.highestScore);
            setNumber(max);
          }
          showLast = !showLast;
          timer = setTimeout(toggle, 3000);
        };
        toggle();
      } else {
        setLabel(i18n.highestScore);
        setNumber(max);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cur, point, max]);

  return (
    <div>
      <p>{label}</p>
      <NumberDisplay number={number} />
    </div>
  );
}
