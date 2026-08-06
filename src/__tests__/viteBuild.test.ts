import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

test('build generates gzipped assets and total size under 2MB', () => {
  // Run the Vite production build
  execSync('npm run build', { stdio: 'inherit' });

  const distPath = path.resolve(__dirname, '../../dist');
  const files = fs.readdirSync(distPath);
  const gzFiles = files.filter((f) => f.endsWith('.gz'));
  expect(gzFiles.length).toBeGreaterThan(0);

  const totalSize = gzFiles.reduce((sum, file) => {
    const filePath = path.join(distPath, file);
    return sum + fs.statSync(filePath).size;
  }, 0);

  // Ensure total gzipped size is under 2MB
  expect(totalSize).toBeLessThanOrEqual(2 * 1024 * 1024);
});
