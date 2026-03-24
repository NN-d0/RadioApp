// =============================
// APP 端基础地址配置
// 说明：
// 1. H5 环境通过 Vite 代理访问，避免跨域
// 2. 非 H5（真机 / 模拟器）直接访问后端服务
// 3. 当前先保持 system / core 分端口，保证最小可运行
// =============================

// system 服务：登录、个人资料、密码、头像
let SYSTEM_BASE_URL = ''

// core 服务：告警、监测、首页态势、站点状态
let CORE_BASE_URL = ''

// H5 环境：走代理
// #ifdef H5
SYSTEM_BASE_URL = '/app-system-api'
CORE_BASE_URL = '/app-core-api'
// #endif

// 非 H5 环境：改成你自己电脑实际可访问的 IP
// #ifndef H5
SYSTEM_BASE_URL = 'http://10.18.14.254:9100'
CORE_BASE_URL = 'http://10.18.14.254:9200'
// #endif

export { SYSTEM_BASE_URL, CORE_BASE_URL }