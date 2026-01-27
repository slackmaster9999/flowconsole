import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    dts({ tsconfigPath: './tsconfig.json' }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'FlowConsoleWeb',
      fileName: 'flowconsole-web',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@monaco-editor/react',
        '@xyflow/react',
        '@xyflow/system',
        'react-router-dom',
      ],
    },
  },
});
