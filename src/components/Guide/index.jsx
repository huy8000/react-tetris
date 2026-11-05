import { memo } from 'preact/compat';
import style from './index.module.less';
import { cn } from '../../utils/cn';

export const Guide = memo(function Guide() {
  return (
    <div>
      <div className={cn(style.guide, style.right)}>
        <div className={style.up}>
          <em style={{ transform: 'translate(0,-3px) scale(1,2)' }} />
        </div>
        <div className={style.left}>
          <em style={{ transform: 'translate(-7px,3px) rotate(-90deg) scale(1,2)' }} />
        </div>
        <div className={style.down}>
          <em style={{ transform: 'translate(0,9px) rotate(180deg) scale(1,2)' }} />
        </div>
        <div className={style.right}>
          <em style={{ transform: 'translate(7px,3px) rotate(90deg) scale(1,2)' }} />
        </div>
      </div>
      <div className={cn(style.guide, style.left)}>
        <div className={style.space}>SPACE</div>
      </div>
    </div>
  );
});
