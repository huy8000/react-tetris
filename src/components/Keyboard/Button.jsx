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
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
}) {
  return (
    <button
      type="button"
      className={cn(style.button, style[color], style[size])}
      style={{ top, left }}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      <i className={cn({ [style.active]: active })} aria-hidden="true" />
      {size === 's1' && arrow && (
        <em style={{ transform: `${arrow} scale(1,2)` }} aria-hidden="true" />
      )}
      <span className={cn({ [style.position]: position })} aria-hidden="true">{label}</span>
    </button>
  );
});
