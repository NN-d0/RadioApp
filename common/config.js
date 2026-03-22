// system 服务：登录、个人信息等
let SYSTEM_BASE_URL = ''

// core 服务：告警、监测、历史等
let CORE_BASE_URL = ''

// H5 在线模拟 / 浏览器环境
// 走 Vite 代理，避免跨域
// #ifdef H5
SYSTEM_BASE_URL = '/app-system-api'
CORE_BASE_URL = '/app-core-api'
// #endif

// #ifndef H5
SYSTEM_BASE_URL = 'http://10.18.14.254:9100'
CORE_BASE_URL = 'http://10.18.14.254:9200'
// #endif

export { SYSTEM_BASE_URL, CORE_BASE_URL }

export const LOGIN_CANDIDATES = [
  '/api/system/auth/login',
  '/system/auth/login',
  '/auth/login',
  '/system/login',
  '/login'
]