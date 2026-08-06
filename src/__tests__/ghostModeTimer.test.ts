import { GhostModeTimer, ModePhase } from '../game/ghost/GhostModeTimer';

describe('GhostModeTimer constructor validation', () => {
  it('throws when a phase has non‑positive duration (except Infinity)', () => {
    const phases: ModePhase[] = [
      { mode: 'scatter', durationMs: 7000 },
      { mode: 'chase', durationMs: 0 }, // invalid
    ];
    expect(() => new GhostModeTimer(phases)).toThrowError(/durationMs must be positive/);
  });

  it('allows Infinity for the final phase', () => {
    const phases: ModePhase[] = [
      { mode: GhostMode.Scatter, durationMs: 7000 },
      { mode: GhostMode.Chase, durationMs: Infinity },
    ];
    expect(() => new GhostModeTimer(phases)).not.toThrow();
  });
});
