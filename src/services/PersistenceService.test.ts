import { persistenceService, HighScore } from './PersistenceService';

/**
 * PersistenceService tests use the localStorage fallback because jsdom does not
 * provide IndexedDB. The service automatically detects the lack of IndexedDB
 * and stores data in localStorage.
 */

describe('PersistenceService (localStorage fallback)', () => {
  beforeEach(async () => {
    // Ensure a clean slate before each test
    await persistenceService.clearAll();
    localStorage.clear();
  });

  test('getSettings returns defaults when nothing is stored', async () => {
    const settings = await persistenceService.getSettings();
    expect(settings).toEqual({ colorBlindMode: false, mute: false });
  });

  test('setSettings stores and retrieves values', async () => {
    await persistenceService.setSettings({ colorBlindMode: true, mute: true });
    const settings = await persistenceService.getSettings();
    expect(settings).toEqual({ colorBlindMode: true, mute: true });
  });

  test('getHighScores returns empty array when no scores', async () => {
    const scores = await persistenceService.getHighScores();
    expect(scores).toEqual([]);
  });

  test('addHighScore stores a score and retrieves it sorted', async () => {
    await persistenceService.addHighScore('AAA', 100);
    await persistenceService.addHighScore('BBB', 200);
    const scores = await persistenceService.getHighScores();
    expect(scores).toHaveLength(2);
    // Should be sorted descending by score
    expect(scores[0].initials).toBe('BBB');
    expect(scores[0].score).toBe(200);
    expect(scores[1].initials).toBe('AAA');
    expect(scores[1].score).toBe(100);
  });

  test('addHighScore keeps only top 10 scores', async () => {
    // Insert 12 scores with increasing values
    for (let i = 0; i < 12; i++) {
      const initials = String.fromCharCode(65 + i).repeat(3); // e.g., AAA, BBB...
      await persistenceService.addHighScore(initials, i * 10);
    }
    const scores = await persistenceService.getHighScores();
    expect(scores).toHaveLength(10);
    // Highest score should be the last inserted (i=11, score 110)
    expect(scores[0].score).toBe(110);
    // Lowest score should be 30 (i=3) because scores 0-20 are trimmed
    expect(scores[9].score).toBe(20);
  });
});
