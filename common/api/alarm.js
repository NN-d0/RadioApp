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

function ensureLogin(res) {
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
}

function normalizePageResult(payload = {}) {
  if (
    payload?.code === 200 &&
    payload?.data &&
    Array.isArray(payload.data.records)
  ) {
    return payload
  }
  return null
}

function normalizeActionResult(payload = {}) {
  if (payload?.code === 200) {
    return payload
  }
  return null
}

/**
 * APP 告警分页
 * 统一新路径：/api/core/alarms/page
 */
export async function getAlarmPageApi(params) {
  const requestUrl = '/api/core/alarms/page'

  const res = await rawRequest({
    url: requestUrl,
    method: 'GET',
    data: params || {}
  })

  ensureLogin(res)

  const normalized = normalizePageResult(res.data || {})
  if (normalized) {
    return {
      ...normalized,
      __matchedUrl: requestUrl
    }
  }

  throw {
    msg: buildReadableMessage(res),
    __matchedUrl: requestUrl,
    __raw: res.data || null
  }
}

/**
 * APP 告警确认
 * 统一新路径：/api/core/alarms/confirm
 */
export async function confirmAlarmApi(data) {
  const requestUrl = '/api/core/alarms/confirm'

  const res = await rawRequest({
    url: requestUrl,
    method: 'POST',
    data: data || {}
  })

  ensureLogin(res)

  const normalized = normalizeActionResult(res.data || {})
  if (normalized) {
    return {
      ...normalized,
      __matchedUrl: requestUrl
    }
  }

  throw {
    msg: buildReadableMessage(res),
    __matchedUrl: requestUrl,
    __raw: res.data || null
  }
}

/**
 * APP 告警处理
 * 统一新路径：/api/core/alarms/handle
 */
export async function handleAlarmApi(data) {
  const requestUrl = '/api/core/alarms/handle'

  const res = await rawRequest({
    url: requestUrl,
    method: 'POST',
    data: data || {}
  })

  ensureLogin(res)

  const normalized = normalizeActionResult(res.data || {})
  if (normalized) {
    return {
      ...normalized,
      __matchedUrl: requestUrl
    }
  }

  throw {
    msg: buildReadableMessage(res),
    __matchedUrl: requestUrl,
    __raw: res.data || null
  }
}