#!/usr/bin/env node
/**
 * Script to verify that the total gzipped size of the production build is under 2 MB.
 * It reads all .gz files in the ./dist directory, sums their sizes, and exits with code 1
 * if the limit is exceeded.
 */
const fs = require('fs').promises;
const path = require('path');

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB in bytes
const distDir = path.resolve(__dirname, '..', 'dist');

/** Recursively collect .gz files */
async function getGzFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getGzFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.gz')) {
      files.push(fullPath);
    }
  }
  return files;
}

(async () => {
  try {
    await fs.access(distDir);
  } catch (_) {
    console.error('Dist directory not found. Did you run `npm run build`?');
    process.exit(1);
  }

  const gzFiles = await getGzFiles(distDir);
  if (gzFiles.length === 0) {
    console.error('No gzipped files found in dist directory. Ensure gzip compression is configured.');
    process.exit(1);
  }
  let totalSize = 0;
  for (const file of gzFiles) {
    const stats = await fs.stat(file);
    totalSize += stats.size;
  }

  console.log(`Total gzipped size: ${(totalSize / 1024).toFixed(2)} KB`);
  if (totalSize > MAX_SIZE) {
    console.error('Bundle size exceeds 2 MB limit');
    process.exit(1);
  }
  process.exit(0);
})();