// src/services/PersistenceService.ts
/**
 * Simple PersistenceService for storing user settings like mute.
 * Uses localStorage as a fallback for this assignment.
 * In a full implementation this would use IndexedDB via idb.
 */
export class PersistenceService {
  // Simple in‑memory fallback when localStorage is unavailable (e.g., Node test environment)
  private static memoryStore: Record<string, string> = {};

  private static MUTE_KEY = 'pacman4_mute';

  /** Get mute setting; defaults to false (not muted) */
  public static getMute(): boolean {
    // Use localStorage if available, otherwise fallback to in‑memory store
    let val: string | null = null;
    try {
      if (typeof localStorage !== 'undefined') {
        val = localStorage.getItem(PersistenceService.MUTE_KEY);
      }
    } catch (_) {
      // ignore errors, fallback to memoryStore
    }
    if (val === null) {
      val = PersistenceService.memoryStore[PersistenceService.MUTE_KEY] ?? null;
    }
    return val === 'true';
  }

  /** Persist mute setting */
  public static setMute(mute: boolean): void {
    const str = String(mute);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PersistenceService.MUTE_KEY, str);
        return;
      }
    } catch (_) {
      // ignore errors, fallback to memoryStore
    }
    PersistenceService.memoryStore[PersistenceService.MUTE_KEY] = str;
  }
}
