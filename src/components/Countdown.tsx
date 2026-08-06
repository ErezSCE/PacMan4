import React, { useEffect, useState, useRef } from 'react';

interface CountdownProps {
  /** Callback invoked when the countdown finishes (after displaying "GO") */
  onComplete: () => void;
}

/**
 * Countdown component – displays a 3‑2‑1‑GO sequence.
 * It starts automatically when mounted and calls `onComplete` after the sequence.
 */
export const Countdown: React.FC<CountdownProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(3); // 3,2,1,0 (GO)
  const onCompleteRef = useRef<() => void>(onComplete);

  // Keep ref up‑to‑date when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (step < 0) return;
    const timer = setTimeout(() => {
      if (step === 0) {
        // Finished displaying GO, notify parent via ref to avoid stale closure
        onCompleteRef.current();
      }
      setStep(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [step]);

  const display = step > 0 ? step.toString() : step === 0 ? 'GO' : null;

  return (
    <div data-testid="countdown" className="countdown">
      <span aria-live="assertive">{display}</span>
    </div>
  );
};
