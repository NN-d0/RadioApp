import { SYSTEM_BASE_URL } from '../config'

function rawRequest({ url, method = 'GET', data = {}, header = {} }) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: SYSTEM_BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: resolve,
      fail: reject
    })
  })
}

function extractToken(payload) {
  const data = payload?.data ?? payload ?? {}

  return (
    data?.token ||
    data?.accessToken ||
    data?.jwt ||
    data?.access_token ||
    data?.data?.token ||
    data?.data?.accessToken ||
    data?.data?.jwt ||
    data?.data?.access_token ||
    ''
  )
}

function buildReadableMessage(res) {
  const body = res?.data || {}
  return (
    body?.msg ||
    body?.message ||
    body?.error ||
    `HTTP ${res?.statusCode || ''}` ||
    '登录失败'
  )
}

/**
 * APP 登录接口
 * 统一固定为：/api/system/auth/login
 *
 * 为了兼容当前 pages/login/login.vue 的现有写法，
 * 这里仍然返回 __token 字段，避免你还要同步改登录页。
 */
export async function loginApi(loginForm) {
  const requestUrl = '/api/system/auth/login'

  const res = await rawRequest({
    url: requestUrl,
    method: 'POST',
    data: loginForm,
    header: {
      Authorization: ''
    }
  })

  const token = extractToken(res.data)

  if (res?.data?.code === 200 && token) {
    return {
      ...res.data,
      __token: token,
      __matchedUrl: requestUrl
    }
  }

  if (res?.data?.code === 200) {
    return {
      ...res.data,
      __token: token,
      __matchedUrl: requestUrl
    }
  }

  throw {
    msg: buildReadableMessage(res),
    __matchedUrl: requestUrl,
    __raw: res.data || null
  }
}