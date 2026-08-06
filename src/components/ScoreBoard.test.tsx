import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
// Suppress React act warnings in test environment
jest.spyOn(console, 'error').mockImplementation(() => {});
import { ScoreBoard } from './ScoreBoard';
import { persistenceService } from '../services/PersistenceService';

/**
 * ScoreBoard component tests ensure that high scores are loaded from the
 * PersistenceService (which uses the localStorage fallback in the test
 * environment) and displayed correctly.
 */

describe('ScoreBoard', () => {
  beforeEach(async () => {
    await persistenceService.clearAll();
    localStorage.clear();
  });

  test('displays a message when no scores are present', async () => {
    render(<ScoreBoard />);
    // Wait for async load to finish
    await waitFor(() => {
      expect(screen.getByText(/no high scores yet/i)).toBeInTheDocument();
    });
  });

  test('renders top‑10 scores sorted descending', async () => {
    // Insert 12 scores; only top 10 should appear
    for (let i = 0; i < 12; i++) {
      const initials = String.fromCharCode(65 + i).repeat(3);
      await persistenceService.addHighScore(initials, i * 10);
    }
    render(<ScoreBoard />);
    // Wait for async load
    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(10);
      // First item should be highest score (110)
      const highestInitials = String.fromCharCode(65 + 11).repeat(3); // 'LLL'
      expect(items[0]).toHaveTextContent(`${highestInitials}: 110`);
    });
  });
});
