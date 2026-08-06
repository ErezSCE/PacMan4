// src/game/Engine.ts
/**
 * Simple game engine placeholder for Pac-Man.
 * Handles state updates, diffing, and lazy asset loading.
 */
import { Direction } from "../input/types";

import { Fruit, FruitType } from "./Fruit";
import type { LevelData } from "../assets/levels/level1";
import type { SpriteSheet } from "../assets/sprites/spriteSheet";
export interface FruitInfo {
  active: boolean;
  spawnLevel: number;
  type: FruitType;
}

export interface GameState {
  direction: Direction;
  // Add more properties as needed (e.g., player position, score)
  // Track remaining dots in the current level
  remainingDots: number;
  // Number of dots eaten in current level
  dotsEaten: number;
  // Current level number (1‑based)
  level: number;
  // Active fruit, if any
  fruit: Fruit | null;
  // Ghost speed multiplier (1 = base speed)
  ghostSpeed: number;
  // Scared state duration in ms
  scaredDuration: number;
  // Player score
  score: number;
}

export class Engine {
  private state: GameState = {
    direction: Direction.None,
    remainingDots: 240, // typical total dots for level 1
    dotsEaten: 0,
    level: 1,
    fruit: null,
    ghostSpeed: 1,
    scaredDuration: 8000,
    score: 0,
  };
  private prevState: GameState | null = null;
  private assetsLoaded = false;
  private levelAdvanced: boolean = false;

  /** Load level data and sprite sheet lazily via dynamic import */
  async loadAssets(): Promise<void> {
    if (this.assetsLoaded) return;
    try {
      // Dynamically import assets with explicit types for safety
      const levelModule = (await import('../assets/levels/level1')) as { default: LevelData };
      const spriteModule = (await import('../assets/sprites/spriteSheet')) as { default: SpriteSheet };
      // Assets are loaded; we don't need to store them as they're not used directly here.
      this.assetsLoaded = true;
    } catch (err) {
      // Re‑throw with a descriptive message to aid debugging
      throw new Error(`Failed to load assets: ${(err as Error).message}`);
    }
  }

  /** Update the engine state */
  setDirection(dir: Direction) {
    this.state.direction = dir;
  }

  /** Simulate eating a dot */
  eatDot() {
    if (this.state.remainingDots <= 0) {
      // All dots already eaten; no further action.
      return;
    }
    this.state.remainingDots--;
    this.state.dotsEaten++;
    this.state.score += 10; // each dot worth 10 points
    // Check fruit spawn thresholds
    if ((this.state.dotsEaten === 70 || this.state.dotsEaten === 170) && !this.state.fruit) {
      this.spawnFruit();
    }
    // If all dots eaten, advance level
    if (this.state.remainingDots === 0) {
      this.advanceLevel();
    }
  }

  /** Spawn a fruit for the current level */
  private spawnFruit() {
    this.state.fruit = new Fruit(this.state.level);
  }

  /** Collect the active fruit, adding its points to the score */
  collectFruit() {
    if (this.state.fruit && this.state.fruit.active) {
      this.state.score += this.state.fruit.type.points;
      this.state.fruit.collect();
      this.state.fruit = null;
    }
  }

  /** Advance to the next level and apply scaling */
  private advanceLevel() {
    // If a fruit is still active, collect it to clear its timeout and remove it from state
    if (this.state.fruit) {
      this.state.fruit.collect();
    }
    this.state.level++;
    // Reset dot counters for new level (simplified same total)
    this.state.remainingDots = 240;
    this.state.dotsEaten = 0;
    this.state.fruit = null;
    // Apply scaling rules
    this.state.ghostSpeed = 1 + (this.state.level - 1) * 0.1; // increase 10% per level
    const baseScared = 8000;
    const decrement = (this.state.level - 1) * 500; // decrease 0.5s per level
    this.state.scaredDuration = Math.max(2000, baseScared - decrement);
    // Reset levelAdvanced flag for the new level
    this.levelAdvanced = false;
  }

  /**
   * Returns a read‑only snapshot of the current game state.
   * The returned object is frozen to prevent accidental mutation.
   */
  getState(): Readonly<GameState> {
    // Return a shallow frozen copy to enforce immutability at runtime.
    return Object.freeze({ ...this.state });
  }

  /** Determine if the state has changed since last frame */
  private hasStateChanged(): boolean {
    if (!this.prevState) return true;
    const s = this.state;
    const p = this.prevState;
    if (s.direction !== p.direction) return true;
    if (s.score !== p.score) return true;
    if (s.level !== p.level) return true;
    if (s.remainingDots !== p.remainingDots) return true;
    if (s.ghostSpeed !== p.ghostSpeed) return true;
    if (s.scaredDuration !== p.scaredDuration) return true;
    const sFruitActive = s.fruit?.active ?? false;
    const pFruitActive = p.fruit?.active ?? false;
    if (sFruitActive !== pFruitActive) return true;
    const sFruitName = s.fruit?.type.name ?? '';
    const pFruitName = p.fruit?.type.name ?? '';
    if (sFruitName !== pFruitName) return true;
    return false;
  }

  /** Called each animation frame. Returns true if a redraw is needed. */
  tick(): boolean {
    // Clear inactive fruit to allow future spawns
    if (this.state.fruit && !this.state.fruit.active) {
      this.state.fruit = null;
      // Reset levelAdvanced flag in case level ended while fruit was present
      this.levelAdvanced = false;
    }
    const changed = this.hasStateChanged();
    this.prevState = { ...this.state };
    return changed;
  }
}
