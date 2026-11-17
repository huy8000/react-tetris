import { memo } from 'preact/compat';
import style from './index.module.less';
import { cn } from '../../utils/cn';
import { i18n } from '../../game/consts';

const rightPattern = [
  [1, 0], [1, 1], [0, 1], [0, 0],
  [0, 1], [1, 1], [0, 1], [0, 0],
  [1, 1], [1, 1], [0, 0],
  [1, 0], [1, 1], [1, 0], [0, 0],
  [1, 1], [1, 0], [1, 0], [0, 0],
  [0, 1], [0, 1], [0, 1], [0, 1],
];

const leftPattern = [
  [0, 1], [1, 1], [1, 0], [0, 0],
  [1, 0], [1, 1], [1, 0], [0, 0],
  [1, 1], [1, 1], [0, 0],
  [0, 1], [1, 1], [0, 1], [0, 0],
  [1, 1], [0, 1], [0, 1], [0, 0],
  [1, 0], [1, 0], [1, 0], [1, 0],
];

export const Decorate = memo(function Decorate() {
  return (
    <div className={style.decorate} aria-hidden="true">
      <div className={style.topBorder}>
        <div className={style.borderGroup}>
          <span className={style.wide} />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={cn(style.borderGroup, style.right)}>
          <span />
          <span />
          <span />
          <span />
          <span className={style.wide} />
        </div>
      </div>

      <h1>{i18n.title}</h1>

      <div className={style.view}>
        {rightPattern.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            cell ? (
              <b key={`${rIdx}-${cIdx}`} className="c" />
            ) : (
              <em key={`${rIdx}-${cIdx}`} />
            )
          )
        )}
      </div>

      <div className={cn(style.view, style.l)}>
        {leftPattern.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            cell ? (
              <b key={`${rIdx}-${cIdx}`} className="c" />
            ) : (
              <em key={`${rIdx}-${cIdx}`} />
            )
          )
        )}
      </div>
    </div>
  );
});
