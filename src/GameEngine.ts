/**
 * GameEngine module
 * Handles the game loop, state updates, collision detection, and level progression.
 * This implementation is deliberately simple for unit testing purposes.
 */

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  maze: number[][]; // 0 empty, 1 wall, 2 dot, 3 power pellet
  pacMan: Position;
  score: number;
  level: number;
  scaredMode: boolean;
  levelComplete: boolean;
  dotsRemaining: number;
}

export class GameEngine {
  private state: GameState;
  private direction: Direction | null = null;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;

  constructor(initialMaze: number[][], pacManStart: Position) {
    const dots = this.countDots(initialMaze);
    this.state = {
      maze: initialMaze.map(row => row.slice()), // deep copy
      pacMan: { ...pacManStart },
      score: 0,
      level: 1,
      scaredMode: false,
      levelComplete: false,
      dotsRemaining: dots,
    };
  }

  /** Count dots and power pellets in the maze */
  private countDots(maze: number[][]): number {
    let count = 0;
    for (const row of maze) {
      for (const cell of row) {
        if (cell === 2 || cell === 3) count++;
      }
    }
    return count;
  }

  /** Public accessor for current state (read‑only) */
  public getState(): Readonly<GameState> {
    // Return a shallow copy to prevent external mutation
    return { ...this.state, maze: this.state.maze.map(r => r.slice()), pacMan: { ...this.state.pacMan } };
  }

  /** Set the next movement direction */
  public setDirection(dir: Direction) {
    this.direction = dir;
  }

  /** Start the animation loop */
  public start() {
    if (this.animationFrameId !== null) return; // already running
    this.lastTimestamp = performance.now();
    const loop = (timestamp: number) => {
      const delta = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;
      this.update(delta);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  /** Stop the animation loop */
  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /** Update game state – called each frame */
  public update(_deltaMs: number) {
    if (!this.direction) return; // no movement requested
    const { x, y } = this.state.pacMan;
    const [dx, dy] = this.directionToDelta(this.direction);
    const targetX = x + dx;
    const targetY = y + dy;
    // Bounds check
    if (targetY < 0 || targetY >= this.state.maze.length || targetX < 0 || targetX >= this.state.maze[0].length) {
      return; // out of bounds – ignore
    }
    const targetCell = this.state.maze[targetY][targetX];
    // Wall collision – cannot move
    if (targetCell === 1) {
      return;
    }
    // Move Pac‑Man
    this.state.pacMan = { x: targetX, y: targetY };
    // Handle consumables
    if (targetCell === 2) {
      // dot
      this.state.score += 10;
      this.state.maze[targetY][targetX] = 0;
      this.state.dotsRemaining--;
    } else if (targetCell === 3) {
      // power pellet
      this.state.score += 50;
      this.state.maze[targetY][targetX] = 0;
      this.state.dotsRemaining--;
      this.state.scaredMode = true;
    }
    // Level completion check
    if (this.state.dotsRemaining === 0) {
      this.state.levelComplete = true;
    }
  }

  private directionToDelta(dir: Direction): [number, number] {
    switch (dir) {
      case 'up':
        return [0, -1];
      case 'down':
        return [0, 1];
      case 'left':
        return [-1, 0];
      case 'right':
        return [1, 0];
    }
  }
}
