import { Engine } from './Engine';
import { Direction } from '../input/types';

describe('Engine', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine();
  });

  test('initial state has no fruit', () => {
    const state = engine.getState();
    expect(state.fruit).toBeNull();
  });

  test('spawns fruit after eating enough dots', () => {
    // eat 70 dots to trigger fruit spawn
    for (let i = 0; i < 70; i++) {
      engine.eatDot();
    }
    const state = engine.getState();
    expect(state.fruit).not.toBeNull();
    expect(state.fruit?.active).toBe(true);
    expect(state.fruit?.type.name).toBeDefined();
  });

  test('getState returns live Fruit instance with methods', () => {
    for (let i = 0; i < 70; i++) {
      engine.eatDot();
    }
    const state = engine.getState();
    expect(state.fruit).not.toBeNull();
    // Fruit instance should have collect method
    // @ts-ignore - accessing method for test
    expect(typeof state.fruit?.collect).toBe('function');
    expect(state.fruit?.type).toEqual(expect.objectContaining({ name: expect.any(String), points: expect.any(Number) }));
  });

  test('advances level and resets levelAdvanced flag', () => {
    // eat all dots to trigger level advance
    for (let i = 0; i < 240; i++) {
      engine.eatDot();
    }
    const state = engine.getState();
    expect(state.level).toBe(2);
    // internal flag should be false after advance
    // @ts-ignore accessing private field for test purposes
    expect((engine as any).levelAdvanced).toBe(false);
  });

  test('tick clears inactive fruit', () => {
    for (let i = 0; i < 70; i++) {
      engine.eatDot();
    }
    // Get the live fruit instance from state
    const fruitInstance = engine.getState().fruit as any;
    // Simulate timeout by advancing timers
    jest.advanceTimersByTime(10000);
    // Ensure the fruit instance is now inactive
    expect(fruitInstance.active).toBe(false);
    const changed = engine.tick();
    const state = engine.getState();
    expect(state.fruit).toBeNull();
    // tick should report change because fruit cleared
    expect(changed).toBe(true);
  });

  test('hasStateChanged returns false when no changes', () => {
    // first tick always true
    expect(engine.tick()).toBe(true);
    // subsequent tick without changes should be false
    expect(engine.tick()).toBe(false);
  });
});
