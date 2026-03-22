import { CORE_BASE_URL } from '../config'
import { getToken, clearAuth } from '../auth'

function rawRequest({ url, method = 'GET', data = {}, header = {} }) {
  const token = getToken()

  return new Promise((resolve, reject) => {
    uni.request({
      url: CORE_BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...header
      },
      success: resolve,
      fail: reject
    })
  })
}

function normalizeResult(payload = {}) {
  if (payload?.code === 200) {
    return payload
  }

  if (payload?.data !== undefined) {
    return {
      code: 200,
      msg: payload.msg || 'success',
      data: payload.data
    }
  }

  return null
}

function buildReadableMessage(res) {
  const body = res?.data || {}
  return (
    body?.msg ||
    body?.message ||
    body?.error ||
    `HTTP ${res?.statusCode || ''}` ||
    '请求失败'
  )
}

async function doCoreGet(url, params = {}) {
  const res = await rawRequest({
    url,
    method: 'GET',
    data: params || {}
  })

  if (res?.statusCode === 401) {
    clearAuth()
    uni.showToast({
      title: '登录已失效',
      icon: 'none'
    })
    uni.reLaunch({
      url: '/pages/login/login'
    })
    throw { msg: '登录已失效，请重新登录' }
  }

  const normalized = normalizeResult(res.data || {})
  if (normalized && normalized.code === 200) {
    return normalized
  }

  throw {
    msg: buildReadableMessage(res),
    __raw: res.data || null
  }
}

export function getAppStationStatusListApi() {
  return doCoreGet('/api/core/app/station/status/list')
}