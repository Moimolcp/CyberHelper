import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    target: "esnext",
    outDir: './docs',
    emptyOutDir: true
  },
  base: "https://moimolcp.github.io/FrostDecoder/",
  server: {
    headers: {
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Accept-Ranges'
    }
  },
  publicDir: 'static'
})
