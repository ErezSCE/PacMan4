import React, { useEffect, useState, useRef } from 'react';
import { PersistenceService } from './services/PersistenceService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GameProvider } from './context/GameContext';
// audioManager is used in GameCanvas for event handling
import { MuteToggle } from './components/MuteToggle';
import { InputManager } from './input/InputManager';
import { DirectionalPad } from './components/DirectionalPad';
import { GameCanvas } from './components/GameCanvas';
import { Direction } from './input/types';

export const App: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [direction, setDirection] = useState<Direction>(Direction.None);
  const inputManagerRef = useRef<InputManager | null>(null);


  const [direction, setDirection] = useState<Direction>(Direction.None);
  const inputManagerRef = useRef<InputManager | null>(null);

  useEffect(() => {
    // Initialize persistence before UI
    const init = async () => {
      await PersistenceService.load();
      setInitialized(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const manager = new InputManager(setDirection);
    manager.start();
    inputManagerRef.current = manager;
    return () => {
      manager.stop();
    };
  }, [initialized]);

  const handleButton = (dir: Direction) => {
    inputManagerRef.current?.handleButton(dir);
  };

  if (!initialized) {
    return <div data-testid="loading">Loading...</div>;
  }
  return (
    <ErrorBoundary>
      <GameProvider direction={direction} setDirection={setDirection}>
        <div className="app">
          <h1>Pac-Man</h1>
          <p>Welcome to Pac-Man game!</p>
          <p data-testid="current-direction">Current Direction: {direction}</p>
          <DirectionalPad onDirection={handleButton} />
          <MuteToggle />
          <GameCanvas />
        </div>
      </GameProvider>
    </ErrorBoundary>
  );
};
