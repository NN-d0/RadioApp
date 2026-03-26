import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    host: '0.0.0.0',
    // 避免与 PC Web 端默认 5173 冲突
    port: 5174,
    proxy: {
      '/app-gateway': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app-gateway/, '')
      }
    }
  }
})
