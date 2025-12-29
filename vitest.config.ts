import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Ensure paths resolve from the repo root even when tests are run from workspace packages.
const rootDir = dirname(fileURLToPath(new URL(import.meta.url)));

export default defineConfig({
  root: rootDir,
  resolve: {
    // Avoid multiple React copies when Vitest runs inside workspace packages.
    dedupe: ['react', 'react-dom'],
    alias: {
      react: resolve(rootDir, 'node_modules/react'),
      'react-dom': resolve(rootDir, 'node_modules/react-dom'),
    },
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
