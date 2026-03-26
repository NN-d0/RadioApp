// =============================
// APP 端统一网关地址配置
// 说明：
// 1. APP 登录、首页、告警、监测、个人中心全部统一走 gateway:9000
// 2. 这样可以避免 APP 直连 9100 / 9200，后续切换环境也更简单
// 3. H5 通过 Vite 代理转发到 gateway，非 H5 直接访问 gateway
// =============================

let GATEWAY_BASE_URL = ''
let SYSTEM_BASE_URL = ''
let CORE_BASE_URL = ''

// H5 环境：走本地代理
// #ifdef H5
GATEWAY_BASE_URL = '/app-gateway'
SYSTEM_BASE_URL = GATEWAY_BASE_URL
CORE_BASE_URL = GATEWAY_BASE_URL
// #endif

// 非 H5 环境：直接访问 gateway
// 这里优先写本机默认地址，答辩时如果真机不在同一台电脑，请改成电脑局域网 IP
// #ifndef H5
GATEWAY_BASE_URL = 'http://127.0.0.1:9000'
SYSTEM_BASE_URL = GATEWAY_BASE_URL
CORE_BASE_URL = GATEWAY_BASE_URL
// #endif

export { GATEWAY_BASE_URL, SYSTEM_BASE_URL, CORE_BASE_URL }
