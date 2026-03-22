import { SYSTEM_BASE_URL } from '../config'
import { getToken, clearAuth, getUserInfo, setUserInfo } from '../auth'

function buildHeaders(extraHeaders = {}) {
  const token = getToken()
  const userInfo = getUserInfo()

  return {
    Authorization: token ? `Bearer ${token}` : '',
    'X-Username': userInfo?.username || 'admin',
    ...extraHeaders
  }
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

async function doSystemRequest(url, method = 'GET', data = {}) {
  const res = await new Promise((resolve, reject) => {
    uni.request({
      url: SYSTEM_BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...buildHeaders()
      },
      success: resolve,
      fail: reject
    })
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

export function getCurrentUserProfileApi() {
  return doSystemRequest('/api/system/user/profile', 'GET')
}

export function updateCurrentUserProfileApi(data) {
  return doSystemRequest('/api/system/user/profile/update', 'PUT', data || {})
}

export function updateCurrentUserPasswordApi(data) {
  return doSystemRequest('/api/system/user/password/update', 'PUT', data || {})
}

export function uploadAvatarApi(filePath) {
  const token = getToken()
  const userInfo = getUserInfo()

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: SYSTEM_BASE_URL + '/api/system/user/avatar/upload',
      filePath,
      name: 'file',
      header: {
        Authorization: token ? `Bearer ${token}` : '',
        'X-Username': userInfo?.username || 'admin'
      },
      success: (uploadRes) => {
        let result = {}

        try {
          result = JSON.parse(uploadRes.data || '{}')
        } catch (error) {
          reject({
            msg: '头像上传返回数据解析失败',
            __raw: uploadRes.data
          })
          return
        }

        const normalized = normalizeResult(result)
        if (normalized && normalized.code === 200) {
          resolve(normalized)
          return
        }

        reject({
          msg: result?.msg || '头像上传失败',
          __raw: result
        })
      },
      fail: (err) => {
        reject({
          msg: '头像上传失败',
          __raw: err
        })
      }
    })
  })
}

export function syncUserInfoCache(profileData = {}) {
  const oldUserInfo = getUserInfo() || {}

  setUserInfo({
    ...oldUserInfo,
    username: profileData.username || oldUserInfo.username || 'admin',
    nickName: profileData.nickName || '',
    avatarUrl: profileData.avatarUrl || profileData.avatar || ''
  })
}