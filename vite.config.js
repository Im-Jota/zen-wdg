import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command, mode }) => {
  // Configuración para modo desarrollo (npm run dev)
  if (command === 'serve') {
    return {
      plugins: [vue()],
      root: '.',
      server: {
        port: 3000,
        open: true
      }
    }
  }
  
  // Configuración para build de librería (npm run build)
  return {
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
  }
});