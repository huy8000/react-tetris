import style from './index.module.less';
import { blockShape } from '../../game/consts';

const xy = {
  I: [1, 0],
  L: [0, 0],
  J: [0, 0],
  Z: [0, 0],
  S: [0, 0],
  O: [0, 1],
  T: [0, 0],
};

const empty = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

export function NextPreview({ data = 'T' }) {
  const shape = blockShape[data] || blockShape.T;
  const block = empty.map(row => [...row]);
  const offset = xy[data] || [0, 0];

  shape.forEach((row, k1) => {
    row.forEach((val, k2) => {
      if (val && block[k1 + offset[0]]) {
        block[k1 + offset[0]][k2 + offset[1]] = 1;
      }
    });
  });

  return (
    <div className={style.next}>
      {block.map((row, k1) => (
        <div key={k1}>
          {row.map((val, k2) => (
            <b key={k2} className={val ? 'c' : ''} />
          ))}
        </div>
      ))}
    </div>
  );
}
