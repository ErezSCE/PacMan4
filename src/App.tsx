import React, { useEffect, useState, useRef } from 'react';
import { InputManager } from './input/InputManager';
import { DirectionalPad } from './components/DirectionalPad';
import { ScoreBoard } from './components/ScoreBoard';
import { Settings } from './components/Settings';
import { Direction } from './input/types';

export const App: React.FC = () => {
  const [direction, setDirection] = useState<Direction>(Direction.None);
  const inputManagerRef = useRef<InputManager | null>(null);

  useEffect(() => {
    const manager = new InputManager(setDirection);
    manager.start();
    inputManagerRef.current = manager;
    return () => {
      manager.stop();
    };
  }, []);

  const handleButton = (dir: Direction) => {
    inputManagerRef.current?.handleButton(dir);
  };

  return (
    <div className="app">
      <h1>Pac-Man</h1>
      <p>Welcome to Pac-Man game!</p>
      <p data-testid="current-direction">Current Direction: {direction}</p>
      <DirectionalPad onDirection={handleButton} />
      <ScoreBoard />
      <Settings />
    </div>
  );
};
