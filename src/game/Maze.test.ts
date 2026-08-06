import { Maze } from './Maze';

describe('Maze', () => {
  test('default layout is deep copied by getLayout', () => {
    const maze = new Maze();
    const layoutCopy = maze.getLayout();
    // modify copy
    layoutCopy[0][0] = 9;
    const original = maze.getLayout();
    expect(original[0][0]).not.toBe(9);
  });

  test('getCellSize returns default cell size', () => {
    const maze = new Maze();
    expect(maze.getCellSize()).toBe(40);
  });
});
