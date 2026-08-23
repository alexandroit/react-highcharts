import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      react: resolve(import.meta.dirname, 'node_modules/react'),
      'react/jsx-runtime': resolve(import.meta.dirname, 'node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': resolve(import.meta.dirname, 'node_modules/react/jsx-dev-runtime.js'),
      'react-dom': resolve(import.meta.dirname, 'node_modules/react-dom')
    },
    dedupe: ['react', 'react-dom']
  },
  build: {
    outDir: '../../docs/react-18',
    emptyOutDir: true
  }
});
