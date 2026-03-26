import { GATEWAY_BASE_URL } from './config'
import { getToken, clearAuth } from './auth'

/**
 * 统一网关请求封装
 * 注意：
 * - 传入的 url 必须带完整业务前缀，例如 /api/system/** 或 /api/core/**
 * - 当前 APP 主流程虽然已在各模块内各自封装请求，但这里也同步修正，
 *   避免后续你新增页面时踩到旧的 BASE_URL 残留问题
 */
function request(options = {}) {
  const token = getToken()

  return new Promise((resolve, reject) => {
    uni.request({
      url: GATEWAY_BASE_URL + (options.url || ''),
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
