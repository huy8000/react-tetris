import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  base: './',
  plugins: [preact()],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  test: {
    environment: 'happy-dom',
    server: {
      deps: {
        inline: ['zustand'],
      },
    },
  },
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
