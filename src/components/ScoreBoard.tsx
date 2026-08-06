import React, { useEffect, useState } from 'react';
import { persistenceService, HighScore } from '../services/PersistenceService';

/**
 * ScoreBoard component displays the top‑10 high scores.
 * It loads scores from PersistenceService on mount and updates when the
 * service data changes (e.g., after a new score is added). For simplicity we
 * re‑fetch the scores after each addition – the service does not emit events.
 */
export const ScoreBoard: React.FC = () => {
  const [scores, setScores] = useState<HighScore[]>([]);

  useEffect(() => {
    // Load high scores using the PersistenceService, which handles IndexedDB fallback internally.
    (async () => {
      try {
        const hs = await persistenceService.getHighScores();
        setScores(hs);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load high scores', err);
      }
    })();
    // No subscription mechanism – just load once on mount.
  }, []);

  return (
    <section aria-label="high scores" data-testid="score-board">
      <h2>High Scores</h2>
      {scores.length === 0 ? (
        <p>No high scores yet.</p>
      ) : (
        <ol>
          {scores.map((s, index) => (
            <li key={s.id ?? index}>
              {s.initials}: {s.score}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};
