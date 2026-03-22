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

        const token = res.__token || ''

        if (!token) {
          console.error('APP 登录返回结果：', res)
          uni.showToast({
            title: '登录成功但未获取到 token',
            icon: 'none'
          })
          return
        }

        console.log('APP 登录命中接口：', res.__matchedUrl)
        console.log('APP 登录尝试路径：', res.__triedUrls)

        setToken(token)
        setUserInfo({
          username: this.form.username
        })

        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.switchTab({
            url: '/pages/home/home'
          })
        }, 300)
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
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.logo-shell {
  position: relative;
  width: 248rpx;
  height: 248rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-ring {
  position: absolute;
  inset: 0;
  border-radius: 42rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.08));
  box-shadow:
    0 18rpx 44rpx rgba(15, 23, 42, 0.16),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.35);
}

.logo {
  position: relative;
  z-index: 2;
  width: 208rpx;
  height: 208rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.98);
  padding: 14rpx;
}

.hero-badge {
  margin-top: 18rpx;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.system-title {
  margin-top: 24rpx;
  font-size: 58rpx;
  line-height: 1.22;
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  letter-spacing: 1rpx;
  text-shadow: 0 6rpx 20rpx rgba(15, 23, 42, 0.2);
}

.system-sub-title {
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.94);
  text-align: center;
}

.hero-tags {
  margin-top: 24rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14rpx;
}

.hero-tag {
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.13);
  color: #ffffff;
  font-size: 22rpx;
  line-height: 1;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.login-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 34rpx;
  padding: 34rpx 28rpx 34rpx;
  box-shadow:
    0 24rpx 56rpx rgba(15, 23, 42, 0.16),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8rpx);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.card-title {
  font-size: 36rpx;
  line-height: 1.35;
  font-weight: 900;
  color: #14213d;
}

.card-sub-title {
  margin-top: 12rpx;
  font-size: 25rpx;
  line-height: 1.55;
  color: #8a97ab;
}

.card-icon {
  width: 68rpx;
  height: 68rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #eef4ff 0%, #d9e8ff 100%);
  color: #2457d6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 900;
  flex-shrink: 0;
}

.form-item {
  margin-top: 28rpx;
}

.form-label {
  margin-bottom: 14rpx;
  font-size: 27rpx;
  line-height: 1.4;
  color: #334155;
  font-weight: 800;
}

.input-wrap {
  width: 100%;
  height: 94rpx;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2rpx solid #dbeafe;
  border-radius: 20rpx;
  padding: 0 22rpx 0 0;
}

.input-prefix {
  width: 82rpx;
  flex-shrink: 0;
  text-align: center;
  font-size: 28rpx;
  font-weight: 800;
  color: #4a67b3;
}

.input {
  flex: 1;
  height: 100%;
  font-size: 30rpx;
  color: #1f2937;
}

.placeholder {
  color: #9ca3af;
}

.login-btn {
  margin-top: 40rpx;
  height: 94rpx;
  line-height: 94rpx;
  border-radius: 22rpx;
  font-size: 34rpx;
  font-weight: 900;
  letter-spacing: 1rpx;
  background: linear-gradient(90deg, #2d63e8 0%, #4a8cff 100%);
  color: #ffffff;
  box-shadow: 0 16rpx 34rpx rgba(59, 130, 246, 0.28);
  border: none;
}

.login-tips {
  margin-top: 28rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eef2f7;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: #7c8ba1;
}

.tip-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #3b82f6;
  margin-top: 12rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.page-footer {
  margin-top: 26rpx;
  text-align: center;
  font-size: 21rpx;
  color: rgba(255, 255, 255, 0.82);
}

/* 小屏手机适配 */
@media screen and (max-width: 375px) {
  .login-wrapper {
    padding:
      calc(24rpx + env(safe-area-inset-top))
      24rpx
      calc(28rpx + env(safe-area-inset-bottom));
  }

  .hero-section {
    margin-bottom: 30rpx;
  }

  .logo-shell {
    width: 220rpx;
    height: 220rpx;
  }

  .logo {
    width: 186rpx;
    height: 186rpx;
  }

  .system-title {
    font-size: 50rpx;
  }

  .system-sub-title {
    font-size: 25rpx;
  }

  .login-card {
    padding: 28rpx 22rpx 28rpx;
  }

  .card-title {
    font-size: 34rpx;
  }

  .input-wrap {
    height: 88rpx;
  }

  .login-btn {
    height: 88rpx;
    line-height: 88rpx;
    font-size: 32rpx;
  }
}
</style>