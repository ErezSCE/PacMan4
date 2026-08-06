/**
 * Fruit entity representing a bonus fruit that appears after a certain number of dots are eaten.
 * It provides the type (name) and point value based on the current level.
 * The fruit is active for a limited time; after timeout it disappears.
 */

export type FruitType = {
  name: string;
  points: number;
};

// Simple mapping of level to fruit type and points. In a full game this would be more extensive.
const FRUIT_BY_LEVEL: Record<number, FruitType> = {
  1: { name: 'Cherry', points: 100 },
  2: { name: 'Strawberry', points: 300 },
  3: { name: 'Orange', points: 500 },
  4: { name: 'Apple', points: 700 },
  // default fallback
  5: { name: 'Melon', points: 1000 },
  6: { name: 'Galaxian', points: 2000 },
  7: { name: 'Bell', points: 3000 },
  8: { name: 'Key', points: 5000 },
};

export class Fruit {
  public readonly type: FruitType;
  public readonly spawnLevel: number;
  public active: boolean = true;
  private timeoutMs: number;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  /**
   * Create a fruit for the given level.
   * @param level Current game level (1‑based).
   * @param timeoutMs How long the fruit stays active (default 10 seconds).
   */
  constructor(level: number, timeoutMs: number = 10000) {
    this.spawnLevel = level;
    this.type = FRUIT_BY_LEVEL[level] ?? { name: 'Cherry', points: 100 };
    this.timeoutMs = timeoutMs;
    // Start the timeout that will deactivate the fruit.
    this.startTimeout();
  }

  private startTimeout() {
    this.timeoutHandle = setTimeout(() => {
      this.active = false;
    }, this.timeoutMs);
  }

  /** Manually expire the fruit (e.g., when collected). */
  public collect(): void {
    this.active = false;
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }
}
