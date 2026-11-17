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

  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    act.down();
  }, [act]);

  const onPointerUp = useCallback((e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    act.up();
  }, [act]);

  const onPointerCancel = useCallback((e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    act.up();
  }, [act]);

  const onKeyDown = useCallback((e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (!e.repeat) {
        e.preventDefault();
        act.down();
      }
    }
  }, [act]);

  const onKeyUp = useCallback((e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      act.up();
    }
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
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    />
  );
});

export const Keyboard = memo(function Keyboard({ filling = 0 }) {
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
    <section
      className={style.keyboard}
      aria-label="游戏按键控制器"
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
    </section>
  );
});
