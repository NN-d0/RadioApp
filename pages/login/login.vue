<template>
  <view class="login-page">
    <view class="bg-grid"></view>
    <view class="bg-glow bg-glow-left"></view>
    <view class="bg-glow bg-glow-right"></view>

    <view class="login-wrapper">
      <view class="hero-section">
        <view class="logo-shell">
          <view class="logo-ring"></view>
          <image class="logo" src="/static/APPLogo.png" mode="aspectFit"></image>
        </view>

        <view class="hero-badge">APP 移动终端</view>

        <view class="system-title">无线电频谱智能监测系统</view>
        <view class="system-sub-title">移动巡检与告警处置终端</view>

        <view class="hero-tags">
          <view class="hero-tag">实时监测</view>
          <view class="hero-tag">告警处置</view>
          <view class="hero-tag">移动巡检</view>
        </view>
      </view>

      <view class="login-card">
        <view class="card-head">
          <view>
            <view class="card-title">管理员登录</view>
            <view class="card-sub-title">请输入账号与密码进入 APP 客户端</view>
          </view>
          <view class="card-icon">管</view>
        </view>

        <view class="form-item">
          <view class="form-label">用户名</view>
          <view class="input-wrap">
            <view class="input-prefix">账</view>
            <input
              v-model="form.username"
              class="input"
              placeholder="请输入用户名"
              placeholder-class="placeholder"
              confirm-type="next"
            />
          </view>
        </view>

        <view class="form-item">
          <view class="form-label">密码</view>
          <view class="input-wrap">
            <view class="input-prefix">密</view>
            <input
              v-model="form.password"
              class="input"
              type="password"
              password
              placeholder="请输入密码"
              placeholder-class="placeholder"
              confirm-type="done"
              @confirm="handleLogin"
            />
          </view>
        </view>

        <button class="primary-btn login-btn" :loading="loading" @click="handleLogin">
          登录系统
        </button>

        <view class="login-tips">
          <view class="tip-item">
            <view class="tip-dot"></view>
            <text>用于移动端态势查看、告警确认与现场巡检</text>
          </view>
          <view class="tip-item">
            <view class="tip-dot"></view>
            <text>与 PC 端共用同一套用户体系与业务数据</text>
          </view>
        </view>
      </view>

      <view class="page-footer">
        <text>无线电频谱智能监测系统 · APP 端</text>
      </view>
    </view>
  </view>
</template>

<script>
import { loginApi } from '../../common/api/user'
import { setToken, setUserInfo } from '../../common/auth'

export default {
  data() {
    return {
      loading: false,
      form: {
        username: 'admin',
        password: '123456'
      }
    }
  },
  methods: {
    async handleLogin() {
      if (!this.form.username) {
        uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        })
        return
      }

      if (!this.form.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }

      try {
        this.loading = true

        const res = await loginApi({
          username: this.form.username,
          password: this.form.password
        })

        const token = res?.__token || ''
        const userInfo = res?.data?.userInfo || {}

        if (!token) {
          uni.showToast({
            title: '登录成功但未获取到 token',
            icon: 'none'
          })
          return
        }

        setToken(token)
        setUserInfo({
          id: userInfo.id || '',
          username: userInfo.username || this.form.username,
          realName: userInfo.realName || '',
          nickName: userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || '',
          roleCode: userInfo.roleCode || '',
          phone: userInfo.phone || '',
          status: userInfo.status
        })

        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.switchTab({
            url: '/pages/home/home'
          })
        }, 250)
      } catch (error) {
        console.error('APP 登录失败：', error)
        uni.showToast({
          title: error?.msg || '登录失败',
          icon: 'none',
          duration: 2500
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(84, 160, 255, 0.28) 0%, rgba(84, 160, 255, 0) 32%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0) 30%),
    linear-gradient(180deg, #0d1f4a 0%, #1e46b7 52%, #6faeff 100%);
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
  background-size: 32rpx 32rpx;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(10rpx);
  opacity: 0.9;
}

.bg-glow-left {
  width: 280rpx;
  height: 280rpx;
  left: -80rpx;
  top: 140rpx;
  background: rgba(255, 255, 255, 0.1);
}

.bg-glow-right {
  width: 340rpx;
  height: 340rpx;
  right: -100rpx;
  bottom: 180rpx;
  background: rgba(255, 255, 255, 0.08);
}

.login-wrapper {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  width: 100%;
  max-width: 750rpx;
  margin: 0 auto;
  padding:
    calc(34rpx + env(safe-area-inset-top))
    32rpx
    calc(34rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.hero-section {
  padding-top: 40rpx;
  text-align: center;
}

.logo-shell {
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 40rpx rgba(255, 255, 255, 0.12) inset;
}

.logo {
  width: 112rpx;
  height: 112rpx;
  position: relative;
  z-index: 1;
}

.hero-badge {
  margin: 30rpx auto 0;
  width: fit-content;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.14);
  color: #eaf2ff;
  font-size: 24rpx;
  font-weight: 600;
}

.system-title {
  margin-top: 30rpx;
  font-size: 48rpx;
  line-height: 1.35;
  font-weight: 800;
  color: #ffffff;
}

.system-sub-title {
  margin-top: 18rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.86);
}

.hero-tags {
  margin-top: 28rpx;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14rpx;
}

.hero-tag {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.12);
  color: #edf4ff;
  font-size: 24rpx;
}

.login-card {
  margin-top: 48rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 34rpx 30rpx;
  box-shadow: 0 24rpx 60rpx rgba(11, 30, 84, 0.22);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 28rpx;
}

.card-title {
  font-size: 38rpx;
  color: #1f2a37;
  font-weight: 800;
}

.card-sub-title {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #7a879c;
}

.card-icon {
  width: 72rpx;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #2d6df6, #5ea2ff);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
}

.form-item + .form-item {
  margin-top: 24rpx;
}

.form-label {
  margin-bottom: 12rpx;
  font-size: 26rpx;
  color: #475569;
  font-weight: 700;
}

.input-wrap {
  display: flex;
  align-items: center;
  background: #f8fbff;
  border: 2rpx solid #dce8f8;
  border-radius: 20rpx;
  overflow: hidden;
}

.input-prefix {
  width: 84rpx;
  text-align: center;
  font-size: 26rpx;
  color: #2d6df6;
  font-weight: 700;
}

.input {
  flex: 1;
  height: 92rpx;
  font-size: 28rpx;
  color: #1f2937;
}

.placeholder {
  color: #a0aec0;
}

.primary-btn.login-btn {
  margin-top: 34rpx;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #2d6df6, #5ea2ff);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  border: none;
}

.login-tips {
  margin-top: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.7;
}

.tip-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #2d6df6;
  flex-shrink: 0;
}

.page-footer {
  margin-top: auto;
  padding-top: 28rpx;
  text-align: center;
  color: rgba(255, 255, 255, 0.82);
  font-size: 22rpx;
}
</style>