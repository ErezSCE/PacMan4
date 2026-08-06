import { Direction } from "../../input/types";
import { GhostMode } from "./GhostMode";

/**
 * Represents a ghost entity with AI state.
 * This is a simplified implementation sufficient for unit testing the required
 * behaviours: mode transitions, speed adjustments, frightened handling, point
 * escalation, and eye‑return logic.
 */
export class Ghost {
  /** Unique identifier (e.g., "blinky", "pinky") */
  readonly id: string;

  /** Current grid position (pixel coordinates) */
  position: { x: number; y: number };

  /** Current movement direction */
  direction: Direction = Direction.None;

  /** Current AI mode */
  mode: GhostMode = GhostMode.Scatter;

  /** Base speed (pixels per frame) for chase/scatter */
  private readonly baseSpeed: number;

  /** Speed multiplier applied in frightened mode */
  private readonly frightenedSpeedMultiplier: number = 0.5;

  /** Target tile for scatter mode (corner of the maze) */
  private readonly scatterTarget: { x: number; y: number };

  /** Position of the ghost house (eye‑return destination) */
  private readonly housePosition: { x: number; y: number };

  /** Internal counter for successive ghosts eaten during one power‑pellet */
  private eatStreak = 0;

  constructor(
    id: string,
    startPos: { x: number; y: number },
    scatterTarget: { x: number; y: number },
    housePosition: { x: number; y: number },
    baseSpeed: number = 1,
  ) {
    if (baseSpeed <= 0) {
      throw new Error('baseSpeed must be positive');
    }
    if (!scatterTarget || typeof scatterTarget.x !== 'number' || typeof scatterTarget.y !== 'number') {
      throw new Error('scatterTarget must be a valid position object');
    }
    if (!housePosition || typeof housePosition.x !== 'number' || typeof housePosition.y !== 'number') {
      throw new Error('housePosition must be a valid position object');
    }
    this.id = id;
    this.position = { ...startPos };
    this.scatterTarget = { ...scatterTarget };
    this.housePosition = { ...housePosition };
    this.baseSpeed = baseSpeed;
  }

  /** Set the ghost's AI mode */
  setMode(mode: GhostMode) {
    this.mode = mode;
    if (mode === GhostMode.Frightened) {
      this.reverseDirection();
    }
    // When entering Eaten mode, direction is set towards the house later by movement logic.
  }

  /** Reverse current direction (used when entering frightened mode) */
  private reverseDirection() {
    switch (this.direction) {
      case Direction.Up:
        this.direction = Direction.Down;
        break;
      case Direction.Down:
        this.direction = Direction.Up;
        break;
      case Direction.Left:
        this.direction = Direction.Right;
        break;
      case Direction.Right:
        this.direction = Direction.Left;
        break;
      default:
        // No direction to reverse
        break;
    }
  }

  /** Return current movement speed based on mode */
  getSpeed(): number {
    switch (this.mode) {
      case GhostMode.Frightened:
        return this.baseSpeed * this.frightenedSpeedMultiplier;
      case GhostMode.Eaten:
        return this.baseSpeed; // same as normal speed when returning to house
      default:
        return this.baseSpeed;
    }
  }

  /** Called when Pac‑Man eats a power pellet – triggers frightened state */
  onPowerPellet() {
    this.setMode(GhostMode.Frightened);
  }

  /** Called when Pac‑Man collides with this ghost while it is frightened */
  eat(): number {
    // Guard: can only be eaten when in Frightened mode
    if (this.mode !== GhostMode.Frightened) {
      throw new Error('Ghost can only be eaten when frightened');
    }
    // Return points based on current streak and then increment streak
    const pointsTable = [200, 400, 800, 1600];
    const index = Math.min(this.eatStreak, pointsTable.length - 1);
    const pts = pointsTable[index];
    // Increment streak but cap it to the max index of pointsTable
    this.eatStreak = Math.min(this.eatStreak + 1, pointsTable.length - 1);
    // After being eaten the ghost enters Eaten mode (eye‑return)
    this.setMode(GhostMode.Eaten);
    return pts;
  }

  /** Reset the eat streak – called when power‑pellet effect ends */
  resetEatStreak() {
    this.eatStreak = 0;
  }

  /** Called by the game engine when the power‑pellet timer expires */
  onPowerPelletEnd() {
    this.resetEatStreak();
  }

  /** Simple movement step towards a target (used for scatter and eye‑return) */
  moveTowards(target: { x: number; y: number }) {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    // Choose axis with larger distance to move one step (pixel) per call
    if (Math.abs(dx) > Math.abs(dy)) {
      const step = Math.min(this.getSpeed(), Math.abs(dx));
      this.position.x += Math.sign(dx) * step;
      // Do not round here; keep precise float position for smoother movement
      this.direction = dx > 0 ? Direction.Right : Direction.Left;
    } else if (dy !== 0) {
      const step = Math.min(this.getSpeed(), Math.abs(dy));
      this.position.y += Math.sign(dy) * step;
      // Do not round here; keep precise float position for smoother movement
      this.direction = dy > 0 ? Direction.Down : Direction.Up;
    }
    // If reached target (within speed tolerance) snap to target
    if (Math.abs(this.position.x - target.x) < 0.01 && Math.abs(this.position.y - target.y) < 0.01) {
      this.position = { ...target };
    }
  }

  /** Update logic for a single tick – for tests we only handle mode‑specific movement */
  tick(playerPos: { x: number; y: number }) {
    switch (this.mode) {
      case GhostMode.Scatter:
        this.moveTowards(this.scatterTarget);
        break;
      case GhostMode.Chase:
        this.moveTowards(playerPos);
        break;
      case GhostMode.Frightened:
        // Random movement – for deterministic tests we simply move towards a fixed point
        // Here we move towards the opposite of player position to simulate fleeing.
        const opposite = { x: -playerPos.x, y: -playerPos.y };
        this.moveTowards(opposite);
        break;
      case GhostMode.Eaten:
        this.moveTowards(this.housePosition);
        // When reached house, switch back to Scatter (or whatever timer dictates)
        if (Math.abs(this.position.x - this.housePosition.x) < 0.01 && Math.abs(this.position.y - this.housePosition.y) < 0.01) {
          this.setMode(GhostMode.Scatter);
          this.resetEatStreak();
        }
        break;
    }
  }
}
