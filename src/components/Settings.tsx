import React, { useEffect, useState } from 'react';
import { persistenceService } from '../services/PersistenceService';

/**
 * Settings component allows the player to toggle color‑blind mode and mute.
 * It reads the current settings from PersistenceService on mount and updates
 * the stored values whenever a checkbox changes.
 */
export const Settings: React.FC = () => {
  const [colorBlind, setColorBlind] = useState(false);
  const [mute, setMute] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    const load = async () => {
      const { colorBlindMode, mute: storedMute } = await persistenceService.getSettings();
      setColorBlind(colorBlindMode);
      setMute(storedMute);
    };
    load();
  }, []);

  const handleColorBlindChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setColorBlind(checked);
    await persistenceService.setSettings({ colorBlindMode: checked, mute });
  };

  const handleMuteChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setMute(checked);
    await persistenceService.setSettings({ mute: checked, colorBlindMode: colorBlind });
  };

  return (
    <section aria-label="settings" data-testid="settings">
      <h2>Settings</h2>
      <label htmlFor="color-blind-toggle">
        Color‑blind mode
      </label>
      <input
        id="color-blind-toggle"
        type="checkbox"
        checked={colorBlind}
        onChange={handleColorBlindChange}
        data-testid="color-blind-toggle"
      />
      <br />
      <label htmlFor="mute-toggle">
        Mute
      </label>
      <input
        id="mute-toggle"
        type="checkbox"
        checked={mute}
        onChange={handleMuteChange}
        data-testid="mute-toggle"
      />
    </section>
  );
};
