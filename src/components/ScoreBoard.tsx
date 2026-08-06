import React, { useEffect, useState } from 'react';
import { persistenceService, HighScore } from '../services/PersistenceService';

/**
 * ScoreBoard component displays the top‑10 high scores.
 * It loads scores from PersistenceService on mount and updates when the
 * service data changes (e.g., after a new score is added). For simplicity we
 * re‑fetch the scores after each addition – the service does not emit events.
 */
export const ScoreBoard: React.FC = () => {
  // Synchronous fallback for environments without IndexedDB (e.g., tests)
  const initialScores: HighScore[] = (() => {
    if (typeof indexedDB === 'undefined') {
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
    return [];
  })();

  const [scores, setScores] = useState<HighScore[]>(initialScores);

  useEffect(() => {
    // Only fetch asynchronously when IndexedDB is available.
    if (typeof indexedDB !== 'undefined') {
      (async () => {
        const hs = await persistenceService.getHighScores();
        setScores(hs);
      })();
    }
    // No subscription mechanism – just load once on mount.
  }, []);

  return (
    <section aria-label="high scores" data-testid="score-board">
      <h2>High Scores</h2>
      {scores.length === 0 ? (
        <p>No high scores yet.</p>
      ) : (
        <ol>
          {scores.map((s) => (
            <li key={s.id ?? `${s.initials}-${s.score}`}>
              {s.initials}: {s.score}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};
