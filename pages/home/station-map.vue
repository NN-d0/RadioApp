<template>
  <view class="container">
    <view class="page-shell">
      <view class="demo-page-header">
        <view class="demo-page-title">站点地图 / 站点状态</view>
        <view class="demo-page-subtitle">先选中站点，再进入该站点实时监测页，适合演示与截图</view>
      </view>

      <view class="demo-grid-2">
        <view class="demo-stat-card theme-blue">
          <view class="demo-stat-label">站点总数</view>
          <view class="demo-stat-value">{{ summary.stationCount || 0 }}</view>
          <view class="demo-stat-sub">与首页总览联动</view>
        </view>

        <view class="demo-stat-card theme-green">
          <view class="demo-stat-label">在线站点</view>
          <view class="demo-stat-value">{{ summary.onlineStationCount || 0 }}</view>
          <view class="demo-stat-sub">当前在线监测站点</view>
        </view>

        <view class="demo-stat-card theme-red">
          <view class="demo-stat-label">离线站点</view>
          <view class="demo-stat-value">{{ summary.offlineStationCount || 0 }}</view>
          <view class="demo-stat-sub">当前离线站点</view>
        </view>

        <view class="demo-stat-card theme-purple">
          <view class="demo-stat-label">设备总数</view>
          <view class="demo-stat-value">{{ summary.deviceCount || 0 }}</view>
          <view class="demo-stat-sub">全站点设备数量</view>
        </view>
      </view>

      <view class="demo-card">
        <view class="demo-section-head">
          <view class="demo-section-title">站点示意地图</view>
          <view class="demo-section-desc">点击点位先选中站点，再点击下方按钮进入实时监测</view>
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
          <view class="legend-item">
            <view class="legend-dot active"></view>
            <text>当前选中</text>
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

      <view class="demo-card" v-if="currentStation">
        <view class="demo-section-head">
          <view class="demo-section-title">当前站点详情</view>
          <view class="demo-section-desc">用于展示当前选中的站点状态</view>
        </view>

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

        <button class="demo-primary-btn jump-btn" @click="goMonitorByStation(currentStation)">
          进入该站点实时监测
        </button>
      </view>

      <view class="demo-card">
        <view class="demo-section-head">
          <view class="demo-section-title">站点列表</view>
          <view class="demo-section-desc">点击列表项只做选中，不直接跳页</view>
        </view>

        <view v-if="stationList.length > 0">
          <view
            v-for="(item, index) in stationList"
            :key="item.id"
            class="demo-list-item"
            :class="{ active: currentIndex === index }"
            @click="handleSelectStation(index)"
          >
            <view class="demo-item-top">
              <view class="demo-item-title">{{ item.stationName || '未命名站点' }}</view>
              <view
                class="status-tag"
                :class="item.onlineStatus === 1 ? 'status-online' : 'status-offline'"
              >
                {{ item.onlineStatus === 1 ? '在线' : '离线' }}
              </view>
            </view>

            <view class="demo-item-line">
              设备 {{ item.deviceCount || 0 }} 台 / 运行 {{ item.runningDeviceCount || 0 }} 台
            </view>
            <view class="demo-item-line">
              最新监测：{{ item.latestSnapshotTime || '暂无数据' }}
            </view>
            <view class="demo-item-foot">
              <view class="demo-item-tip">点击选中当前站点</view>
              <view class="demo-item-arrow" v-if="currentIndex === index">✓</view>
              <view class="demo-item-arrow" v-else>›</view>
            </view>
          </view>
        </view>

        <view v-else class="demo-empty-wrap">
          <view class="demo-empty-text">暂无站点数据</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAppHomeSummaryApi } from '../../common/api/home'
import { getAppStationStatusListApi } from '../../common/api/station'

const STORAGE_KEY = 'app_selected_monitor_station'

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

      const latList = list.map(item => Number(item.latitude || 0))
      const lngList = list.map(item => Number(item.longitude || 0))

      const minLat = Math.min(...latList)
      const maxLat = Math.max(...latList)
      const minLng = Math.min(...lngList)
      const maxLng = Math.max(...lngList)

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

    applyStoredSelection() {
      const selected = uni.getStorageSync(STORAGE_KEY)
      if (!selected || !selected.id || !this.stationList.length) {
        return
      }

      const index = this.stationList.findIndex(item => Number(item.id) === Number(selected.id))
      if (index !== -1) {
        this.currentIndex = index
      }
    },

    storeSelection(station) {
      if (!station || !station.id) return
      uni.setStorageSync(STORAGE_KEY, {
        id: station.id,
        stationName: station.stationName || '',
        from: 'station-map',
        selectedAt: Date.now()
      })
    },

    async loadPageData() {
      if (this.loading) return

      try {
        this.loading = true

        const [summaryRes, stationRes] = await Promise.all([
          getAppHomeSummaryApi(),
          getAppStationStatusListApi()
        ])

        this.summary = summaryRes?.data || this.summary
        this.stationList = stationRes?.data || []

        if (this.currentIndex >= this.stationList.length) {
          this.currentIndex = 0
        }

        this.applyStoredSelection()
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
        this.storeSelection(current)
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

      this.storeSelection(station)

      uni.switchTab({
        url: '/pages/monitor/monitor'
      })
    }
  }
}
</script>

<style scoped>
@import '../../common/styles/demo-ui.css';

.legend-row {
  display: flex;
  gap: 26rpx;
  margin-top: 8rpx;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 24rpx;
  color: #64748b;
}

.legend-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
}

.legend-dot.online {
  background: #16a34a;
}

.legend-dot.offline {
  background: #dc2626;
}

.legend-dot.active {
  background: #2563eb;
}

.fake-map {
  position: relative;
  width: 100%;
  height: 520rpx;
  border-radius: 22rpx;
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.08), rgba(255, 255, 255, 0.8)),
    linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px);
  background-size: auto, 52rpx 52rpx, 52rpx 52rpx;
  overflow: hidden;
}

.marker-wrap {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.16);
}

.marker-dot.online {
  background: #16a34a;
}

.marker-dot.offline {
  background: #dc2626;
}

.marker-dot.active {
  width: 30rpx;
  height: 30rpx;
  background: #2563eb;
  box-shadow: 0 0 0 8rpx rgba(37, 99, 235, 0.14);
}

.marker-label {
  margin-top: 12rpx;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #1f2937;
  font-size: 22rpx;
  font-weight: 600;
  white-space: nowrap;
}

.marker-label.active {
  background: #2563eb;
  color: #ffffff;
}

.detail-line {
  padding: 18rpx 0;
  border-bottom: 1rpx solid #eef2f7;
  font-size: 26rpx;
  color: #1f2937;
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

.status-tag {
  min-width: 88rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 22rpx;
  font-weight: 600;
}

.status-online {
  background: #dcfce7;
  color: #16a34a;
}

.status-offline {
  background: #fee2e2;
  color: #dc2626;
}

.jump-btn {
  margin-top: 28rpx;
}
</style>