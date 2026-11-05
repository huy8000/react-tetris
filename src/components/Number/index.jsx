import { useState, useEffect } from 'preact/hooks';
import { memo } from 'preact/compat';
import style from './index.module.less';
import { cn } from '../../utils/cn';

function formatTwoDigits(num) {
  return num < 10 ? ['0', `${num}`] : `${num}`.split('');
}

export const NumberDisplay = memo(function NumberDisplay({ number = 0, length = 6, time = false }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!time) return;
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [time]);

  let digits = [];
  if (time) {
    const hours = formatTwoDigits(now.getHours());
    const minutes = formatTwoDigits(now.getMinutes());
    const secColon = now.getSeconds() % 2 === 0 ? 'd_c' : 'd';
    digits = hours.concat(secColon, minutes);
  } else {
    digits = `${number}`.split('');
    while (digits.length < length) {
      digits.unshift('n');
    }
  }

  return (
    <div className={style.number}>
      {digits.map((digit, idx) => (
        <span key={idx} className={cn('bg', style[`s_${digit}`])} />
      ))}
    </div>
  );
});
