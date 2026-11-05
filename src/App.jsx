import { useState, useEffect, useMemo } from 'preact/hooks';
import { memo } from 'preact/compat';
import { useShallow } from 'zustand/shallow';
import style from './App.module.less';
import { cn } from './utils/cn';
import { useTetrisStore } from './game/store';
import { setupKeyboardListeners, startGameLoop } from './game/controls';
import { sound } from './game/audio';
import { i18n } from './game/consts';

import { Decorate } from './components/Decorate';
import { MatrixDisplay } from './components/Matrix';
import { LogoDisplay } from './components/Logo';
import { PointDisplay } from './components/Point';
import { NumberDisplay } from './components/Number';
import { NextPreview } from './components/Next';
import { MusicIndicator } from './components/Music';
import { PauseIndicator } from './components/Pause';
import { Keyboard } from './components/Keyboard';
import { Guide } from './components/Guide';

export function App() {
  const [dimensions, setDimensions] = useState({
    w: document.documentElement.clientWidth,
    h: document.documentElement.clientHeight,
  });

  const {
    matrix, cur, reset, points, max, clearLines,
    startLines, speedRun, speedStart, next, music, pause, drop,
  } = useTetrisStore(
    useShallow(s => ({
      matrix: s.matrix,
      cur: s.cur,
      reset: s.reset,
      points: s.points,
      max: s.max,
      clearLines: s.clearLines,
      startLines: s.startLines,
      speedRun: s.speedRun,
      speedStart: s.speedStart,
      next: s.next,
      music: s.music,
      pause: s.pause,
      drop: s.drop,
    }))
  );

  // Sound initialization & controls
  useEffect(() => {
    sound.init();
    sound.enabled = music;
    const cleanupKeys = setupKeyboardListeners();
    const cleanupLoop = startGameLoop();

    const onResize = () => {
      setDimensions({
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
      });
    };
    window.addEventListener('resize', onResize, true);

    return () => {
      cleanupKeys();
      cleanupLoop();
      window.removeEventListener('resize', onResize, true);
    };
  }, []);

  // Compute responsive layout
  const { filling, appStyle } = useMemo(() => {
    const ratio = dimensions.h / dimensions.w;
    let fill = 0;
    let computedStyle = {};

    if (ratio < 1.5) {
      const scale = dimensions.h / 960;
      computedStyle = {
        transform: `scale(${scale})`,
      };
    } else {
      const scale = dimensions.w / 640;
      fill = (dimensions.h - (960 * scale)) / scale / 3;
      computedStyle = {
        transform: `scale(${scale})`,
        paddingTop: Math.floor(fill) + 42,
        paddingBottom: Math.floor(fill),
        marginTop: Math.floor(-480 - (fill * 1.5)),
      };
    }
    return { filling: fill, appStyle: computedStyle };
  }, [dimensions.w, dimensions.h]);

  return (
    <div className={style.app} style={appStyle}>
      <div className={cn(style.rect, { [style.drop]: drop })}>
        <Decorate />
        <div className={style.screen}>
          <div className={style.panel}>
            <MatrixDisplay matrix={matrix} cur={cur} reset={reset} />
            <LogoDisplay cur={!!cur} reset={reset} />
            <div className={style.state}>
              <PointDisplay cur={!!cur} point={points} max={max} />
              <p>{cur ? i18n.cleans : i18n.startLine}</p>
              <NumberDisplay number={cur ? clearLines : startLines} />
              <p>{i18n.level}</p>
              <NumberDisplay number={cur ? speedRun : speedStart} length={1} />
              <p>{i18n.next}</p>
              <NextPreview data={next} />
              <div className={style.bottom}>
                <MusicIndicator data={music} />
                <PauseIndicator data={pause} />
                <NumberDisplay time />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Keyboard filling={filling} />
      <Guide />
    </div>
  );
}
