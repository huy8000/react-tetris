import { describe, it, expect } from 'vitest';
import { Block, rotateShape } from '../block';
import {
  want,
  isClear,
  isOver,
  getNextType,
  getStartMatrix,
} from '../utils';
import { blockType, createBlankMatrix } from '../consts';

describe('Game Core Logic', () => {
  describe('rotateShape', () => {
    it('should rotate matrix counter-clockwise', () => {
      const shape = [
        [0, 0, 1],
        [1, 1, 1],
      ];
      const rotated = rotateShape(shape);
      expect(rotated).toEqual([
        [1, 1],
        [0, 1],
        [0, 1],
      ]);
    });

    it('should rotate 4 times back to original shape', () => {
      const shape = [
        [0, 1, 0],
        [1, 1, 1],
      ];
      let current = shape;
      for (let i = 0; i < 4; i++) {
        current = rotateShape(current);
      }
      expect(current).toEqual(shape);
    });
  });

  describe('Block class', () => {
    it('should initialize with default coordinates', () => {
      const iBlock = new Block({ type: 'I' });
      expect(iBlock.xy).toEqual([0, 3]);

      const tBlock = new Block({ type: 'T' });
      expect(tBlock.xy).toEqual([-1, 4]);
    });

    it('should move left, right and fall correctly', () => {
      const block = new Block({ type: 'T', xy: [5, 4] });
      const left = block.left();
      expect(left.xy).toEqual([5, 3]);

      const right = block.right();
      expect(right.xy).toEqual([5, 5]);

      const fall = block.fall(2);
      expect(fall.xy).toEqual([7, 4]);
    });

    it('should rotate and update rotateIndex', () => {
      const block = new Block({ type: 'T', xy: [5, 4], rotateIndex: 0 });
      const rotated = block.rotate();
      expect(rotated.rotateIndex).toBe(1);
    });
  });

  describe('want (Collision Detection)', () => {
    it('should allow valid positions on empty matrix', () => {
      const matrix = createBlankMatrix();
      const block = new Block({ type: 'T', xy: [5, 4] });
      expect(want(block, matrix)).toBe(true);
    });

    it('should disallow positions beyond the left boundary', () => {
      const matrix = createBlankMatrix();
      const block = new Block({ type: 'T', xy: [5, -1] });
      expect(want(block, matrix)).toBe(false);
    });

    it('should disallow positions beyond the right boundary', () => {
      const matrix = createBlankMatrix();
      const block = new Block({ type: 'T', xy: [5, 8] }); // T is 3 wide, 8+3 > 10
      expect(want(block, matrix)).toBe(false);
    });

    it('should disallow positions beyond the bottom boundary', () => {
      const matrix = createBlankMatrix();
      const block = new Block({ type: 'T', xy: [19, 4] }); // T is 2 high, 19+2 > 20
      expect(want(block, matrix)).toBe(false);
    });

    it('should disallow overlapping with existing blocks', () => {
      const matrix = createBlankMatrix();
      matrix[5][5] = 1;
      const block = new Block({ type: 'T', xy: [4, 4] }); // T has block at [xy[0]+1, xy[1]+1] = [5, 5]
      expect(want(block, matrix)).toBe(false);
    });
  });

  describe('isClear (Line Clear Detection)', () => {
    it('should return false if no lines are complete', () => {
      const matrix = createBlankMatrix();
      expect(isClear(matrix)).toBe(false);
    });

    it('should identify full rows', () => {
      const matrix = createBlankMatrix();
      matrix[19] = Array(10).fill(1);
      matrix[18] = Array(10).fill(1);
      expect(isClear(matrix)).toEqual([18, 19]);
    });
  });

  describe('isOver (Game Over Detection)', () => {
    it('should return false when top row is empty', () => {
      const matrix = createBlankMatrix();
      expect(isOver(matrix)).toBe(false);
    });

    it('should return true when top row contains a block', () => {
      const matrix = createBlankMatrix();
      matrix[0][4] = 1;
      expect(isOver(matrix)).toBe(true);
    });
  });

  describe('getNextType', () => {
    it('should return one of the 7 standard tetromino types', () => {
      for (let i = 0; i < 50; i++) {
        const type = getNextType();
        expect(blockType).toContain(type);
      }
    });
  });

  describe('getStartMatrix', () => {
    it('should generate a 20x10 matrix with the specified start lines', () => {
      const startLines = 3;
      const matrix = getStartMatrix(startLines);
      expect(matrix.length).toBe(20);
      expect(matrix[0].length).toBe(10);

      // Top (20 - startLines) rows must be empty
      for (let i = 0; i < 20 - startLines; i++) {
        expect(matrix[i].every(c => c === 0)).toBe(true);
      }

      // Bottom startLines rows must have blocks
      for (let i = 20 - startLines; i < 20; i++) {
        expect(matrix[i].some(c => c === 1)).toBe(true);
      }
    });
  });
});
