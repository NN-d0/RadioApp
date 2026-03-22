import { SYSTEM_BASE_URL, LOGIN_CANDIDATES } from '../config'

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
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      }
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

function isNotFoundResponse(res) {
  const body = res?.data || {}
  return (
    res?.statusCode === 404 ||
    body?.status === 404 ||
    body?.error === 'Not Found'
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

export async function loginApi(loginForm) {
  const tried = []
  let lastResponse = null
  let lastRequestFail = null

  for (const url of LOGIN_CANDIDATES) {
    tried.push(url)

    try {
      const res = await rawRequest({
        url,
        method: 'POST',
        data: loginForm,
        header: {
          Authorization: ''
        }
      })

      lastResponse = res

      if (isNotFoundResponse(res)) {
        continue
      }

      const token = extractToken(res.data)

      if (token) {
        return {
          ...res.data,
          __token: token,
          __matchedUrl: url,
          __triedUrls: tried
        }
      }

      if (res?.data?.code === 200) {
        return {
          ...res.data,
          __token: token,
          __matchedUrl: url,
          __triedUrls: tried
        }
      }

      throw {
        msg: buildReadableMessage(res),
        __matchedUrl: url,
        __triedUrls: tried,
        __raw: res.data
      }
    } catch (err) {
      lastRequestFail = err
    }
  }

  throw {
    msg: '未匹配到可用登录接口，请检查后端真实登录地址',
    __triedUrls: tried,
    __lastResponse: lastResponse?.data || null,
    __lastRequestFail: lastRequestFail || null
  }
}