import { defineConfig } from 'vite';
import inject from '@rollup/plugin-inject';
// import mix from 'vite-plugin-mix'

// https://vitejs.dev/config/
export default defineConfig(({}) => ({
  build: {
    rollupOptions: {
      plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
    },
  },
}));
