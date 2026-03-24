<template>
  <view class="container">
    <view class="page-shell">
      <view class="demo-page-header">
        <view class="demo-page-title">告警详情</view>
        <view class="demo-page-subtitle">移动端告警确认与处理页面</view>
      </view>

      <view class="demo-card">
        <view class="tag-row">
          <text class="level-tag" :class="levelClass(detail.alarmLevel)">
            {{ detail.alarmLevel || '-' }}
          </text>
          <text class="status-tag" :class="statusClass(detail.alarmStatus)">
            {{ alarmStatusText(detail.alarmStatus) }}
          </text>
        </view>

        <view class="info-item">
          <text class="info-label">告警标题</text>
          <text class="info-value">{{ detail.title || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">告警编号</text>
          <text class="info-value">{{ detail.alarmNo || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">站点</text>
          <text class="info-value">{{ detail.stationName || ('站点ID:' + (detail.stationId || '-')) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">设备</text>
          <text class="info-value">{{ detail.deviceName || ('设备ID:' + (detail.deviceId || '-')) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">告警类型</text>
          <text class="info-value">{{ detail.alarmType || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">告警时间</text>
          <text class="info-value">{{ formatTime(detail.alarmTime) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">确认时间</text>
          <text class="info-value">{{ formatTime(detail.confirmTime) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">处理时间</text>
          <text class="info-value">{{ formatTime(detail.handleTime) }}</text>
        </view>
        <view class="info-item multi">
          <text class="info-label">告警内容</text>
          <text class="info-value block">{{ detail.content || '-' }}</text>
        </view>
        <view class="info-item multi">
          <text class="info-label">处理备注</text>
          <text class="info-value block">{{ detail.handleNote || '-' }}</text>
        </view>
      </view>

      <view class="demo-card" v-if="detail.alarmStatus !== 2">
        <view class="panel-title">处置操作</view>

        <button
          v-if="detail.alarmStatus === 0"
          class="confirm-btn"
          :loading="confirmLoading"
          @click="handleConfirm"
        >
          确认告警
        </button>

        <view class="handle-box">
          <view class="form-label">处理备注</view>
          <textarea
            v-model="handleNote"
            class="textarea"
            placeholder="请输入处理备注"
            placeholder-class="placeholder"
          />
        </view>

        <button
          class="primary-btn"
          :loading="handleLoading"
          @click="submitHandle"
        >
          确认处理
        </button>
      </view>

      <view class="demo-card" v-else>
        <view class="done-title">该告警已处理完成</view>
        <view class="done-sub-title">当前记录仅用于查看详情与论文截图</view>
      </view>
    </view>
  </view>
</template>

<script>
import { confirmAlarmApi, handleAlarmApi } from '../../common/api/alarm'

export default {
  data() {
    return {
      detail: {},
      handleNote: '',
      confirmLoading: false,
      handleLoading: false
    }
  },
  onLoad() {
    const detail = uni.getStorageSync('current_alarm_detail') || {}
    this.detail = detail
    this.handleNote = detail.handleNote || ''
  },
  methods: {
    formatTime(value) {
      if (!value) return '-'
      return String(value).replace('T', ' ')
    },
    alarmStatusText(status) {
      const map = {
        0: '未处理',
        1: '已确认',
        2: '已处理'
      }
      return map[status] || '未知'
    },
    levelClass(level) {
      const map = {
        HIGH: 'high',
        MEDIUM: 'medium',
        LOW: 'low'
      }
      return map[level] || 'medium'
    },
    statusClass(status) {
      const map = {
        0: 'pending',
        1: 'confirmed',
        2: 'handled'
      }
      return map[status] || 'pending'
    },
    async handleConfirm() {
      if (!this.detail.id) {
        uni.showToast({
          title: '未获取到告警ID',
          icon: 'none'
        })
        return
      }

      const confirmed = await new Promise((resolve) => {
        uni.showModal({
          title: '确认提示',
          content: '确认将该告警标记为已确认吗？',
          success: (res) => resolve(!!res.confirm)
        })
      })

      if (!confirmed) return

      try {
        this.confirmLoading = true

        await confirmAlarmApi({
          alarmId: this.detail.id
        })

        this.detail.alarmStatus = 1
        this.detail.confirmTime = this.currentTimeText()

        uni.setStorageSync('current_alarm_detail', this.detail)
        uni.setStorageSync('alarm_list_need_refresh', 1)

        uni.showToast({
          title: '告警已确认',
          icon: 'success'
        })
      } catch (error) {
        console.error('APP 告警确认失败：', error)
        uni.showToast({
          title: error?.msg || '告警确认失败',
          icon: 'none'
        })
      } finally {
        this.confirmLoading = false
      }
    },
    async submitHandle() {
      if (!this.detail.id) {
        uni.showToast({
          title: '未获取到告警ID',
          icon: 'none'
        })
        return
      }

      if (!this.handleNote) {
        uni.showToast({
          title: '请输入处理备注',
          icon: 'none'
        })
        return
      }

      try {
        this.handleLoading = true

        await handleAlarmApi({
          alarmId: this.detail.id,
          handleNote: this.handleNote
        })

        this.detail.alarmStatus = 2
        this.detail.handleNote = this.handleNote
        this.detail.handleTime = this.currentTimeText()

        uni.setStorageSync('current_alarm_detail', this.detail)
        uni.setStorageSync('alarm_list_need_refresh', 1)

        uni.showToast({
          title: '告警已处理',
          icon: 'success'
        })
      } catch (error) {
        console.error('APP 告警处理失败：', error)
        uni.showToast({
          title: error?.msg || '告警处理失败',
          icon: 'none'
        })
      } finally {
        this.handleLoading = false
      }
    },
    currentTimeText() {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
    }
  }
}
</script>

<style scoped>
@import '../../common/styles/demo-ui.css';

.tag-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.level-tag,
.status-tag {
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.level-tag.high {
  background: #fee2e2;
  color: #dc2626;
}

.level-tag.medium {
  background: #fef3c7;
  color: #d97706;
}

.level-tag.low {
  background: #dcfce7;
  color: #16a34a;
}

.status-tag.pending {
  background: #fee2e2;
  color: #dc2626;
}

.status-tag.confirmed {
  background: #dbeafe;
  color: #2563eb;
}

.status-tag.handled {
  background: #dcfce7;
  color: #16a34a;
}

.info-item {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #eef2f7;
}

.info-item.multi {
  flex-direction: column;
}

.info-label {
  width: 160rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.info-value {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
  color: #111827;
  font-weight: 500;
  word-break: break-all;
}

.info-value.block {
  text-align: left;
  line-height: 1.8;
}

.panel-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24rpx;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  margin-bottom: 24rpx;
}

.handle-box {
  margin-bottom: 24rpx;
}

.form-label {
  margin-bottom: 12rpx;
  font-size: 26rpx;
  color: #4b5563;
  font-weight: 600;
}

.textarea {
  width: 100%;
  min-height: 200rpx;
  background: #f8fafc;
  border: 2rpx solid #dbeafe;
  border-radius: 18rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #1f2937;
  box-sizing: border-box;
}

.placeholder {
  color: #9ca3af;
}

.done-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #16a34a;
}

.done-sub-title {
  margin-top: 14rpx;
  font-size: 26rpx;
  color: #6b7280;
}
</style>