<template>
  <view class="container">
    <view class="page-shell">
      <view class="demo-page-header">
        <view class="demo-page-title">我的</view>
        <view class="demo-page-subtitle">个人资料、头像、密码与退出登录统一演示版界面</view>
      </view>

      <view class="demo-card">
        <view class="demo-profile-top">
          <image
            class="demo-avatar"
            :src="currentAvatar"
            mode="aspectFill"
          />
          <view class="profile-right">
            <view class="demo-profile-name">{{ profile.nickName || profile.username || '未登录用户' }}</view>
            <view class="demo-profile-sub">{{ profile.roleName || '管理员' }}</view>
            <view class="demo-profile-sub">账号：{{ profile.username || '-' }}</view>
          </view>
        </view>

        <button class="demo-outline-btn upload-btn" :loading="avatarLoading" @click="handleChooseAvatar">
          {{ avatarLoading ? '头像上传中...' : '选择本地头像（≤2MB）' }}
        </button>
      </view>

      <view class="demo-card">
        <view class="demo-section-head">
          <view class="demo-section-title">基本资料</view>
          <view class="demo-section-desc">修改昵称与头像</view>
        </view>

        <view class="demo-form-item">
          <view class="demo-form-label">昵称</view>
          <input
            v-model="editForm.nickName"
            class="demo-input"
            placeholder="请输入昵称"
            placeholder-class="demo-placeholder"
          />
        </view>

        <view class="demo-form-item">
          <view class="demo-form-label">头像地址</view>
          <input
            v-model="editForm.avatarUrl"
            class="demo-input"
            disabled
            placeholder="头像上传后会自动回填"
            placeholder-class="demo-placeholder"
          />
        </view>

        <button class="demo-primary-btn action-btn" :loading="profileLoading" @click="handleUpdateProfile">
          保存资料
        </button>
      </view>

      <view class="demo-card">
        <view class="demo-section-head">
          <view class="demo-section-title">修改密码</view>
          <view class="demo-section-desc">演示管理员密码修改</view>
        </view>

        <view class="demo-form-item">
          <view class="demo-form-label">原密码</view>
          <input
            v-model="passwordForm.oldPassword"
            class="demo-input"
            type="password"
            placeholder="请输入原密码"
            placeholder-class="demo-placeholder"
          />
        </view>

        <view class="demo-form-item">
          <view class="demo-form-label">新密码</view>
          <input
            v-model="passwordForm.newPassword"
            class="demo-input"
            type="password"
            placeholder="请输入新密码"
            placeholder-class="demo-placeholder"
          />
        </view>

        <button class="demo-primary-btn action-btn" :loading="passwordLoading" @click="handleUpdatePassword">
          修改密码
        </button>
      </view>

      <button class="demo-outline-btn logout-btn" @click="handleLogout">
        退出登录
      </button>
    </view>
  </view>
</template>

<script>
import {
  getCurrentUserProfileApi,
  updateCurrentUserPasswordApi,
  updateCurrentUserProfileApi,
  uploadAvatarApi,
  syncUserInfoCache
} from '../../common/api/profile'
import { clearAuth } from '../../common/auth'

export default {
  data() {
    return {
      defaultAvatar: '/static/logo.png',
      profileLoading: false,
      passwordLoading: false,
      avatarLoading: false,
      profile: {
        username: '',
        realName: '',
        nickName: '',
        avatarUrl: '',
        roleName: ''
      },
      editForm: {
        nickName: '',
        avatarUrl: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: ''
      }
    }
  },
  computed: {
    currentAvatar() {
      return this.editForm.avatarUrl || this.profile.avatarUrl || this.defaultAvatar
    }
  },
  onShow() {
    this.loadProfile()
  },
  methods: {
    async loadProfile() {
      try {
        const res = await getCurrentUserProfileApi()
        const data = res.data || {}

        this.profile = {
          username: data.username || '',
          realName: data.realName || '',
          nickName: data.nickName || '',
          avatarUrl: data.avatarUrl || '',
          roleName: data.roleName || '管理员'
        }

        this.editForm.nickName = this.profile.nickName
        this.editForm.avatarUrl = this.profile.avatarUrl

        syncUserInfoCache(this.profile)
      } catch (error) {
        console.error('APP 个人信息加载失败：', error)
        uni.showToast({
          title: error?.msg || '个人信息加载失败',
          icon: 'none'
        })
      }
    },

    async handleChooseAvatar() {
      try {
        const chooseRes = await new Promise((resolve, reject) => {
          uni.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: resolve,
            fail: reject
          })
        })

        const file = chooseRes?.tempFiles?.[0]
        const filePath = chooseRes?.tempFilePaths?.[0]

        if (!filePath) {
          uni.showToast({
            title: '未选择图片',
            icon: 'none'
          })
          return
        }

        if (file && file.size > 2 * 1024 * 1024) {
          uni.showToast({
            title: '头像图片不能超过2MB',
            icon: 'none'
          })
          return
        }

        this.avatarLoading = true

        const uploadRes = await uploadAvatarApi(filePath)
        const uploadData = uploadRes.data || {}

        this.editForm.avatarUrl = uploadData.avatarUrl || ''
        await this.handleUpdateProfile('头像已更新')
      } catch (error) {
        console.error('APP 头像上传失败：', error)
        uni.showToast({
          title: error?.msg || '头像上传失败',
          icon: 'none'
        })
      } finally {
        this.avatarLoading = false
      }
    },

    async handleUpdateProfile(successText = '资料已保存') {
      if (!this.editForm.nickName) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        })
        return
      }

      try {
        this.profileLoading = true

        const res = await updateCurrentUserProfileApi({
          nickName: this.editForm.nickName,
          avatarUrl: this.editForm.avatarUrl
        })

        const data = res.data || {}

        this.profile.nickName = data.nickName || this.editForm.nickName
        this.profile.avatarUrl = data.avatarUrl || this.editForm.avatarUrl

        this.editForm.nickName = this.profile.nickName
        this.editForm.avatarUrl = this.profile.avatarUrl

        syncUserInfoCache({
          username: this.profile.username,
          nickName: this.profile.nickName,
          avatarUrl: this.profile.avatarUrl
        })

        uni.showToast({
          title: successText,
          icon: 'success'
        })
      } catch (error) {
        console.error('APP 修改资料失败：', error)
        uni.showToast({
          title: error?.msg || '资料保存失败',
          icon: 'none'
        })
      } finally {
        this.profileLoading = false
      }
    },

    async handleUpdatePassword() {
      if (!this.passwordForm.oldPassword) {
        uni.showToast({
          title: '请输入原密码',
          icon: 'none'
        })
        return
      }

      if (!this.passwordForm.newPassword) {
        uni.showToast({
          title: '请输入新密码',
          icon: 'none'
        })
        return
      }

      if (this.passwordForm.newPassword.length < 6) {
        uni.showToast({
          title: '新密码至少6位',
          icon: 'none'
        })
        return
      }

      try {
        this.passwordLoading = true

        await updateCurrentUserPasswordApi({
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        })

        this.passwordForm.oldPassword = ''
        this.passwordForm.newPassword = ''

        uni.showToast({
          title: '密码已修改',
          icon: 'success'
        })
      } catch (error) {
        console.error('APP 修改密码失败：', error)
        uni.showToast({
          title: error?.msg || '修改密码失败',
          icon: 'none'
        })
      } finally {
        this.passwordLoading = false
      }
    },

    handleLogout() {
      uni.showModal({
        title: '退出提示',
        content: '确认退出当前账号吗？',
        success: (res) => {
          if (!res.confirm) return

          clearAuth()
          uni.removeStorageSync('current_alarm_detail')
          uni.removeStorageSync('alarm_list_need_refresh')
          uni.removeStorageSync('app_selected_monitor_station')

          uni.showToast({
            title: '已退出登录',
            icon: 'none'
          })

          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }, 200)
        }
      })
    }
  }
}
</script>

<style scoped>
@import '../../common/styles/demo-ui.css';

.profile-right {
  flex: 1;
}

.upload-btn {
  margin-top: 24rpx;
}

.action-btn {
  margin-top: 28rpx;
}

.logout-btn {
  margin-bottom: 24rpx;
}
</style>