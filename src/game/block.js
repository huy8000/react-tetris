import { blockShape, origin } from './consts';

export function rotateShape(shape) {
  const result = [];
  shape.forEach(row => {
    row.forEach((val, k) => {
      const idx = row.length - k - 1;
      if (!result[idx]) result[idx] = [];
      result[idx].push(val);
    });
  });
  return result;
}

export class Block {
  constructor(option = {}) {
    this.type = option.type;
    this.rotateIndex = option.rotateIndex || 0;
    this.timeStamp = option.timeStamp || Date.now();
    this.shape = option.shape ? option.shape.map(row => [...row]) : blockShape[option.type].map(row => [...row]);
    if (!option.xy) {
      if (option.type === 'I') {
        this.xy = [0, 3];
      } else {
        this.xy = [-1, 4];
      }
    } else {
      this.xy = [...option.xy];
    }
  }

  rotate() {
    const result = rotateShape(this.shape);
    const origOffsets = origin[this.type];
    const offset = origOffsets[this.rotateIndex] || [0, 0];
    const nextXy = [this.xy[0] + offset[0], this.xy[1] + offset[1]];
    const nextRotateIndex = (this.rotateIndex + 1) >= origOffsets.length ? 0 : this.rotateIndex + 1;
    return new Block({
      type: this.type,
      shape: result,
      xy: nextXy,
      rotateIndex: nextRotateIndex,
      timeStamp: this.timeStamp,
    });
  }

  fall(n = 1) {
    return new Block({
      type: this.type,
      shape: this.shape,
      xy: [this.xy[0] + n, this.xy[1]],
      rotateIndex: this.rotateIndex,
      timeStamp: Date.now(),
    });
  }

  right() {
    return new Block({
      type: this.type,
      shape: this.shape,
      xy: [this.xy[0], this.xy[1] + 1],
      rotateIndex: this.rotateIndex,
      timeStamp: this.timeStamp,
    });
  }

  left() {
    return new Block({
      type: this.type,
      shape: this.shape,
      xy: [this.xy[0], this.xy[1] - 1],
      rotateIndex: this.rotateIndex,
      timeStamp: this.timeStamp,
    });
  }
}
