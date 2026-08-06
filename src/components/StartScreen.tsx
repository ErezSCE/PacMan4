import React from 'react';

interface HighScore {
  initials: string;
  score: number;
}

interface StartScreenProps {
  /** List of high scores to display (already sorted descending) */
  highScores: HighScore[];
  /** Callback invoked when the user clicks the Start button */
  onStart: () => void;
}

/**
 * StartScreen component – shows the game title, a list of the top‑10 high scores,
 * and a button to begin the game.
 */
export const StartScreen: React.FC<StartScreenProps> = ({ highScores, onStart }) => {
  return (
    <div data-testid="start-screen" className="start-screen">
      <h1>Pac‑Man</h1>
      <h2>High Scores</h2>
      <ol data-testid="high-score-list">
        {highScores.slice(0, 10).map((hs) => (
          <li key={`${hs.initials}-${hs.score}`}> 
            {hs.initials} — {hs.score}
          </li>
        ))}
      </ol>
      <button data-testid="start-button" onClick={onStart} aria-label="Start game">
        Start
      </button>
    </div>
  );
};
