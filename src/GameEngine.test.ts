import { GameEngine, Direction } from './GameEngine';

describe('GameEngine', () => {
  const simpleMaze = [
    // 0 empty, 1 wall, 2 dot, 3 power pellet
    [1, 1, 1, 1, 1],
    [1, 2, 0, 3, 1],
    [1, 0, 1, 0, 1],
    [1, 2, 0, 2, 1],
    [1, 1, 1, 1, 1],
  ];
  const pacStart = { x: 2, y: 2 }; // center empty cell

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
    engine.setDirection('right'); // target (3,2) is 0
    engine.update(16);
    const { pacMan } = engine.getState();
    expect(pacMan).toEqual({ x: 3, y: 2 });
  });

  test('pac‑man cannot move through walls', () => {
    engine.setDirection('up'); // target (2,1) is 0 actually, need wall test
    // Move left into wall at (1,2) which is 0? Actually (1,2) is 0, wall at (0,2) is 1.
    engine.setDirection('left'); // target (1,2) empty, then another left would hit wall.
    engine.update(16);
    engine.setDirection('left');
    engine.update(16);
    const { pacMan } = engine.getState();
    // Should be at (1,2) after first left, second left blocked by wall at (0,2)
    expect(pacMan).toEqual({ x: 1, y: 2 });
  });

  test('eating a dot increments score and reduces dotsRemaining', () => {
    // Pac‑Man at (2,2), move down to (2,3) which is 0, then left to (1,3) which is dot (2)
    engine.setDirection('down');
    engine.update(16);
    engine.setDirection('left');
    engine.update(16);
    const state = engine.getState();
    expect(state.score).toBe(10);
    expect(state.dotsRemaining).toBe(3);
    // The dot cell should now be empty
    expect(state.maze[3][1]).toBe(0);
  });

  test('eating a power pellet triggers scared mode', () => {
    // Move up to (2,1) empty, then right to (3,1) pellet (3)
    engine.setDirection('up');
    engine.update(16);
    engine.setDirection('right');
    engine.update(16);
    const state = engine.getState();
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
