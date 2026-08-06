import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Engine } from '../game/Engine';
import { FruitIndicator } from './FruitIndicator';
import { Fruit } from '../game/Fruit';

/**
 * GameCanvas component renders the HTML5 canvas used by the Pac-Man game.
 * It handles responsive scaling to fit the viewport while preserving the
 * original aspect ratio (4:3). The internal canvas resolution is fixed to
 * 800x600 for crisp rendering; CSS scaling adapts it to the container size.
 */
export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine>(new Engine());
  // Expose engine for testing purposes (Cypress)
  (window as any).engine = engineRef.current;
  const [fruit, setFruit] = useState<Fruit | null>(null);

  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 600;
  const ASPECT = BASE_WIDTH / BASE_HEIGHT;

  // Resize canvas to fit container while preserving aspect ratio
  const resizeCanvas = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let width = rect.width;
    let height = width / ASPECT;
    if (height > rect.height) {
      height = rect.height;
      width = height * ASPECT;
    }
    // Set internal resolution (pixel size) – keep constant for rendering
    canvasRef.current.width = BASE_WIDTH;
    canvasRef.current.height = BASE_HEIGHT;
    // Apply CSS scaling
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;
  }, []);

  // Main animation loop – only redraw when engine reports a change
  const animationLoop = () => {
    const needsRedraw = engineRef.current.tick();
    const state = engineRef.current.getState();
    // Update fruit state for UI indicator
    setFruit(state.fruit);
    if (needsRedraw && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Simple placeholder drawing – clear and draw a rectangle representing Pac‑Man
        ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
        ctx.fillStyle = '#ff0';
        ctx.fillRect(100, 100, 50, 50);
      }
    }
    // Schedule next frame and store its id
    frameIdRef.current = requestAnimationFrame(animationLoop);
  };

  // Ref to store the latest animation frame ID for cleanup
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    // Load assets lazily before first frame
    engineRef.current.loadAssets().catch(console.error);
    // Initial sizing
    resizeCanvas();
    // Listen for window resize events
    window.addEventListener('resize', resizeCanvas);
    // Start animation loop and store its ID
    frameIdRef.current = requestAnimationFrame(animationLoop);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(frameIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizeCanvas]);

  return (
    <div ref={containerRef} data-testid="game-canvas-container" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} data-testid="game-canvas" />
    </div>
      <FruitIndicator fruit={fruit} />
    </div>
  );
};
