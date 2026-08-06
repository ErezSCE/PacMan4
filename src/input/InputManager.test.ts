// src/input/InputManager.test.ts
import { InputManager } from './InputManager';
import { Direction } from './types';

describe('InputManager', () => {
  let callback: jest.Mock;
  let manager: InputManager;

  beforeEach(() => {
    jest.useFakeTimers();
    callback = jest.fn();
    // Use a debounce of 0 to simplify testing unless testing debounce behavior
    manager = new InputManager(callback, 0);
    manager.start();
  });

  afterEach(() => {
    manager.stop();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('maps ArrowUp key to Direction.Up', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    window.dispatchEvent(event);
    jest.runAllTimers();
    expect(callback).toHaveBeenCalledWith(Direction.Up);
  });

  test('maps WASD keys to directions', () => {
    const keys: { key: string; expected: Direction }[] = [
      { key: 'w', expected: Direction.Up },
      { key: 'a', expected: Direction.Left },
      { key: 's', expected: Direction.Down },
      { key: 'd', expected: Direction.Right },
    ];
    keys.forEach(({ key, expected }) => {
      const ev = new KeyboardEvent('keydown', { key });
      window.dispatchEvent(ev);
      // run timers after each to avoid debounce overriding
      jest.runAllTimers();
      expect(callback).toHaveBeenCalledWith(expected);
    });
    expect(callback).toHaveBeenCalledTimes(4);
  });

  test('detects swipe right gesture', () => {
    // Use MouseEvent as a fallback for PointerEvent in jsdom
    const down = new MouseEvent('pointerdown', { clientX: 0, clientY: 0 });
    const up = new MouseEvent('pointerup', { clientX: 100, clientY: 0 });
    window.dispatchEvent(down);
    window.dispatchEvent(up);
    jest.runAllTimers();
    expect(callback).toHaveBeenCalledWith(Direction.Right);
  });

  test('debounce prevents rapid duplicate inputs', () => {
    // Create manager with 50ms debounce
    manager.stop();
    manager = new InputManager(callback, 50);
    manager.start();
    const ev1 = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    const ev2 = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    window.dispatchEvent(ev1);
    // advance 10ms, still within debounce window
    jest.advanceTimersByTime(10);
    window.dispatchEvent(ev2);
    // advance past debounce period
    jest.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(Direction.Up);
  });
});
