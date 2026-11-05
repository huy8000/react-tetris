import { useState, useEffect } from 'preact/hooks';
import { memo } from 'preact/compat';
import style from './index.module.less';
import { cn } from '../../utils/cn';

export const PauseIndicator = memo(function PauseIndicator({ data = false }) {
  const [showPause, setShowPause] = useState(false);

  useEffect(() => {
    if (!data) {
      setShowPause(false);
      return;
    }
    const timer = setInterval(() => {
      setShowPause(prev => !prev);
    }, 250);
    return () => clearInterval(timer);
  }, [data]);

  return (
    <div
      className={cn('bg', style.pause, {
        [style.c]: showPause,
      })}
    />
  );
});
