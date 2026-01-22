import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
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
        '@monaco-editor/react',
        '@mantine/core',
        '@mantine/hooks',
        '@xyflow/react',
        '@xyflow/system',
        'react-router-dom',
      ],
    },
  },
});
