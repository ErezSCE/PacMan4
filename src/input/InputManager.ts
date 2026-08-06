// src/input/InputManager.ts
import { Direction } from './types';
import { debounce } from './debounce';

type DirectionCallback = (direction: Direction) => void;

/**
 * InputManager handles keyboard, swipe, and on‑screen button inputs.
 * It normalises them into Direction commands and forwards them via a callback.
 * Input changes are debounced to avoid multiple rapid updates within a single frame.
 */
export class InputManager {
  private callback: DirectionCallback;
  private debouncedSetDirection: DirectionCallback;
  private lastTouchPos: { x: number; y: number } | null = null;

  constructor(callback: DirectionCallback, debounceMs: number = 16) {
    this.callback = callback;
    this.debouncedSetDirection = debounce(this.setDirection.bind(this), debounceMs);
  }

  /** Start listening to input events */
  public start() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointerup', this.handlePointerUp);
  }

  /** Stop listening to input events */
  public stop() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointerup', this.handlePointerUp);
  }

  /** Called by on‑screen buttons */
  public handleButton(direction: Direction) {
    this.debouncedSetDirection(direction);
  }

  private setDirection(direction: Direction) {
    this.callback(direction);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const dir = this.mapKeyToDirection(e.key);
    if (dir && dir !== Direction.None) {
      e.preventDefault();
      this.debouncedSetDirection(dir);
    }
  };

  private mapKeyToDirection(key: string): Direction {
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        return Direction.Up;
      case 'ArrowDown':
      case 's':
      case 'S':
        return Direction.Down;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        return Direction.Left;
      case 'ArrowRight':
      case 'd':
      case 'D':
        return Direction.Right;
      default:
        return Direction.None;
    }
  }

  private handlePointerDown = (e: PointerEvent) => {
    this.lastTouchPos = { x: e.clientX, y: e.clientY };
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (!this.lastTouchPos) return;
    const dx = e.clientX - this.lastTouchPos.x;
    const dy = e.clientY - this.lastTouchPos.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    let direction = Direction.None;
    if (absDx > absDy) {
      direction = dx > 0 ? Direction.Right : Direction.Left;
    } else if (absDy > absDx) {
      direction = dy > 0 ? Direction.Down : Direction.Up;
    }
    if (direction !== Direction.None) {
      this.debouncedSetDirection(direction);
    }
    this.lastTouchPos = null;
  };
}
