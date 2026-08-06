/** @jest-environment node */
import { spawn, execSync } from 'child_process';
import puppeteer from 'puppeteer';

/**
 * Performance benchmark test to ensure the game runs at ~60fps.
 * It starts the Vite preview server, loads the app in a headless browser,
 * measures the time between consecutive requestAnimationFrame callbacks
 * for a number of frames, and asserts the average frame duration is <= 16ms.
 */

describe('Performance benchmark (60fps)', () => {
  let serverProcess: ReturnType<typeof spawn>;
  const previewUrl = 'http://localhost:4173';

  // Start Vite preview server before tests
  beforeAll(() => {
    // Build first to ensure preview has assets
    execSync('npm run build', { stdio: 'inherit' });
    serverProcess = spawn('npm', ['run', 'preview'], {
      stdio: 'ignore',
      detached: true,
    });
    // Give the server a moment to start
    return new Promise((resolve) => setTimeout(resolve, 3000));
  }, 300000); // increase timeout for build

  // Shut down the preview server after tests
  afterAll(() => {
    if (serverProcess && !serverProcess.killed) {
      process.kill(-serverProcess.pid);
    }
  });

  it('should maintain average frame time under 16ms (≈60fps)', async () => {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(previewUrl, { waitUntil: 'networkidle2' });

    // Evaluate in the page context: measure timestamps of requestAnimationFrame for 120 frames
    const avgFrameTime = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const frameTimes: number[] = [];
        let lastTimestamp = performance.now();
        const framesToMeasure = 120;
        function step() {
          const now = performance.now();
          frameTimes.push(now - lastTimestamp);
          lastTimestamp = now;
          if (frameTimes.length >= framesToMeasure) {
            const sum = frameTimes.reduce((a, b) => a + b, 0);
            const avg = sum / frameTimes.length;
            resolve(avg);
          } else {
            requestAnimationFrame(step);
          }
        }
        requestAnimationFrame(step);
      });
    });

    await browser.close();
    // Expect average frame time <= 16ms (allow small tolerance)
    expect(avgFrameTime).toBeLessThanOrEqual(16);
  }, 600000); // timeout for the test
});
