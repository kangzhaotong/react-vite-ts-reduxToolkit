import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: '127.0.0.1:3008',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    open: 'index.html'
  },
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    "minify": false,
    "rollupOptions": {
      "output": {
        "manualChunks": (id: string) => {
          if (id.includes('node_modules')) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        }
      }
    }
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    AutoImport({
      imports: ['react'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/hooks', 'src/store/reducer'],
      eslintrc: {
        enabled: true, // Default `false`
        filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      }
    })
  ]
});
