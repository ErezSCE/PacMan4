import React, { createContext, useContext, ReactNode } from 'react';
import { audioManager } from '../audio/AudioManager';
import { Direction } from '../input/types';

/**
 * Global game context providing shared state and services.
 * Currently includes the current direction and the AudioManager singleton.
 */
interface GameContextProps {
  direction: Direction;
  setDirection: (dir: Direction) => void;
  audioManager: typeof audioManager;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode; direction: Direction; setDirection: (dir: Direction) => void }> = ({ children, direction, setDirection }) => {
  return (
    <GameContext.Provider value={{ direction, setDirection, audioManager }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextProps => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return ctx;
};
