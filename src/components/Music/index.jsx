import { memo } from 'preact/compat';
import style from './index.module.less';
import { cn } from '../../utils/cn';

export const MusicIndicator = memo(function MusicIndicator({ data = true }) {
  return (
    <div
      className={cn('bg', style.music, {
        [style.c]: !data,
      })}
    />
  );
});
