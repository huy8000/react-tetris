import { memo } from 'preact/compat';
import style from './button.module.less';
import { cn } from '../../utils/cn';

export const Button = memo(function Button({
  color,
  size,
  top,
  left,
  label,
  position = false,
  arrow = '',
  active = false,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
}) {
  return (
    <div
      className={cn(style.button, style[color], style[size])}
      style={{ top, left }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <i className={cn({ [style.active]: active })} />
      {size === 's1' && arrow && (
        <em style={{ transform: `${arrow} scale(1,2)` }} />
      )}
      <span className={cn({ [style.position]: position })}>{label}</span>
    </div>
  );
});
