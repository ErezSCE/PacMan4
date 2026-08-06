import React, { useEffect, useState } from 'react';
import { audioManager } from '../audio/AudioManager';

/**
 * MuteToggle renders a button that toggles the global audio mute state.
 * It reflects the current mute state and persists it via PersistenceService.
 */
export const MuteToggle: React.FC = () => {
  const [muted, setMuted] = useState<boolean>(audioManager.isMuted());

  // Keep component state in sync if mute is changed elsewhere
  useEffect(() => {
    const handle = () => setMuted(audioManager.isMuted());
    // No event system currently; placeholder for future subscription
    return () => {};
  }, []);

  const toggle = () => {
    audioManager.toggleMute();
    setMuted(audioManager.isMuted());
  };

  return (
    <button data-testid="mute-toggle" onClick={toggle} aria-label="Mute toggle">
      {muted ? 'Unmute' : 'Mute'}
    </button>
  );
};
