import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build --mode single` emits one self-contained HTML file (dist-single/)
// for sharing the prototype without a server. The normal build code-splits per
// concept and lazy-loads every WebGL scene.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  server: { host: true, port: 5173 },
  build: mode === 'single' ? { outDir: 'dist-single', assetsInlineLimit: 100_000_000 } : {},
}))
