<template>
  <view class="container">
    <view class="card header-card">
      <view class="title">站点地图 / 状态</view>
      <view class="sub-title">点击任意站点后，直接跳到该站点实时监测页</view>
    </view>

    <view class="stats-grid">
      <view class="card stat-card blue">
        <view class="stat-label">站点总数</view>
        <view class="stat-value">{{ summary.stationCount || 0 }}</view>
        <view class="stat-sub">与首页统计联动</view>
      </view>

      <view class="card stat-card green">
        <view class="stat-label">在线站点</view>
        <view class="stat-value">{{ summary.onlineStationCount || 0 }}</view>
        <view class="stat-sub">当前在线监测站点</view>
      </view>

      <view class="card stat-card red">
        <view class="stat-label">离线站点</view>
        <view class="stat-value">{{ summary.offlineStationCount || 0 }}</view>
        <view class="stat-sub">当前离线站点</view>
      </view>

      <view class="card stat-card purple">
        <view class="stat-label">设备总数</view>
        <view class="stat-value">{{ summary.deviceCount || 0 }}</view>
        <view class="stat-sub">全站点设备数量</view>
      </view>
    </view>

    <view class="card map-card">
      <view class="section-header">
        <view class="section-title">站点示意地图</view>
        <view class="section-desc">点击点位直接进入实时监测</view>
      </view>

      <view class="legend-row">
        <view class="legend-item">
          <view class="legend-dot online"></view>
          <text>在线</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot offline"></view>
          <text>离线</text>
        </view>
      </view>

      <view class="fake-map">
        <view
          v-for="(item, index) in markerStations"
          :key="item.id"
          class="marker-wrap"
          :style="{ left: item.left + '%', top: item.top + '%' }"
          @click="handleSelectStation(index)"
        >
          <view
            class="marker-dot"
            :class="[
              item.onlineStatus === 1 ? 'online' : 'offline',
              currentIndex === index ? 'active' : ''
            ]"
          ></view>
          <view
            class="marker-label"
            :class="{ active: currentIndex === index }"
          >
            {{ item.stationName }}
          </view>
        </view>
      </view>
    </view>

    <view class="card detail-card" v-if="currentStation">
      <view class="section-title">当前站点详情</view>

      <view class="detail-line">站点名称：{{ currentStation.stationName || '-' }}</view>
      <view class="detail-line">
        运行状态：
        <text :class="currentStation.onlineStatus === 1 ? 'text-online' : 'text-offline'">
          {{ currentStation.onlineStatus === 1 ? '在线' : '离线' }}
        </text>
      </view>
      <view class="detail-line">设备数量：{{ currentStation.deviceCount || 0 }}</view>
      <view class="detail-line">运行设备：{{ currentStation.runningDeviceCount || 0 }}</view>
      <view class="detail-line">纬度：{{ formatNum(currentStation.latitude, 6) }}</view>
      <view class="detail-line">经度：{{ formatNum(currentStation.longitude, 6) }}</view>
      <view class="detail-line">最新监测：{{ currentStation.latestSnapshotTime || '暂无数据' }}</view>

      <button class="jump-btn" @click="goMonitorByStation(currentStation)">
        进入该站点实时监测
      </button>
    </view>

    <view class="card list-card">
      <view class="section-header">
        <view class="section-title">站点列表</view>
        <view class="section-desc">点击任意站点直接进入实时监测</view>
      </view>

      <view v-if="stationList.length > 0">
        <view
          v-for="(item, index) in stationList"
          :key="item.id"
          class="station-item"
          :class="{ active: currentIndex === index }"
          @click="handleSelectStation(index)"
        >
          <view class="station-top">
            <view class="station-name">{{ item.stationName || '未命名站点' }}</view>
            <view
              class="status-tag"
              :class="item.onlineStatus === 1 ? 'status-online' : 'status-offline'"
            >
              {{ item.onlineStatus === 1 ? '在线' : '离线' }}
            </view>
          </view>

          <view class="station-line">
            设备 {{ item.deviceCount || 0 }} 台 / 运行 {{ item.runningDeviceCount || 0 }} 台
          </view>
          <view class="station-line">
            最新监测：{{ item.latestSnapshotTime || '暂无数据' }}
          </view>
          <view class="station-link">点击进入该站点实时监测</view>
        </view>
      </view>

      <view v-else class="empty-wrap">
        <view class="empty-text">暂无站点数据</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAppHomeSummaryApi } from '../../common/api/home'
import { getAppStationStatusListApi } from '../../common/api/station'

export default {
  data() {
    return {
      loading: false,
      currentIndex: 0,
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
      stationList: []
    }
  },
  computed: {
    currentStation() {
      if (!this.stationList.length) return null
      return this.stationList[this.currentIndex] || null
    },
    markerStations() {
      const list = this.stationList || []
      if (!list.length) return []

      const validLatList = list.map(item => Number(item.latitude || 0))
      const validLngList = list.map(item => Number(item.longitude || 0))

      const minLat = Math.min(...validLatList)
      const maxLat = Math.max(...validLatList)
      const minLng = Math.min(...validLngList)
      const maxLng = Math.max(...validLngList)

      const latRange = maxLat - minLat || 0.05
      const lngRange = maxLng - minLng || 0.05

      return list.map((item, index) => {
        const lat = Number(item.latitude || 0)
        const lng = Number(item.longitude || 0)

        let left = ((lng - minLng) / lngRange) * 70 + 10
        let top = (1 - (lat - minLat) / latRange) * 60 + 12

        if (Number.isNaN(left) || Number.isNaN(top)) {
          left = 15 + index * 16
          top = 20 + index * 10
        }

        return {
          ...item,
          left: Math.max(8, Math.min(left, 84)),
          top: Math.max(10, Math.min(top, 76))
        }
      })
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
    formatNum(value, digits = 2) {
      if (value === null || value === undefined || value === '') return '-'
      const num = Number(value)
      if (Number.isNaN(num)) return '-'
      return num.toFixed(digits)
    },

    async loadPageData() {
      if (this.loading) return

      try {
        this.loading = true

        const [summaryRes, stationRes] = await Promise.all([
          getAppHomeSummaryApi(),
          getAppStationStatusListApi()
        ])

        this.summary = summaryRes.data || this.summary
        this.stationList = stationRes.data || []

        if (this.currentIndex >= this.stationList.length) {
          this.currentIndex = 0
        }
      } catch (error) {
        console.error('APP 站点地图页加载失败：', error)
        uni.showToast({
          title: error?.msg || '站点状态加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    handleSelectStation(index) {
      this.currentIndex = index
      const current = this.stationList[index]
      if (current) {
        this.goMonitorByStation(current)
      }
    },

    goMonitorByStation(station) {
      if (!station || !station.id) {
        uni.showToast({
          title: '未获取到站点信息',
          icon: 'none'
        })
        return
      }

      uni.setStorageSync('app_selected_monitor_station', {
        id: station.id,
        stationName: station.stationName || ''
      })

      uni.switchTab({
        url: '/pages/monitor/monitor'
      })
    }
  }
}
</script>

<style scoped>
.header-card {
  margin-bottom: 24rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  margin-bottom: 0;
}

.stat-label {
  font-size: 24rpx;
  color: #8a97ab;
  font-weight: 600;
}

.stat-value {
  margin-top: 14rpx;
  font-size: 40rpx;
  font-weight: 800;
  color: #1f2937;
}

.stat-sub {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #8a97ab;
  line-height: 1.6;
}

.blue {
  border-top: 6rpx solid #3b82f6;
}

.green {
  border-top: 6rpx solid #22c55e;
}

.red {
  border-top: 6rpx solid #ef4444;
}

.purple {
  border-top: 6rpx solid #8b5cf6;
}

.map-card {
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2937;
}

.section-desc {
  font-size: 22rpx;
  color: #8a97ab;
}

.legend-row {
  display: flex;
  gap: 24rpx;
  margin-bottom: 18rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #64748b;
}

.legend-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}

.legend-dot.online {
  background: #22c55e;
}

.legend-dot.offline {
  background: #ef4444;
}

.fake-map {
  position: relative;
  width: 100%;
  height: 420rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background:
    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  background-size: 32rpx 32rpx, 32rpx 32rpx, cover;
  border: 2rpx solid #dbeafe;
}

.marker-wrap {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  box-shadow: 0 6rpx 14rpx rgba(15, 23, 42, 0.18);
}

.marker-dot.online {
  background: #22c55e;
}

.marker-dot.offline {
  background: #ef4444;
}

.marker-dot.active {
  transform: scale(1.28);
}

.marker-label {
  margin-top: 10rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.95);
  color: #1f2937;
  font-size: 20rpx;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 6rpx 16rpx rgba(15, 23, 42, 0.08);
}

.marker-label.active {
  background: #2563eb;
  color: #ffffff;
}

.detail-card {
  margin-bottom: 24rpx;
}

.detail-line {
  margin-top: 14rpx;
  font-size: 26rpx;
  color: #4b5563;
  line-height: 1.8;
}

.text-online {
  color: #16a34a;
  font-weight: 700;
}

.text-offline {
  color: #dc2626;
  font-weight: 700;
}

.jump-btn {
  margin-top: 24rpx;
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 18rpx;
  border: none;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.list-card {
  margin-bottom: 40rpx;
}

.station-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eef2f7;
}

.station-item.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.04), rgba(59, 130, 246, 0.01));
}

.station-item:last-child {
  border-bottom: none;
}

.station-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.station-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.5;
}

.station-line {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.7;
}

.station-link {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #2563eb;
  font-weight: 600;
}

.status-tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  white-space: nowrap;
}

.status-online {
  background: #dcfce7;
  color: #16a34a;
}

.status-offline {
  background: #fee2e2;
  color: #dc2626;
}

.empty-wrap {
  padding: 20rpx 0 6rpx;
}

.empty-text {
  font-size: 24rpx;
  color: #94a3b8;
}
</style>