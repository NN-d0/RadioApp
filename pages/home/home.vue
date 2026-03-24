<template>
  <view class="container">
    <view class="page-shell">
      <view class="demo-page-header">
        <view class="demo-page-title">首页总览</view>
        <view class="demo-page-subtitle">移动端系统态势总览、最新告警与快捷操作入口</view>
      </view>

      <view class="demo-grid-2">
        <view class="demo-stat-card theme-blue is-clickable" @click="goStationMap">
          <view class="demo-stat-label">站点总数</view>
          <view class="demo-stat-value">{{ summary.stationCount || 0 }}</view>
          <view class="demo-stat-sub">
            在线 {{ summary.onlineStationCount || 0 }} / 离线 {{ summary.offlineStationCount || 0 }}
          </view>
          <view class="demo-stat-link">点击查看站点地图</view>
        </view>

        <view class="demo-stat-card theme-green">
          <view class="demo-stat-label">设备总数</view>
          <view class="demo-stat-value">{{ summary.deviceCount || 0 }}</view>
          <view class="demo-stat-sub">
            运行 {{ summary.runningDeviceCount || 0 }} / 停用 {{ summary.stopDeviceCount || 0 }}
          </view>
        </view>

        <view class="demo-stat-card theme-red is-clickable" @click="goAlarm">
          <view class="demo-stat-label">告警总数</view>
          <view class="demo-stat-value">{{ summary.alarmCount || 0 }}</view>
          <view class="demo-stat-sub">
            未处理 {{ summary.pendingAlarmCount || 0 }} / 已确认 {{ summary.confirmedAlarmCount || 0 }}
          </view>
          <view class="demo-stat-link">点击进入告警中心</view>
        </view>

        <view class="demo-stat-card theme-purple is-clickable" @click="goMonitor">
          <view class="demo-stat-label">已处理告警</view>
          <view class="demo-stat-value">{{ summary.handledAlarmCount || 0 }}</view>
          <view class="demo-stat-sub">支持移动监测、告警查看、处置闭环演示</view>
          <view class="demo-stat-link">点击进入实时监测</view>
        </view>
      </view>

      <view class="demo-card">
        <view class="demo-section-head">
          <view class="demo-section-title">快捷入口</view>
          <view class="demo-section-desc">移动端最小闭环演示入口</view>
        </view>

        <view class="quick-grid">
          <view class="quick-card quick-blue" @click="goMonitor">
            <view class="quick-title">实时监测</view>
            <view class="quick-desc">查看某站点最新频谱参数</view>
          </view>

          <view class="quick-card quick-red" @click="goAlarm">
            <view class="quick-title">告警中心</view>
            <view class="quick-desc">查看告警并进入详情处置</view>
          </view>

          <view class="quick-card quick-green" @click="goStationMap">
            <view class="quick-title">站点地图</view>
            <view class="quick-desc">从地图联动选择监测站点</view>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <view class="demo-section-head">
          <view class="demo-section-title">最新告警</view>
          <view class="demo-section-desc">点击可进入告警详情页</view>
        </view>

        <view v-if="latestAlarmList.length > 0">
          <view
            v-for="item in latestAlarmList"
            :key="item.id"
            class="demo-list-item"
            @click="handleOpenAlarmDetail(item)"
          >
            <view class="demo-item-top">
              <view class="demo-item-title">{{ item.title || '未命名告警' }}</view>
              <view class="tag-col">
                <text class="demo-level-tag" :class="levelClass(item.alarmLevel)">
                  {{ item.alarmLevel || '-' }}
                </text>
                <text class="demo-status-tag" :class="statusClass(item.alarmStatus)">
                  {{ alarmStatusText(item.alarmStatus) }}
                </text>
              </view>
            </view>

            <view class="demo-item-line">告警编号：{{ item.alarmNo || '-' }}</view>
            <view class="demo-item-line">站点：{{ item.stationName || '-' }}</view>
            <view class="demo-item-line">设备：{{ item.deviceName || '-' }}</view>
            <view class="demo-item-line">时间：{{ formatTime(item.alarmTime) }}</view>

            <view class="demo-item-foot">
              <view class="demo-item-tip">点击查看详情</view>
              <view class="demo-item-arrow">›</view>
            </view>
          </view>
        </view>

        <view v-else class="demo-empty-wrap">
          <view class="demo-empty-text">暂无最新告警</view>
          <button class="demo-outline-btn retry-btn" :disabled="loading" @click="loadPageData">
            {{ loading ? '加载中...' : '重新加载' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getAppHomeAlarmDetailApi,
  getAppHomeLatestAlarmsApi,
  getAppHomeSummaryApi
} from '../../common/api/home'

export default {
  data() {
    return {
      loading: false,
      summary: {
        stationCount: 0,
        onlineStationCount: 0,
        offlineStationCount: 0,
        deviceCount: 0,
        runningDeviceCount: 0,
        stopDeviceCount: 0,
        alarmCount: 0,
        pendingAlarmCount: 0,
        confirmedAlarmCount: 0,
        handledAlarmCount: 0
      },
      latestAlarmList: []
    }
  },
  onShow() {
    this.loadPageData()
  },
  onPullDownRefresh() {
    this.loadPageData().finally(() => {
      uni.stopPullDownRefresh()
    })
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
    statusClass(status) {
      const map = {
        0: 'status-pending',
        1: 'status-confirmed',
        2: 'status-handled'
      }
      return map[status] || 'status-pending'
    },
    levelClass(level) {
      const map = {
        HIGH: 'level-high',
        MEDIUM: 'level-medium',
        LOW: 'level-low'
      }
      return map[level] || 'level-medium'
    },
    async loadPageData() {
      if (this.loading) return

      try {
        this.loading = true

        const [summaryRes, alarmRes] = await Promise.all([
          getAppHomeSummaryApi(),
          getAppHomeLatestAlarmsApi({ size: 5 })
        ])

        this.summary = summaryRes?.data || this.summary
        this.latestAlarmList = alarmRes?.data || []
      } catch (error) {
        console.error('APP 首页加载失败：', error)
        uni.showToast({
          title: error?.msg || '首页数据加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    goAlarm() {
      uni.switchTab({
        url: '/pages/alarm/alarm'
      })
    },
    goMonitor() {
      uni.switchTab({
        url: '/pages/monitor/monitor'
      })
    },
    goStationMap() {
      uni.navigateTo({
        url: '/pages/home/station-map'
      })
    },
    async handleOpenAlarmDetail(item) {
      if (!item?.id) {
        uni.showToast({
          title: '未获取到告警ID',
          icon: 'none'
        })
        return
      }

      try {
        const res = await getAppHomeAlarmDetailApi(item.id)
        const detail = res?.data || {}

        uni.setStorageSync('current_alarm_detail', detail)
        uni.navigateTo({
          url: '/pages/alarm/detail?id=' + item.id
        })
      } catch (error) {
        console.error('APP 首页告警详情加载失败：', error)
        uni.showToast({
          title: error?.msg || '告警详情加载失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
@import '../../common/styles/demo-ui.css';

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-top: 12rpx;
}

.quick-card {
  border-radius: 20rpx;
  padding: 28rpx 22rpx;
  color: #ffffff;
}

.quick-blue {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
}

.quick-red {
  background: linear-gradient(135deg, #dc2626, #f87171);
}

.quick-green {
  background: linear-gradient(135deg, #16a34a, #4ade80);
}

.quick-title {
  font-size: 30rpx;
  font-weight: 700;
}

.quick-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
  opacity: 0.95;
}

.tag-col {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.retry-btn {
  margin-top: 20rpx;
}
</style>