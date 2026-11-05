export const blockShape = {
  I: [[1, 1, 1, 1]],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
};

export const origin = {
  I: [[-1, 1], [1, -1]],
  L: [[0, 0]],
  J: [[0, 0]],
  Z: [[0, 0]],
  S: [[0, 0]],
  O: [[0, 0]],
  T: [[0, 0], [1, 0], [-1, 1], [0, -1]],
};

export const blockType = Object.keys(blockShape);

export const speeds = [800, 650, 500, 370, 250, 160];
export const delays = [50, 60, 70, 80, 90, 100];
export const clearPoints = [100, 300, 700, 1500];
export const eachLines = 20;
export const StorageKey = 'REACT_TETRIS';

export const i18n = {
  title: '俄罗斯方块',
  titleCenter: '俄罗斯方块<br />TETRIS',
  point: '得分',
  highestScore: '最高分',
  lastRound: '上轮得分',
  cleans: '消除行',
  level: '级别',
  startLine: '起始行',
  next: '下一个',
  pause: '暂停',
  sound: '音效',
  reset: '重玩',
  rotation: '旋转',
  left: '左移',
  right: '右移',
  down: '下移',
  drop: '掉落',
};

export const createBlankMatrix = () => Array.from({ length: 20 }, () => Array(10).fill(0));
