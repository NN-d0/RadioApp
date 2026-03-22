import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/app-system-api': {
        target: 'http://10.18.14.254:9100',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app-system-api/, '')
      },
      '/app-core-api': {
        target: 'http://10.18.14.254:9200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app-core-api/, '')
      }
    }
  }
})