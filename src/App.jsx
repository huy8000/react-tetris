import { useState, useEffect } from 'preact/hooks';
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

  const matrix = useTetrisStore(s => s.matrix);
  const cur = useTetrisStore(s => s.cur);
  const reset = useTetrisStore(s => s.reset);
  const points = useTetrisStore(s => s.points);
  const max = useTetrisStore(s => s.max);
  const clearLines = useTetrisStore(s => s.clearLines);
  const startLines = useTetrisStore(s => s.startLines);
  const speedRun = useTetrisStore(s => s.speedRun);
  const speedStart = useTetrisStore(s => s.speedStart);
  const next = useTetrisStore(s => s.next);
  const music = useTetrisStore(s => s.music);
  const pause = useTetrisStore(s => s.pause);
  const drop = useTetrisStore(s => s.drop);

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
  let filling = 0;
  const ratio = dimensions.h / dimensions.w;
  let scale = 1;
  let appStyle = {};

  if (ratio < 1.5) {
    scale = dimensions.h / 960;
    appStyle = {
      transform: `scale(${scale})`,
    };
  } else {
    scale = dimensions.w / 640;
    filling = (dimensions.h - (960 * scale)) / scale / 3;
    appStyle = {
      transform: `scale(${scale})`,
      paddingTop: Math.floor(filling) + 42,
      paddingBottom: Math.floor(filling),
      marginTop: Math.floor(-480 - (filling * 1.5)),
    };
  }

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
