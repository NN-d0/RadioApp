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
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

function normalizePageResult(payload = {}) {
  if (payload?.code === 200 && payload?.data && Array.isArray(payload.data.records)) {
    return payload
  }

  if (Array.isArray(payload?.records)) {
    return {
      code: 200,
      msg: 'success',
      data: {
        total: payload.total || 0,
        records: payload.records || []
      }
    }
  }

  if (payload?.data && Array.isArray(payload.data.list)) {
    return {
      code: 200,
      msg: payload.msg || 'success',
      data: {
        total: payload.data.total || 0,
        records: payload.data.list || []
      }
    }
  }

  return null
}

function normalizeActionResult(payload = {}) {
  if (payload?.code === 200) {
    return payload
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

export async function getAlarmPageApi(params) {
  const res = await rawRequest({
    url: '/api/core/alarm/page',
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

  const normalized = normalizePageResult(res.data || {})
  if (normalized && normalized.code === 200) {
    return {
      ...normalized,
      __matchedUrl: '/api/core/alarm/page'
    }
  }

  throw {
    msg: buildReadableMessage(res),
    __matchedUrl: '/api/core/alarm/page',
    __raw: res.data || null
  }
}

export async function confirmAlarmApi(data) {
  const res = await rawRequest({
    url: '/api/core/alarm/confirm',
    method: 'POST',
    data: data || {}
  })

  const normalized = normalizeActionResult(res.data || {})
  if (normalized && normalized.code === 200) {
    return {
      ...normalized,
      __matchedUrl: '/api/core/alarm/confirm'
    }
  }

  throw {
    msg: buildReadableMessage(res),
    __matchedUrl: '/api/core/alarm/confirm',
    __raw: res.data || null
  }
}

export async function handleAlarmApi(data) {
  const res = await rawRequest({
    url: '/api/core/alarm/handle',
    method: 'POST',
    data: data || {}
  })

  const normalized = normalizeActionResult(res.data || {})
  if (normalized && normalized.code === 200) {
    return {
      ...normalized,
      __matchedUrl: '/api/core/alarm/handle'
    }
  }

  throw {
    msg: buildReadableMessage(res),
    __matchedUrl: '/api/core/alarm/handle',
    __raw: res.data || null
  }
}