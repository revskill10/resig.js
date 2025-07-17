import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 3001,
    host: true
  },
  resolve: {
    alias: {
      'resig.js/svelte': '../../src/svelte/hooks.ts'
    }
  }
});
