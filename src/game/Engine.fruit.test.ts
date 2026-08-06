import { Engine } from './Engine';
import { Direction } from '../input/types';

jest.useFakeTimers();

describe('Engine fruit and level scaling', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine();
  });

  test('fruit spawns after 70 dots eaten', () => {
    // Simulate eating 70 dots
    for (let i = 0; i < 70; i++) {
      engine.eatDot();
    }
    const state = engine.getState();
    expect(state.fruit).not.toBeNull();
    expect(state.fruit?.type.name).toBe('Cherry');
    expect(state.fruit?.active).toBe(true);
  });

  test('fruit disappears after timeout if not collected', () => {
    for (let i = 0; i < 70; i++) {
      engine.eatDot();
    }
    const fruit = engine.getState().fruit!;
    expect(fruit.active).toBe(true);
    // Fast-forward timeout (default 10s)
    jest.advanceTimersByTime(10000);
    expect(fruit.active).toBe(false);
    // After timeout, engine should clear inactive fruit from state via tick
    engine.tick();
    expect(engine.getState().fruit).toBeNull();
  });

  test('collecting fruit adds points and clears fruit', () => {
    for (let i = 0; i < 70; i++) {
      engine.eatDot();
    }
    const beforeScore = engine.getState().score;
    engine.collectFruit();
    const afterState = engine.getState();
    expect(afterState.score).toBe(beforeScore + 100); // Cherry points
    expect(afterState.fruit).toBeNull();
  });

  test('advances level after all dots eaten and applies scaling', () => {
    // Eat all dots
    const totalDots = engine.getState().remainingDots;
    for (let i = 0; i < totalDots; i++) {
      engine.eatDot();
    }
    const state = engine.getState();
    expect(state.level).toBe(2);
    expect(state.ghostSpeed).toBeCloseTo(1.1);
    // Scared duration should be reduced by 500ms from base 8000
    expect(state.scaredDuration).toBe(7500);
  });
});
