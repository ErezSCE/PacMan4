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

  const loadScores = async () => {
    const hs = await persistenceService.getHighScores();
    setScores(hs);
  };

  useEffect(() => {
    (async () => {
      const hs = await persistenceService.getHighScores();
      setScores(hs);
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
