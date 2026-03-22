import App from './App'
import { createSSRApp } from 'vue'
import { getToken } from './common/auth'

export function createApp() {
  const app = createSSRApp(App)

  uni.addInterceptor('navigateTo', {
    invoke(args) {
      const token = getToken()
      const isLoginPage = (args.url || '').includes('/pages/login/login')

      if (!token && !isLoginPage) {
        uni.reLaunch({
          url: '/pages/login/login'
        })
        return false
      }

      return args
    }
  })

  return {
    app
  }
}