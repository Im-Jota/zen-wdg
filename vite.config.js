import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'ZenWdg',
      fileName: (format) => `zen-wdg.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    minify: 'terser',
    target: 'es2015',
    sourcemap: false
  }
});