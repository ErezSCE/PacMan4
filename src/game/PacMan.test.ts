import { PacMan } from './PacMan';
import { Maze } from './Maze';
import { Position } from '../GameEngine';

describe('PacMan', () => {
  test('draw uses maze cell size for positioning', () => {
    const maze = new Maze(undefined, 50); // custom cell size 50
    const start: Position = { x: 2, y: 3 };
    const pac = new PacMan(maze, start);

    const ctx: any = {
      fillStyle: '',
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
    };

    pac.draw(ctx as CanvasRenderingContext2D);

    // Expected center: x*cellSize + cellSize/2, y*cellSize + cellSize/2
    const expectedX = start.x * 50 + 25;
    const expectedY = start.y * 50 + 25;
    const expectedRadius = 50 / 2 - 4;
    expect(ctx.arc).toHaveBeenCalledWith(expectedX, expectedY, expectedRadius, 0, Math.PI * 2);
  });
});
