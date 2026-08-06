/**
 * Minimal PacMan implementation for Canvas rendering.
 * It holds a position and can draw itself on a canvas.
 */
import { Maze } from './Maze';

import { Position } from '../GameEngine';

export class PacMan {
  private x: number;
  private y: number;
  private maze: Maze;

  /**
   * Create PacMan.
   * @param maze The maze instance for potential future collision checks.
   * @param startPos Initial position of Pac-Man.
   */
  constructor(maze: Maze, startPos: Position) {
    this.maze = maze;
    this.x = startPos.x;
    this.y = startPos.y;
    // Starting position could be set based on maze, but keep simple.
  }

  /** Update logic – placeholder for future movement handling */
  public update() {
    // No-op for now.
  }

  /** Draw Pac-Man as a yellow circle */
  public draw(ctx: CanvasRenderingContext2D) {
    const cellSize = 40; // must match Maze cellSize
    const radius = cellSize / 2 - 4;
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(this.x * cellSize + cellSize / 2, this.y * cellSize + cellSize / 2, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
