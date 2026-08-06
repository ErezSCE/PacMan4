// src/services/PersistenceService.ts
/**
 * Simple PersistenceService for storing user settings like mute.
 * Uses localStorage as a fallback for this assignment.
 * In a full implementation this would use IndexedDB via idb.
 */
export class PersistenceService {
  private static MUTE_KEY = 'pacman4_mute';

  /** Get mute setting; defaults to false (not muted) */
  public static getMute(): boolean {
    const val = localStorage.getItem(PersistenceService.MUTE_KEY);
    return val === 'true';
  }

  /** Persist mute setting */
  public static setMute(mute: boolean): void {
    localStorage.setItem(PersistenceService.MUTE_KEY, String(mute));
  }
}
