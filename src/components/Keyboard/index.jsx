import { useEffect, useCallback } from 'preact/hooks';
import { memo } from 'preact/compat';
import style from './index.module.less';
import { Button } from './Button';
import { useTetrisStore } from '../../game/store';
import { actions } from '../../game/controls';
import { i18n } from '../../game/consts';

const ActionButton = memo(function ActionButton({ actionKey, keyName, color, size, top, left, label, arrow, position }) {
  const active = useTetrisStore(s => s.keyboard[keyName]);
  const act = actions[actionKey];

  const onMouseDown = useCallback((e) => {
    if (e.preventDefault) e.preventDefault();
    act.down();
  }, [act]);

  const onMouseUp = useCallback((e) => {
    if (e.preventDefault) e.preventDefault();
    act.up();
  }, [act]);

  const onMouseLeave = useCallback(() => {
    act.up();
  }, [act]);

  const onTouchStart = useCallback((e) => {
    if (e.preventDefault) e.preventDefault();
    act.down();
  }, [act]);

  const onTouchEnd = useCallback((e) => {
    if (e.preventDefault) e.preventDefault();
    act.up();
  }, [act]);

  return (
    <Button
      color={color}
      size={size}
      top={top}
      left={left}
      label={label}
      arrow={arrow}
      position={position}
      active={active}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    />
  );
});

export const Keyboard = memo(function Keyboard({ filling = 0 }) {
  // Prevent default pinch/zoom, long press context menu
  useEffect(() => {
    const prevent = (e) => {
      if (e.preventDefault) e.preventDefault();
    };
    document.addEventListener('gesturestart', prevent);
    return () => {
      document.removeEventListener('gesturestart', prevent);
    };
  }, []);

  return (
    <div
      className={style.keyboard}
      style={{
        marginTop: 20 + filling,
      }}
    >
      <ActionButton
        actionKey="rotate"
        keyName="rotate"
        color="blue"
        size="s1"
        top={0}
        left={374}
        label={i18n.rotation}
        arrow="translate(0, 63px)"
        position
      />
      <ActionButton
        actionKey="down"
        keyName="down"
        color="blue"
        size="s1"
        top={180}
        left={374}
        label={i18n.down}
        arrow="translate(0,-71px) rotate(180deg)"
      />
      <ActionButton
        actionKey="left"
        keyName="left"
        color="blue"
        size="s1"
        top={90}
        left={284}
        label={i18n.left}
        arrow="translate(60px, -12px) rotate(270deg)"
      />
      <ActionButton
        actionKey="right"
        keyName="right"
        color="blue"
        size="s1"
        top={90}
        left={464}
        label={i18n.right}
        arrow="translate(-60px, -12px) rotate(90deg)"
      />
      <ActionButton
        actionKey="space"
        keyName="drop"
        color="blue"
        size="s0"
        top={100}
        left={52}
        label={`${i18n.drop} (SPACE)`}
      />
      <ActionButton
        actionKey="r"
        keyName="reset"
        color="red"
        size="s2"
        top={0}
        left={196}
        label={`${i18n.reset}(R)`}
      />
      <ActionButton
        actionKey="music"
        keyName="music"
        color="green"
        size="s2"
        top={0}
        left={106}
        label={`${i18n.sound}(M)`}
      />
      <ActionButton
        actionKey="p"
        keyName="pause"
        color="green"
        size="s2"
        top={0}
        left={16}
        label={`${i18n.pause}(P)`}
      />
    </div>
  );
});
