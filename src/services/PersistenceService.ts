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
 * Database schema for idb.
 */
export interface PacmanDB {
  high_scores: HighScore;
  settings: Settings;
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
  private dbPromise: Promise<IDBPDatabase<PacmanDB>> | null = null;

  private get isIDBAvailable(): boolean {
    // Basic check for existence; actual availability is verified when attempting to open the DB.
    return typeof indexedDB !== 'undefined';
  }

  /**
   * Attempts to open the IndexedDB database. If opening fails (e.g., due to private mode),
   * the error is caught and re‑thrown so callers can fallback to localStorage.
   */
  private async getDB(): Promise<IDBPDatabase<PacmanDB>> {
    if (!this.isIDBAvailable) {
      throw new Error('IndexedDB not available');
    }
    if (!this.dbPromise) {
      try {
        this.dbPromise = openDB<PacmanDB>(PersistenceService.DB_NAME, PersistenceService.DB_VERSION, {
          upgrade(db) {
            if (!db.objectStoreNames.contains(PersistenceService.HIGH_SCORES_STORE)) {
              const hsStore = db.createObjectStore(PersistenceService.HIGH_SCORES_STORE, {
                keyPath: 'id',
                autoIncrement: true,
              });
              hsStore.createIndex('score', 'score');
            }
            if (!db.objectStoreNames.contains(PersistenceService.SETTINGS_STORE)) {
              db.createObjectStore(PersistenceService.SETTINGS_STORE, {
                keyPath: 'id',
              });
            }
          },
        });
      } catch (e) {
        // Reset dbPromise so subsequent calls can retry.
        this.dbPromise = null;
        // Propagate error so callers can handle fallback.
        throw new Error(`Failed to open IndexedDB: ${e instanceof Error ? e.message : e}`);
      }
    }
    return this.dbPromise;
  }

  /** Settings ----------------------------------------------------------- */
  async getSettings(): Promise<{ colorBlindMode: boolean; mute: boolean }> {
    // Attempt IndexedDB first; fallback to localStorage on any failure.
    // Attempt to read from IndexedDB first.
    if (this.isIDBAvailable) {
      try {
        const db = await this.getDB();
        const result = await db.get(PersistenceService.SETTINGS_STORE, 1);
        if (result) {
          return {
            colorBlindMode: !!result.color_blind_mode,
            mute: !!result.mute,
          };
        }
        // If result is undefined, fall through to localStorage fallback.
      } catch {
        // Fall back to localStorage below.
      }
    }
    // LocalStorage fallback path.
    const raw = localStorage.getItem('settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Validate shape: ensure required fields exist and are booleans
        if (
          typeof parsed.color_blind_mode === 'boolean' &&
          typeof parsed.mute === 'boolean'
        ) {
          return {
            colorBlindMode: parsed.color_blind_mode,
            mute: parsed.mute,
          };
        }
        // If shape invalid, fall through to defaults
      } catch {
        // fall through to defaults
      }
    }
    return { colorBlindMode: false, mute: false };
  }

  // Retrieve the full Settings record (including timestamps) from storage.
  private async getSettingsRecord(): Promise<Settings | undefined> {
    if (!this.isIDBAvailable) {
      const raw = localStorage.getItem('settings');
      if (raw) {
        try {
          const parsed: Settings = JSON.parse(raw);
          return parsed;
        } catch {
          return undefined;
        }
      }
      return undefined;
    }
    try {
      const db = await this.getDB();
      const result = await db.get(PersistenceService.SETTINGS_STORE, 1);
      return result as Settings | undefined;
    } catch {
      // Fallback to localStorage on DB errors.
      const raw = localStorage.getItem('settings');
      if (raw) {
        try {
          const parsed: Settings = JSON.parse(raw);
          return parsed;
        } catch {
          return undefined;
        }
      }
      return undefined;
    }
  }

  async setSettings(settings: { colorBlindMode?: boolean; mute?: boolean }): Promise<void> {
    // Merge provided partial settings with existing persisted values to avoid
    // unintentionally overwriting unspecified fields.
    const existingPartial = await this.getSettings();
    const existingFull = await this.getSettingsRecord();
    const now = Date.now();
    const payload = {
      id: 1,
      color_blind_mode: settings.colorBlindMode ?? existingPartial.colorBlindMode,
      mute: settings.mute ?? existingPartial.mute,
      created_at: existingFull?.created_at ?? now,
      updated_at: now,
    };
    if (!this.isIDBAvailable) {
      localStorage.setItem('settings', JSON.stringify(payload));
      return;
    }
    try {
      const db = await this.getDB();
      await db.put(PersistenceService.SETTINGS_STORE, payload);
      // Also persist to localStorage for consistency/fallback.
      localStorage.setItem('settings', JSON.stringify(payload));
    } catch {
      // Fallback to localStorage on any IndexedDB error.
      localStorage.setItem('settings', JSON.stringify(payload));
    }
  }

  /** High Scores -------------------------------------------------------- */
  async getHighScores(): Promise<HighScore[]> {
    if (!this.isIDBAvailable) {
      const raw = localStorage.getItem('high_scores');
      if (raw) {
        try {
          const parsed: HighScore[] = JSON.parse(raw);
          return parsed.sort((a, b) => b.score - a.score).slice(0, 10);
        } catch (e) {
          console.warn('Failed to parse high scores from localStorage', e);
          return [];
        }
      }
      return [];
    }
    try {
      const db = await this.getDB();
      const all: HighScore[] = await db.getAll(PersistenceService.HIGH_SCORES_STORE);
      return all.sort((a, b) => b.score - a.score).slice(0, 10);
    } catch {
      // Fallback to localStorage on DB errors (e.g., private mode)
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
  }

  async addHighScore(initials: string, score: number): Promise<void> {
    // Validate initials: normalize to uppercase and ensure three letters.
    initials = initials.toUpperCase();
    if (!/^[A-Z]{3}$/.test(initials)) {
      throw new Error('Initials must be three uppercase letters');
    }
    const now = Date.now();
    const entry: HighScore = {
      initials,
      score,
      created_at: now,
      updated_at: now,
    };
    // If IndexedDB not available, use localStorage directly.
    if (!this.isIDBAvailable) {
      const raw = localStorage.getItem('high_scores');
      let existing: HighScore[] = [];
      if (raw) {
        try {
          existing = JSON.parse(raw);
        } catch {
          // Corrupted data, start fresh
          existing = [];
        }
      }
      existing.push(entry);
      const sorted = existing.sort((a, b) => b.score - a.score).slice(0, 10);
      try {
        localStorage.setItem('high_scores', JSON.stringify(sorted));
      } catch (e) {
        throw new Error(`Failed to persist high scores to localStorage: ${e instanceof Error ? e.message : String(e)}`);
      }
      return;
    }
    // IndexedDB path – attempt to add, fallback on any error.
    try {
      const db = await this.getDB();
      await db.add(PersistenceService.HIGH_SCORES_STORE, entry);
      // Trim to top 10
      const all = await db.getAll(PersistenceService.HIGH_SCORES_STORE);
      const sorted = all.sort((a, b) => b.score - a.score);
      const toDelete = sorted.slice(10);
      const tx = db.transaction(PersistenceService.HIGH_SCORES_STORE, 'readwrite');
      const store = tx.objectStore(PersistenceService.HIGH_SCORES_STORE);
      const deletePromises: Promise<void>[] = [];
      for (const del of toDelete) {
        if (del.id !== undefined) {
          deletePromises.push(store.delete(del.id));
        }
      }
      await Promise.all(deletePromises);
      await tx.done;
    } catch (err) {
      // On any IndexedDB error, fallback to localStorage.
      const raw = localStorage.getItem('high_scores');
      let existing: HighScore[] = [];
      if (raw) {
        try {
          existing = JSON.parse(raw);
        } catch {
          existing = [];
        }
      }
      existing.push(entry);
      const sorted = existing.sort((a, b) => b.score - a.score).slice(0, 10);
      try {
        localStorage.setItem('high_scores', JSON.stringify(sorted));
      } catch (e) {
        throw new Error(`Failed to persist high scores to localStorage after IndexedDB error: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  /** Utility for tests – clears all persisted data */
  /**
   * Closes the IndexedDB connection and deletes the database.
   * Useful for test teardown or hot‑reload scenarios.
   */
  async close(): Promise<void> {
    if (this.dbPromise) {
      try {
        const db = await this.dbPromise;
        db.close();
      } catch {
        // ignore errors during close
      }
      await deleteDB(PersistenceService.DB_NAME);
      this.dbPromise = null;
    }
  }

  async clearAll(): Promise<void> {
    if (!this.isIDBAvailable) {
      // Fallback mode – clear only localStorage entries.
      localStorage.removeItem('high_scores');
      localStorage.removeItem('settings');
      return;
    }
    // Attempt to clear object stores; if that fails, delete the entire DB for a clean reset.
    try {
      const db = await this.getDB();
      const tx = db.transaction([PersistenceService.HIGH_SCORES_STORE, PersistenceService.SETTINGS_STORE], 'readwrite');
      await Promise.all([
        tx.objectStore(PersistenceService.HIGH_SCORES_STORE).clear(),
        tx.objectStore(PersistenceService.SETTINGS_STORE).clear(),
      ]);
      await tx.done;
    } catch {
      // If clearing fails (e.g., DB not opened), delete the DB entirely.
      await deleteDB(PersistenceService.DB_NAME);
    }
    // Ensure any stale fallback data in localStorage is also removed.
    localStorage.removeItem('high_scores');
    localStorage.removeItem('settings');
  }
}

export const persistenceService = new PersistenceService();
