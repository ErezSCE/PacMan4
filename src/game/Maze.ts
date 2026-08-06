/**
 * Minimal Maze implementation for Canvas rendering.
 * Provides a static layout and a draw method.
 */
export class Maze {
  private layout: number[][];
  private cellSize: number;

  /**
   * Create a Maze.
   * @param layout Optional custom layout; defaults to a 5x5 demo layout.
   * @param cellSize Optional cell size in pixels; defaults to 40.
   */
  constructor(layout?: number[][], cellSize: number = 40) {
    this.layout = layout ?? [
      [1, 1, 1, 1, 1],
      [1, 2, 0, 3, 1],
      [1, 0, 1, 0, 1],
      [1, 2, 0, 2, 1],
      [1, 1, 1, 1, 1],
    ];
    this.cellSize = cellSize;
  }

  /**
   * Draw the maze onto the provided 2D rendering context.
   * Walls are drawn as dark squares, empty cells as light squares,
   * dots as small circles, and power pellets as larger circles.
   */
  public draw(ctx: CanvasRenderingContext2D) {
    const cellSize = this.cellSize; // use instance cellSize
    for (let y = 0; y < this.layout.length; y++) {
      for (let x = 0; x < this.layout[y].length; x++) {
        const cell = this.layout[y][x];
        const px = x * cellSize;
        const py = y * cellSize;
        // Draw background
        ctx.fillStyle = cell === 1 ? '#000' : '#222';
        ctx.fillRect(px, py, cellSize, cellSize);
        // Draw dot or pellet
        if (cell === 2) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 3) {
          ctx.fillStyle = '#ff0';
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  /** Expose layout for external use (e.g., GameEngine) */
  public getLayout(): number[][] {
    return this.layout.map(row => row.slice());
  }

  /** Get cell size in pixels */
  public getCellSize(): number {
    return this.cellSize;
  }
