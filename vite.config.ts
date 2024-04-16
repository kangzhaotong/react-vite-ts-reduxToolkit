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
    host: '0.0.0.0',
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    },
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  build: {
    target: 'modules',
    outDir: 'build',
    assetsDir: 'assets',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 500,
    emptyOutDir: true,
    manifest: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react'],
          'antd': ['antd'],
        },
      },
    },
    // 传递给 Terser 的更多 minify 选项。
    terserOptions: {
      compress: {
        keep_infinity: true,
      },
    },
  },
  plugins: [
    react(),
    // splitVendorChunkPlugin(),
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
