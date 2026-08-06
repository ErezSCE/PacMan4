import { openDB, deleteDB, IDBPDatabase } from 'idb';

/**
 * Types for high score entries and settings.
 */
export interface HighScore {
  id?: number; // auto‑generated key
  initials: string; // three‑letter initials
  score: number;
  created_at: number; // timestamp (ms)
  updated_at: number;
}

export interface Settings {
  id: number; // always 1 for singleton record
  color_blind_mode: boolean;
  mute: boolean;
  created_at: number;
  updated_at: number;
}

/**
 * PersistenceService handles storage of high scores and player settings.
 * It uses IndexedDB via the idb library, falling back to localStorage when
 * IndexedDB is unavailable (e.g., in private browsing mode).
 */
class PersistenceService {
  private static readonly DB_NAME = 'pacman-db';
  private static readonly DB_VERSION = 1;
  private static readonly HIGH_SCORES_STORE = 'high_scores';
  private static readonly SETTINGS_STORE = 'settings';
  private dbPromise: Promise<IDBPDatabase<any>> | null = null;

  private get isIDBAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  private async getDB(): Promise<IDBPDatabase<any>> {
    if (!this.isIDBAvailable) {
      // This path should never be called when IDB is unavailable because we
      // short‑circuit to localStorage in the public methods.
      throw new Error('IndexedDB not available');
    }
    if (!this.dbPromise) {
      this.dbPromise = openDB(PersistenceService.DB_NAME, PersistenceService.DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(PersistenceService.HIGH_SCORES_STORE)) {
            const hsStore = db.createObjectStore(PersistenceService.HIGH_SCORES_STORE, {
              keyPath: 'id',
              autoIncrement: true,
            });
            hsStore.createIndex('score', 'score');
          }
          if (!db.objectStoreNames.contains(PersistenceService.SETTINGS_STORE)) {
            const setStore = db.createObjectStore(PersistenceService.SETTINGS_STORE, {
              keyPath: 'id',
            });
          }
        },
      });
    }
    return this.dbPromise;
  }

  /** Settings ----------------------------------------------------------- */
  async getSettings(): Promise<{ colorBlindMode: boolean; mute: boolean }> {
    if (!this.isIDBAvailable) {
      const raw = localStorage.getItem('settings');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          return {
            colorBlindMode: !!parsed.color_blind_mode,
            mute: !!parsed.mute,
          };
        } catch {
          // fall through to defaults
        }
      }
      return { colorBlindMode: false, mute: false };
    }
    const db = await this.getDB();
    const result = await db.get(PersistenceService.SETTINGS_STORE, 1);
    if (result) {
      return {
        colorBlindMode: !!result.color_blind_mode,
        mute: !!result.mute,
      };
    }
    // defaults
    return { colorBlindMode: false, mute: false };
  }

  async setSettings(settings: { colorBlindMode?: boolean; mute?: boolean }): Promise<void> {
    // Merge provided partial settings with existing persisted values to avoid
    // unintentionally overwriting unspecified fields.
    const existing = await this.getSettings();
    const now = Date.now();
    const payload = {
      id: 1,
      color_blind_mode: settings.colorBlindMode ?? existing.colorBlindMode,
      mute: settings.mute ?? existing.mute,
      created_at: now,
      updated_at: now,
    };
    if (!this.isIDBAvailable) {
      localStorage.setItem('settings', JSON.stringify(payload));
      return;
    }
    const db = await this.getDB();
    await db.put(PersistenceService.SETTINGS_STORE, payload);
  }

  /** High Scores -------------------------------------------------------- */
  async getHighScores(): Promise<HighScore[]> {
    if (!this.isIDBAvailable) {
      const raw = localStorage.getItem('high_scores');
      if (raw) {
        try {
          const parsed: HighScore[] = JSON.parse(raw);
          return parsed.sort((a, b) => b.score - a.score).slice(0, 10);
        } catch {
          return [];
        }
      }
      return [];
    }
    const db = await this.getDB();
    const all: HighScore[] = await db.getAll(PersistenceService.HIGH_SCORES_STORE);
    return all.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  async addHighScore(initials: string, score: number): Promise<void> {
    const now = Date.now();
    const entry: HighScore = {
      initials,
      score,
      created_at: now,
      updated_at: now,
    };
    if (!this.isIDBAvailable) {
      const raw = localStorage.getItem('high_scores');
      const existing: HighScore[] = raw ? JSON.parse(raw) : [];
      existing.push(entry);
      const sorted = existing.sort((a, b) => b.score - a.score).slice(0, 10);
      localStorage.setItem('high_scores', JSON.stringify(sorted));
      return;
    }
    const db = await this.getDB();
    await db.add(PersistenceService.HIGH_SCORES_STORE, entry);
    // Trim to top 10
    const all = await db.getAll(PersistenceService.HIGH_SCORES_STORE);
    const sorted = all.sort((a, b) => b.score - a.score);
    const toKeep = sorted.slice(0, 10);
    const toDelete = sorted.slice(10);
    const tx = db.transaction(PersistenceService.HIGH_SCORES_STORE, 'readwrite');
    const store = tx.objectStore(PersistenceService.HIGH_SCORES_STORE);
    for (const del of toDelete) {
      if (del.id !== undefined) {
        store.delete(del.id);
      }
    }
    await tx.done;
  }

  /** Utility for tests – clears all persisted data */
  async clearAll(): Promise<void> {
    if (!this.isIDBAvailable) {
      localStorage.removeItem('high_scores');
      localStorage.removeItem('settings');
      return;
    }
    const db = await this.getDB();
    const tx = db.transaction([PersistenceService.HIGH_SCORES_STORE, PersistenceService.SETTINGS_STORE], 'readwrite');
    await Promise.all([
      tx.objectStore(PersistenceService.HIGH_SCORES_STORE).clear(),
      tx.objectStore(PersistenceService.SETTINGS_STORE).clear(),
    ]);
    await tx.done;
  }
}

export const persistenceService = new PersistenceService();
