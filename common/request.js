import { BASE_URL } from './config'
import { getToken, clearAuth } from './auth'

function request(options = {}) {
  const token = getToken()

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + (options.url || ''),
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...(options.header || {})
      },
      success: (res) => {
        const result = res.data || {}

        if (res.statusCode === 401) {
          clearAuth()
          uni.showToast({
            title: '登录已失效',
            icon: 'none'
          })
          uni.reLaunch({
            url: '/pages/login/login'
          })
          reject(result)
          return
        }

        if (result.code !== 200) {
          uni.showToast({
            title: result.msg || '请求失败',
            icon: 'none'
          })
          reject(result)
          return
        }

        resolve(result)
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default request