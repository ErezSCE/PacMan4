
import { GameEngine } from './GameEngine';

describe('GameEngine', () => {
  const simpleMaze = [
    // 0 empty, 1 wall, 2 dot, 3 power pellet
    [1, 1, 1, 1, 1],
    [1, 2, 0, 3, 1],
    [1, 0, 1, 0, 1],
    [1, 2, 0, 2, 1],
    [1, 1, 1, 1, 1],
  ];
  const pacStart = { x: 1, y: 2 }; // start on empty cell

  let engine: GameEngine;

  beforeEach(() => {
    // fresh engine for each test
    engine = new GameEngine(simpleMaze, pacStart);
  });

  test('initial state counts dots and pellets correctly', () => {
    const state = engine.getState();
    // dots: cells with 2 (3 of them) + pellets (1) = 4
    expect(state.dotsRemaining).toBe(4);
    expect(state.score).toBe(0);
    expect(state.scaredMode).toBe(false);
    expect(state.levelComplete).toBe(false);
  });

  test('pac‑man moves into empty space', () => {
    // Use a start position with an adjacent empty cell
    const engine2 = new GameEngine(simpleMaze, { x: 1, y: 1 }); // (1,1) is a dot, right cell (2,1) is empty
    engine2.setDirection('right');
    engine2.update(16);
    const { pacMan } = engine2.getState();
    expect(pacMan).toEqual({ x: 2, y: 1 });
  });

  test('pac‑man cannot move through walls', () => {
    // From start (1,2), moving left would hit wall at (0,2)
    engine.setDirection('left');
    engine.update(16);
    const { pacMan } = engine.getState();
    expect(pacMan).toEqual({ x: 1, y: 2 });
  });

  test('eating a dot increments score and reduces dotsRemaining', () => {
    // From start (1,2), move down to (1,3) which is a dot (2)
    engine.setDirection('down');
    engine.update(16);
    const state = engine.getState();
    expect(state.score).toBe(10);
    expect(state.dotsRemaining).toBe(3);
    // The dot cell should now be empty
    expect(state.maze[3][1]).toBe(0);
  });

  test('eating a power pellet triggers scared mode', () => {
    // Start adjacent to pellet at (3,1)
    const engine2 = new GameEngine(simpleMaze, { x: 2, y: 1 }); // (2,1) is empty, pellet at (3,1)
    engine2.setDirection('right');
    engine2.update(16);
    const state = engine2.getState();
    expect(state.score).toBe(50);
    expect(state.scaredMode).toBe(true);
    expect(state.dotsRemaining).toBe(3);
    expect(state.maze[1][3]).toBe(0);
  });

  test('level completes when all consumables are eaten', () => {
    // Manually eat all dots/pellets via sequence
    // Eat dot at (1,1)
    engine.setDirection('up'); // to (2,1)
    engine.update(16);
    engine.setDirection('left'); // to (1,1) dot
    engine.update(16);
    // Eat pellet at (3,1)
    engine.setDirection('right'); // back to (2,1)
    engine.update(16);
    engine.setDirection('right'); // to (3,1) pellet
    engine.update(16);
    // Eat dot at (1,3)
    engine.setDirection('down'); // to (3,1)
    engine.update(16);
    engine.setDirection('down'); // to (3,2) empty
    engine.update(16);
    engine.setDirection('left'); // to (2,2) empty
    engine.update(16);
    engine.setDirection('left'); // to (1,2) empty
    engine.update(16);
    engine.setDirection('down'); // to (1,3) dot
    engine.update(16);
    // Eat dot at (3,3)
    engine.setDirection('right'); // to (2,3) empty
    engine.update(16);
    engine.setDirection('right'); // to (3,3) dot
    engine.update(16);
    const finalState = engine.getState();
    expect(finalState.dotsRemaining).toBe(0);
    expect(finalState.levelComplete).toBe(true);
  });
});
