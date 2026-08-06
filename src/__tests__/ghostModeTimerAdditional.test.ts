import { GhostModeTimer, ModePhase } from '../game/ghost/GhostModeTimer';

describe('GhostModeTimer additional validation', () => {
  it('throws when Infinity is used in a non-final phase', () => {
    const phases: ModePhase[] = [
      { mode: GhostMode.Scatter, durationMs: Infinity }, // invalid, not final
      { mode: GhostMode.Chase, durationMs: 20000 },
    ];
    expect(() => new GhostModeTimer(phases)).toThrowError(/Infinity durationMs is only allowed for the final phase/);
  });

  it('throws when update is called with negative deltaMs', () => {
    const phases: ModePhase[] = [
      { mode: 'scatter', durationMs: 7000 },
      { mode: 'chase', durationMs: Infinity },
    ];
    const timer = new GhostModeTimer(phases);
    expect(() => timer.update(-10)).toThrowError(/deltaMs must be non-negative/);
  });
});
