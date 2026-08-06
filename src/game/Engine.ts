// src/game/Engine.ts
/**
 * Simple game engine placeholder for Pac-Man.
 * Handles state updates, diffing, and lazy asset loading.
 */
import { Direction } from "../input/types";
import { Fruit } from "./Fruit";

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
  fruit: import('./Fruit').Fruit | null;
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

  /** Simulate eating a dot */
  eatDot() {
    if (this.state.remainingDots <= 0) return;
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
