import React from 'react';
import { Fruit } from '../game/Fruit';

interface FruitIndicatorProps {
  /** Currently active fruit, or null if none */
  fruit: Fruit | null;
}

/**
 * UI component that displays the active fruit on screen.
 * Shows the fruit name and point value when a fruit is active.
 * If no fruit is active, renders nothing.
 */
export const FruitIndicator: React.FC<FruitIndicatorProps> = ({ fruit }) => {
  if (!fruit || !fruit.active) {
    return null;
  }

  return (
    <div data-testid="fruit-indicator" style={{ marginTop: '8px' }}>
      <span>{fruit.type.name}</span>{' '}
      <span>({fruit.type.points} pts)</span>
    </div>
  );
};
