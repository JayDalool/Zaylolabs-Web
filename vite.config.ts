import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build --mode single` emits one self-contained HTML file (dist-single/)
// for sharing a preview without a server. The normal build splits the code per page.
export default defineConfig(({ mode }) => ({
  // The single-file preview is opened from anywhere; the site itself is served from the root.
  base: mode === 'single' ? './' : '/',
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  server: { host: true, port: 5173 },
  build: mode === 'single' ? { outDir: 'dist-single', assetsInlineLimit: 100_000_000 } : {},
}))
