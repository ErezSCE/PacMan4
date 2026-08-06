// src/components/DirectionalPad.tsx
import React from 'react';
import { Direction } from '../input/types';

interface DirectionalPadProps {
  /** Callback invoked when a direction button is pressed */
  onDirection: (direction: Direction) => void;
}

/**
 * Simple on‑screen directional pad for touch devices.
 * Renders four arrow buttons (↑ ↓ ← →) that call `onDirection` when tapped.
 * Buttons are given accessible ARIA labels and `data-testid` attributes for testing.
 */
export const DirectionalPad: React.FC<DirectionalPadProps> = ({ onDirection }) => {
  const handleClick = (dir: Direction) => () => {
    onDirection(dir);
  };

  return (
    <div className="directional-pad" role="group" aria-label="Directional controls" style={{ display: 'grid', gridTemplateAreas: "'up' 'left right' 'down'", gap: '8px', justifyItems: 'center' }}>
      <button
        type="button"
        aria-label="Move Up"
        data-testid="btn-up"
        onClick={handleClick(Direction.Up)}
        style={{ gridArea: 'up' }}
      >
        ↑
      </button>
      <button
        type="button"
        aria-label="Move Left"
        data-testid="btn-left"
        onClick={handleClick(Direction.Left)}
        style={{ gridArea: 'left' }}
      >
        ←
      </button>
      <button
        type="button"
        aria-label="Move Right"
        data-testid="btn-right"
        onClick={handleClick(Direction.Right)}
        style={{ gridArea: 'right' }}
      >
        →
      </button>
      <button
        type="button"
        aria-label="Move Down"
        data-testid="btn-down"
        onClick={handleClick(Direction.Down)}
        style={{ gridArea: 'down' }}
      >
        ↓
      </button>
    </div>
  );
};
