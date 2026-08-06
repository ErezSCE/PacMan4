import { Ghost } from '../game/ghost/Ghost';
import { GhostMode } from '../game/ghost/GhostMode';
import { GhostModeTimer, ModePhase } from '../game/ghost/GhostModeTimer';
import { Direction } from '../input/types';

describe('GhostModeTimer', () => {
  it('should follow the configured phase sequence and stay on last phase', () => {
    const phases: ModePhase[] = [
      { mode: 'scatter', durationMs: 7000 },
      { mode: 'chase', durationMs: 20000 },
      { mode: 'scatter', durationMs: 7000 },
      { mode: 'chase', durationMs: Infinity },
    ];
    const timer = new GhostModeTimer(phases);
    expect(timer.getCurrentMode()).toBe('scatter');
    // advance 7 seconds -> switch to chase
    timer.update(7000);
    expect(timer.getCurrentMode()).toBe('chase');
    // advance 20 seconds -> back to scatter
    timer.update(20000);
    expect(timer.getCurrentMode()).toBe('scatter');
    // advance 7 seconds -> chase (last phase, infinite)
    timer.update(7000);
    expect(timer.getCurrentMode()).toBe('chase');
    // further updates should stay in chase
    timer.update(50000);
    expect(timer.getCurrentMode()).toBe('chase');
  });
});

describe('Ghost behavior', () => {
  const startPos = { x: 0, y: 0 };
  const scatterTarget = { x: 100, y: 0 };
  const housePos = { x: -50, y: -50 };
  let ghost: Ghost;

  beforeEach(() => {
    ghost = new Ghost('blinky', startPos, scatterTarget, housePos, 2);
    ghost.direction = Direction.Right; // initial direction for reversal test
  });

  it('starts in scatter mode and moves towards scatter target', () => {
    ghost.tick({ x: 0, y: 0 }); // player position irrelevant in scatter
    expect(ghost.position.x).toBeGreaterThan(0);
    expect(ghost.direction).toBe(Direction.Right);
  });

  it('enters frightened mode on power pellet and reverses direction', () => {
    ghost.onPowerPellet();
    expect(ghost.mode).toBe(GhostMode.Frightened);
    // direction should be reversed from Right to Left
    expect(ghost.direction).toBe(Direction.Left);
    // speed should be half of base speed
    expect(ghost.getSpeed()).toBeCloseTo(1); // baseSpeed 2 * 0.5
  });

  it('eating a frightened ghost returns escalating points and switches to eaten mode', () => {
    ghost.onPowerPellet();
    const pts1 = ghost.eat();
    expect(pts1).toBe(200);
    expect(ghost.mode).toBe(GhostMode.Eaten);
    // After being eaten, ghost should be in Eaten mode; further eat attempts are invalid until it returns to house.
  });

  it('returns to house and resets to scatter with streak cleared', () => {
    ghost.onPowerPellet();
    ghost.eat(); // now in Eaten mode
    // Simulate ticks moving towards house
    while (ghost.position.x !== housePos.x || ghost.position.y !== housePos.y) {
      ghost.tick({ x: 0, y: 0 });
    }
    expect(ghost.position).toEqual(housePos);
    expect(ghost.mode).toBe(GhostMode.Scatter);
    // streak should be reset, next eat gives base points again
    ghost.onPowerPellet();
    const pts = ghost.eat();
    expect(pts).toBe(200);
  });
});
