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
        entryFileNames: 'app.[hash:10].js',
        chunkFileNames: 'app.[hash:10].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css.[hash:10].css';
          }
          return '[name].[hash:10].[ext]';
        },
      },
    },
  },
});
