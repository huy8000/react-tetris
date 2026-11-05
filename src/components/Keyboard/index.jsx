import { useEffect } from 'preact/hooks';
import style from './index.module.less';
import { Button } from './Button';
import { useTetrisStore } from '../../game/store';
import { actions } from '../../game/controls';
import { i18n } from '../../game/consts';

export function Keyboard({ filling = 0 }) {
  const keyboard = useTetrisStore(s => s.keyboard);

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

  const bindAction = (key) => {
    const act = actions[key];
    if (!act) return {};

    return {
      onMouseDown: (e) => {
        if (e.preventDefault) e.preventDefault();
        act.down();
      },
      onMouseUp: (e) => {
        if (e.preventDefault) e.preventDefault();
        act.up();
      },
      onMouseLeave: () => {
        act.up();
      },
      onTouchStart: (e) => {
        if (e.preventDefault) e.preventDefault();
        act.down();
      },
      onTouchEnd: (e) => {
        if (e.preventDefault) e.preventDefault();
        act.up();
      },
    };
  };

  return (
    <div
      className={style.keyboard}
      style={{
        marginTop: 20 + filling,
      }}
    >
      <Button
        color="blue"
        size="s1"
        top={0}
        left={374}
        label={i18n.rotation}
        arrow="translate(0, 63px)"
        position
        active={keyboard.rotate}
        {...bindAction('rotate')}
      />
      <Button
        color="blue"
        size="s1"
        top={180}
        left={374}
        label={i18n.down}
        arrow="translate(0,-71px) rotate(180deg)"
        active={keyboard.down}
        {...bindAction('down')}
      />
      <Button
        color="blue"
        size="s1"
        top={90}
        left={284}
        label={i18n.left}
        arrow="translate(60px, -12px) rotate(270deg)"
        active={keyboard.left}
        {...bindAction('left')}
      />
      <Button
        color="blue"
        size="s1"
        top={90}
        left={464}
        label={i18n.right}
        arrow="translate(-60px, -12px) rotate(90deg)"
        active={keyboard.right}
        {...bindAction('right')}
      />
      <Button
        color="blue"
        size="s0"
        top={100}
        left={52}
        label={`${i18n.drop} (SPACE)`}
        active={keyboard.drop}
        {...bindAction('space')}
      />
      <Button
        color="red"
        size="s2"
        top={0}
        left={196}
        label={`${i18n.reset}(R)`}
        active={keyboard.reset}
        {...bindAction('r')}
      />
      <Button
        color="green"
        size="s2"
        top={0}
        left={106}
        label={`${i18n.sound}(S)`}
        active={keyboard.music}
        {...bindAction('s')}
      />
      <Button
        color="green"
        size="s2"
        top={0}
        left={16}
        label={`${i18n.pause}(P)`}
        active={keyboard.pause}
        {...bindAction('p')}
      />
    </div>
  );
}
