import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  // The Sanity Studio in studio/ is a separate app; its files should not reload the website.
  server: { watch: { ignored: ['**/studio/**'] } },
});
