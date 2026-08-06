import React, { useEffect, useRef } from 'react';
import { Maze } from '../game/Maze';
import { PacMan } from '../game/PacMan';
import { Position } from '../GameEngine';

/**
 * Canvas component that mounts an HTML5 canvas and runs a 60fps rendering loop.
 * It creates a Maze and PacMan instance and draws them each frame.
 */
export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Initialize game objects once after component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to fill parent; fallback to 400 if size is zero
    const setCanvasSize = () => {
      canvas.width = canvas.clientWidth > 0 ? canvas.clientWidth : 400;
      canvas.height = canvas.clientHeight > 0 ? canvas.clientHeight : 400;
    };
    setCanvasSize();
    // Update size on window resize
    const handleResize = () => setCanvasSize();
    window.addEventListener('resize', handleResize);

    const maze = new Maze();
    const pacManStart: Position = { x: 1, y: 1 };
    const pacMan = new PacMan(maze, pacManStart);

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw maze and Pac-Man
      maze.draw(ctx);
      pacMan.update(); // handle movement logic
      pacMan.draw(ctx);
      // Schedule next frame
      animationRef.current = window.requestAnimationFrame(render);
    };

    // Start the loop
    animationRef.current = window.requestAnimationFrame(render);

    // Cleanup on unmount
    return () => {
      window.cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
    // Empty dependency array – run once
  }, []);

  return <canvas ref={canvasRef} data-testid="game-canvas" style={{ width: '100%', height: '100%' }} />;
};
