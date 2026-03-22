<template>
  <view class="container">
    <view class="page-shell">
      <view class="demo-page-header">
        <view class="demo-page-title">首页总览</view>
        <view class="demo-page-subtitle">移动端系统态势总览、站点联动与最新告警展示</view>
      </view>

      <view class="demo-grid-2">
        <view class="demo-stat-card theme-blue is-clickable" @click="goStationMap">
          <view class="demo-stat-label">站点总数</view>
          <view class="demo-stat-value">{{ summary.stationCount || 0 }}</view>
          <view class="demo-stat-sub">
            在线 {{ summary.onlineStationCount || 0 }} / 离线 {{ summary.offlineStationCount || 0 }}
          </view>
          <view class="demo-stat-link">点击查看站点地图并联动监测</view>
        </view>

        <view class="demo-stat-card theme-green">
          <view class="demo-stat-label">设备总数</view>
          <view class="demo-stat-value">{{ summary.deviceCount || 0 }}</view>
          <view class="demo-stat-sub">
            运行 {{ summary.runningDeviceCount || 0 }} / 停用 {{ summary.stopDeviceCount || 0 }}
          </view>
        </view>

        <view class="demo-stat-card theme-red">
          <view class="demo-stat-label">告警总数</view>
          <view class="demo-stat-value">{{ summary.alarmCount || 0 }}</view>
          <view class="demo-stat-sub">
            未处理 {{ summary.pendingAlarmCount || 0 }}
          </view>
        </view>

        <view class="demo-stat-card theme-purple">
          <view class="demo-stat-label">已确认 / 已处理</view>
          <view class="demo-stat-value">
            {{ (summary.confirmedAlarmCount || 0) + (summary.handledAlarmCount || 0) }}
          </view>
          <view class="demo-stat-sub">
            已确认 {{ summary.confirmedAlarmCount || 0 }} / 已处理 {{ summary.handledAlarmCount || 0 }}
          </view>
        </view>
      </view>

      <view class="demo-card">
        <view class="demo-section-head">
          <view class="demo-section-title">快捷入口</view>
          <view class="demo-section-desc">演示链路核心入口</view>
        </view>

        <view class="demo-quick-grid">
          <view class="demo-quick-item" @click="goAlarm">
            <view class="demo-quick-name">告警中心</view>
            <view class="demo-quick-desc">查看并处理告警</view>
          </view>

          <view class="demo-quick-item" @click="goMonitor">
            <view class="demo-quick-name">实时监测</view>
            <view class="demo-quick-desc">进入简版监测页</view>
          </view>

          <view class="demo-quick-item" @click="goStationMap">
            <view class="demo-quick-name">站点地图</view>
            <view class="demo-quick-desc">查看站点状态并联动监测</view>
          </view>
        </view>
      </view>

      <view class="demo-card demo-list-card">
        <view class="demo-section-head latest-head">
          <view class="demo-section-title">最新告警</view>
          <view class="demo-section-desc latest-link" @click="goAlarm">查看全部</view>
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
              <view class="demo-status-tag" :class="statusClass(item.alarmStatus)">
                {{ alarmStatusText(item.alarmStatus) }}
              </view>
            </view>

            <view class="demo-item-line">
              {{ item.stationName || ('站点ID:' + (item.stationId || '-')) }}
              ·
              {{ item.deviceName || ('设备ID:' + (item.deviceId || '-')) }}
            </view>

            <view class="demo-item-line">
              {{ formatTime(item.alarmTime) }}
            </view>
          </view>
        </view>

        <view v-else class="demo-empty-wrap">
          <view class="demo-empty-text">暂无最新告警</view>
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
      latestAlarmList: [],
      loading: false
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
    async loadPageData() {
      if (this.loading) return

      try {
        this.loading = true

        const [summaryRes, alarmRes] = await Promise.all([
          getAppHomeSummaryApi(),
          getAppHomeLatestAlarmsApi({ size: 5 })
        ])

        this.summary = summaryRes.data || this.summary
        this.latestAlarmList = alarmRes.data || []
      } catch (error) {
        console.error('APP 首页总览加载失败：', error)
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
        const detail = res.data || {}

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

.latest-head {
  padding-top: 24rpx;
}

.latest-link {
  color: #2563eb;
  font-weight: 700;
}
</style>