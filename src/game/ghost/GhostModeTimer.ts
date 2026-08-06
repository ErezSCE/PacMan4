/**
 * GhostModeTimer controls the alternating chase/scatter phases for ghosts.
 * It follows the classic Pac‑Man timing pattern: a sequence of durations for
 * scatter and chase modes. After the sequence is exhausted the last mode
 * (chase) repeats indefinitely.
 *
 * The timer is driven by `update(delta)` where `delta` is the elapsed time in
 * milliseconds since the previous update call.
 */
export type ModePhase = {
  mode: 'scatter' | 'chase';
  durationMs: number;
};

import { GhostMode } from "./GhostMode";

export class GhostModeTimer {
  private phases: ModePhase[];
  private currentIndex = 0;
  private elapsedInPhase = 0;

  /**
   * @param phases Ordered list of phases. Example classic timings (in ms):
   *   [{mode: 'scatter', durationMs: 7000}, {mode: 'chase', durationMs: 20000},
   *    {mode: 'scatter', durationMs: 7000}, {mode: 'chase', durationMs: 20000},
   *    {mode: 'scatter', durationMs: 5000}, {mode: 'chase', durationMs: Infinity}]
   */
  constructor(phases: ModePhase[]) {
    if (phases.length === 0) {
      throw new Error('GhostModeTimer requires at least one phase');
    }
    this.phases = phases;
  }

  /** Returns the current mode as GhostMode enum. */
  getCurrentMode(): GhostMode {
    const modeStr = this.phases[this.currentIndex].mode;
    return modeStr === 'scatter' ? GhostMode.Scatter : GhostMode.Chase;
  }

  /** Advance the timer by `deltaMs` milliseconds. */
  update(deltaMs: number): void {
    this.elapsedInPhase += deltaMs;
    // Advance through phases as many times as needed if deltaMs exceeds multiple phase durations
    while (true) {
      const currentPhase = this.phases[this.currentIndex];
      if (this.elapsedInPhase < currentPhase.durationMs) {
        break;
      }
      // Subtract the full duration of the current phase
      this.elapsedInPhase -= currentPhase.durationMs;
      if (this.currentIndex < this.phases.length - 1) {
        this.currentIndex++;
      } else {
        // Last phase (often infinite). Keep index at last and reset elapsed for consistency.
        this.currentIndex = this.phases.length - 1;
        this.elapsedInPhase = 0;
        break;
      }
    }
  }
}
