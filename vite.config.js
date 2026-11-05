import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  base: './',
  plugins: [preact()],
  build: {
    outDir: 'dist',
    assetsDir: '',
    rollupOptions: {
      output: {
        entryFileNames: '[name].[hash:10].js',
        chunkFileNames: '[name].[hash:10].js',
        assetFileNames: '[name].[hash:10].[ext]',
      },
    },
  },
});
