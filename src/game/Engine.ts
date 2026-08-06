// src/game/Engine.ts
/**
 * Simple game engine placeholder for Pac-Man.
 * Handles state updates, diffing, and lazy asset loading.
 */
import { Direction } from "../input/types";

export interface GameState {
  direction: Direction;
  // Add more properties as needed (e.g., player position, score)
}

export class Engine {
  private state: GameState = { direction: Direction.None };
  private prevState: GameState | null = null;
  private assetsLoaded = false;
  private levelData: any = null;
  private spriteSheet: any = null;

  /** Load level data and sprite sheet lazily via dynamic import */
  async loadAssets(): Promise<void> {
    if (this.assetsLoaded) return;
    const [{ default: level }, { default: sprite }] = await Promise.all([
      import("../assets/levels/level1"),
      import("../assets/sprites/spriteSheet"),
    ]);
    this.levelData = level;
    this.spriteSheet = sprite;
    this.assetsLoaded = true;
  }

  /** Update the engine state */
  setDirection(dir: Direction) {
    this.state.direction = dir;
  }

  /** Get a copy of the current state */
  getState(): GameState {
    return { ...this.state };
  }

  /** Determine if the state has changed since last frame */
  private hasStateChanged(): boolean {
    if (!this.prevState) return true;
    return this.prevState.direction !== this.state.direction;
  }

  /** Called each animation frame. Returns true if a redraw is needed. */
  tick(): boolean {
    const changed = this.hasStateChanged();
    this.prevState = { ...this.state };
    return changed;
  }
}
