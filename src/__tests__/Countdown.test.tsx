import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Countdown } from '../components/Countdown';

describe('Countdown component', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('displays 3‑2‑1‑GO sequence with 1‑second intervals and calls onComplete once', () => {
    const onComplete = jest.fn();
    render(<Countdown onComplete={onComplete} />);

    // Initial render should show "3"
    expect(screen.getByTestId('countdown')).toHaveTextContent('3');

    // Advance 1 second -> should show "2"
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('countdown')).toHaveTextContent('2');

    // Advance another second -> "1"
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('countdown')).toHaveTextContent('1');

    // Advance another second -> "GO"
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('countdown')).toHaveTextContent('GO');
    // onComplete should have been called exactly once after GO appears
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Advance another second – component will render null, but we still ensure onComplete not called again
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
