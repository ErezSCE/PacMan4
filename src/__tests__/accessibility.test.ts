import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DirectionalPad } from '../components/DirectionalPad';
import { MuteToggle } from '../components/MuteToggle';
import { App } from '../App';

expect.extend(toHaveNoViolations);

describe('Accessibility tests with jest-axe', () => {
  test('DirectionalPad should have no accessibility violations', async () => {
    const { container } = render(<DirectionalPad onDirection={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('MuteToggle should have no accessibility violations', async () => {
    const { container } = render(<MuteToggle />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('App should have no accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
