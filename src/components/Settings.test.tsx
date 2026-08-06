import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from './Settings';
import { persistenceService } from '../services/PersistenceService';

describe('Settings component', () => {
  beforeEach(async () => {
    await persistenceService.clearAll();
    localStorage.clear();
  });

  test('loads persisted settings on mount', async () => {
    // Pre‑store settings
    await persistenceService.setSettings({ colorBlindMode: true, mute: true });
    render(<Settings />);
    // Wait for async load
    await waitFor(() => {
      const colorBlind = screen.getByTestId('color-blind-toggle') as HTMLInputElement;
      const mute = screen.getByTestId('mute-toggle') as HTMLInputElement;
      expect(colorBlind.checked).toBe(true);
      expect(mute.checked).toBe(true);
    });
  });

  test('toggles settings and persists them', async () => {
    render(<Settings />);
    const colorBlind = screen.getByTestId('color-blind-toggle') as HTMLInputElement;
    const mute = screen.getByTestId('mute-toggle') as HTMLInputElement;
    // Initially false
    expect(colorBlind.checked).toBe(false);
    expect(mute.checked).toBe(false);
    // Toggle both
    fireEvent.click(colorBlind);
    fireEvent.click(mute);
    // Wait for persistence calls to complete
    await waitFor(async () => {
      const stored = await persistenceService.getSettings();
      expect(stored.colorBlindMode).toBe(true);
      expect(stored.mute).toBe(true);
    });
    // Verify UI reflects changes
    expect(colorBlind.checked).toBe(true);
    expect(mute.checked).toBe(true);
  });
});
