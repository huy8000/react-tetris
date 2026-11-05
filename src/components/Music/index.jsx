import style from './index.module.less';
import { cn } from '../../utils/cn';

export function MusicIndicator({ data = true }) {
  return (
    <div
      className={cn('bg', style.music, {
        [style.c]: !data,
      })}
    />
  );
}
