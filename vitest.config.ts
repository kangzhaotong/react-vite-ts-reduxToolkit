import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      axios: 'axios/dist/browser/axios.cjs'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/store/index.ts',
        'src/utils/utils.ts',
        'src/components/AppThemeProvider.tsx'
      ],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.*', 'src/test/**']
    }
  }
});
