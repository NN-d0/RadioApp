<template>
  <view class="container">
    <view class="page-shell">
      <view class="demo-page-header">
        <view class="monitor-header-top">
          <view>
            <view class="demo-page-title">实时监测</view>
            <view class="demo-page-subtitle">地图选站联动、最新频谱参数与简版动态频谱图</view>
          </view>
          <view class="monitor-switch-btn" @click="goStationMap">切换站点</view>
        </view>

        <view class="selected-station-bar" v-if="currentStationName">
          当前监测站点：{{ currentStationName }}
        </view>
      </view>

      <view class="demo-card">
        <view class="demo-section-head">
          <view class="demo-section-title">站点选择</view>
          <view class="demo-section-desc">支持地图页联动切换，也支持本页直接切换</view>
        </view>

        <picker
          class="picker-wrap"
          :range="stationList"
          range-key="stationName"
          :value="stationIndex"
          @change="handleStationChange"
        >
          <view class="picker-value">
            {{ currentStationName || '请选择站点' }}
          </view>
        </picker>

        <view class="monitor-action-row">
          <view class="monitor-poll-text">轮询状态：{{ polling ? '运行中' : '已停止' }}</view>
          <view class="monitor-action-buttons">
            <button class="demo-mini-btn" @click="handleManualRefresh">手动刷新</button>
            <button class="demo-mini-btn outline" @click="togglePolling">
              {{ polling ? '停止轮询' : '开始轮询' }}
            </button>
          </view>
        </view>
      </view>

      <view class="demo-grid-2">
        <view class="demo-stat-card theme-blue">
          <view class="demo-stat-label">设备名称</view>
          <view class="demo-stat-value is-text">{{ monitorData.deviceName || '-' }}</view>
          <view class="demo-stat-sub">当前站点关联监测设备</view>
        </view>

        <view class="demo-stat-card theme-green">
          <view class="demo-stat-label">AI识别结果</view>
          <view class="demo-stat-value is-text">{{ monitorData.aiResult || '-' }}</view>
          <view class="demo-stat-sub">当前最新识别标签</view>
        </view>

        <view class="demo-stat-card theme-orange">
          <view class="demo-stat-label">中心频率</view>
          <view class="demo-stat-value">{{ formatNum(monitorData.centerFreq) }}</view>
          <view class="demo-stat-sub">MHz</view>
        </view>

        <view class="demo-stat-card theme-red">
          <view class="demo-stat-label">功率电平</view>
          <view class="demo-stat-value">{{ formatNum(monitorData.powerLevel) }}</view>
          <view class="demo-stat-sub">dBm</view>
        </view>

        <view class="demo-stat-card theme-purple">
          <view class="demo-stat-label">带宽</view>
          <view class="demo-stat-value">{{ formatNum(monitorData.bandwidth) }}</view>
          <view class="demo-stat-sub">MHz</view>
        </view>

        <view class="demo-stat-card theme-cyan">
          <view class="demo-stat-label">点位数</view>
          <view class="demo-stat-value">{{ monitorData.pointCount || 0 }}</view>
          <view class="demo-stat-sub">{{ monitorData.dataSource || '-' }}</view>
        </view>

        <view class="demo-stat-card theme-pink">
          <view class="demo-stat-label">峰值频率</view>
          <view class="demo-stat-value is-text">{{ formatNum(monitorData.peakFreq) }}</view>
          <view class="demo-stat-sub">MHz</view>
        </view>

        <view class="demo-stat-card theme-deep">
          <view class="demo-stat-label">峰值功率</view>
          <view class="demo-stat-value">{{ formatNum(monitorData.peakPower) }}</view>
          <view class="demo-stat-sub">dBm</view>
        </view>

        <view class="demo-stat-card theme-gray full-width">
          <view class="demo-stat-label">更新时间</view>
          <view class="demo-stat-value is-text">{{ monitorData.snapshotTime || '-' }}</view>
          <view class="demo-stat-sub">最新监测快照时间</view>
        </view>
      </view>

      <view class="demo-card">
        <view class="demo-section-head">
          <view class="demo-section-title">动态频谱图</view>
          <view class="demo-section-desc">{{ monitorData.dataSource || '-' }}</view>
        </view>

        <view class="chart-topbar">
          <view class="topbar-item">
            <text class="topbar-label">峰值</text>
            <text class="topbar-value">{{ formatNum(monitorData.peakPower) }} dBm</text>
          </view>
          <view class="topbar-item">
            <text class="topbar-label">中心</text>
            <text class="topbar-value">{{ formatNum(monitorData.centerFreq) }} MHz</text>
          </view>
          <view class="topbar-item">
            <text class="topbar-label">识别</text>
            <text class="topbar-value">{{ monitorData.aiResult || '-' }}</text>
          </view>
        </view>

        <canvas canvas-id="spectrumCanvas" id="spectrumCanvas" class="spectrum-canvas"></canvas>

        <view class="axis-row">
          <text>{{ firstFreqText }}</text>
          <text>{{ middleFreqText }}</text>
          <text>{{ lastFreqText }}</text>
        </view>

        <view class="y-axis-tip">
          <text>功率范围：{{ formatNum(powerRange.min) }} ~ {{ formatNum(powerRange.max) }} dBm</text>
        </view>
      </view>

      <view class="demo-card">
        <view class="demo-section-title">监测说明</view>
        <view class="demo-info-line">当前站点：{{ monitorData.stationName || currentStationName || '-' }}</view>
        <view class="demo-info-line">设备名称：{{ monitorData.deviceName || '-' }}</view>
        <view class="demo-info-line">AI结果：{{ monitorData.aiResult || '-' }}</view>
        <view class="demo-info-line">数据来源：{{ monitorData.dataSource || '-' }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getLatestMonitorDataApi, getMonitorStationListApi } from '../../common/api/monitor'

const STORAGE_KEY = 'app_selected_monitor_station'

export default {
  data() {
    return {
      stationList: [],
      stationIndex: 0,
      polling: false,
      pollingTimer: null,
      lastPoints: [],
      monitorData: {
        stationId: null,
        stationName: '',
        deviceId: null,
        deviceName: '',
        aiResult: '',
        centerFreq: 0,
        bandwidth: 0,
        powerLevel: 0,
        snapshotTime: '',
        dataSource: '',
        pointCount: 0,
        peakFreq: 0,
        peakPower: 0,
        points: []
      }
    }
  },
  computed: {
    currentStation() {
      if (!this.stationList.length) return null
      return this.stationList[this.stationIndex] || null
    },
    currentStationName() {
      return this.currentStation?.stationName || ''
    },
    firstFreqText() {
      const points = this.monitorData.points || []
      if (!points.length) return '-'
      return `${this.formatNum(points[0].freq)} MHz`
    },
    middleFreqText() {
      const points = this.monitorData.points || []
      if (!points.length) return '-'
      const middle = points[Math.floor(points.length / 2)]
      return `${this.formatNum(middle.freq)} MHz`
    },
    lastFreqText() {
      const points = this.monitorData.points || []
      if (!points.length) return '-'
      return `${this.formatNum(points[points.length - 1].freq)} MHz`
    },
    powerRange() {
      const points = this.monitorData.points || []
      if (!points.length) {
        return { min: 0, max: 0 }
      }

      let min = Infinity
      let max = -Infinity

      points.forEach(item => {
        const power = Number(item.power)
        if (!Number.isNaN(power)) {
          if (power < min) min = power
          if (power > max) max = power
        }
      })

      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return { min: 0, max: 0 }
      }

      return { min, max }
    }
  },
  onShow() {
    this.initPage()
  },
  onHide() {
    this.stopPolling()
  },
  onUnload() {
    this.stopPolling()
  },
  methods: {
    formatNum(value) {
      if (value === null || value === undefined || value === '') return '-'
      const num = Number(value)
      if (Number.isNaN(num)) return '-'
      return num.toFixed(2)
    },

    getStoredStation() {
      return uni.getStorageSync(STORAGE_KEY) || null
    },

    persistSelectedStation(station) {
      if (!station || !station.id) return
      uni.setStorageSync(STORAGE_KEY, {
        id: station.id,
        stationName: station.stationName || '',
        from: 'monitor',
        selectedAt: Date.now()
      })
    },

    async initPage() {
      try {
        await this.loadStations()
        this.applySelectedStationFromStorage()

        if (this.stationList.length > 0) {
          await this.loadLatestData()
          this.startPolling()
        } else {
          this.drawSpectrumChart([])
        }
      } catch (error) {
        console.error('APP 实时监测初始化失败：', error)
        uni.showToast({
          title: error?.msg || '监测页初始化失败',
          icon: 'none'
        })
      }
    },

    async loadStations() {
      const res = await getMonitorStationListApi()
      this.stationList = res?.data || []

      if (!this.stationList.length) {
        uni.showToast({
          title: '暂无站点数据',
          icon: 'none'
        })
        return
      }

      if (this.stationIndex >= this.stationList.length) {
        this.stationIndex = 0
      }
    },

    applySelectedStationFromStorage() {
      const selected = this.getStoredStation()
      if (!selected || !selected.id || !this.stationList.length) {
        return
      }

      const index = this.stationList.findIndex(item => Number(item.id) === Number(selected.id))
      if (index !== -1) {
        this.stationIndex = index
      }
    },

    async loadLatestData() {
      const station = this.currentStation
      if (!station || !station.id) {
        this.drawSpectrumChart([])
        return
      }

      this.persistSelectedStation(station)

      try {
        const res = await getLatestMonitorDataApi(station.id)
        const data = res?.data || {}
        const nextPoints = Array.isArray(data.points) ? data.points : []

        this.monitorData = {
          stationId: data.stationId || null,
          stationName: data.stationName || station.stationName || '',
          deviceId: data.deviceId || null,
          deviceName: data.deviceName || '',
          aiResult: data.aiResult || '',
          centerFreq: Number(data.centerFreq || 0),
          bandwidth: Number(data.bandwidth || 0),
          powerLevel: Number(data.powerLevel || 0),
          snapshotTime: data.snapshotTime || '',
          dataSource: data.dataSource || '',
          pointCount: Number(data.pointCount || 0),
          peakFreq: Number(data.peakFreq || 0),
          peakPower: Number(data.peakPower || 0),
          points: nextPoints
        }

        this.animateSpectrum(this.lastPoints, nextPoints)
        this.lastPoints = JSON.parse(JSON.stringify(nextPoints))
      } catch (error) {
        console.error('APP 最新监测加载失败：', error)
        uni.showToast({
          title: error?.msg || '监测数据加载失败',
          icon: 'none'
        })
      }
    },

    handleStationChange(e) {
      this.stationIndex = Number(e.detail.value || 0)
      this.lastPoints = []
      const station = this.currentStation
      if (station) {
        this.persistSelectedStation(station)
      }
      this.loadLatestData()
    },

    handleManualRefresh() {
      this.loadLatestData()
    },

    goStationMap() {
      uni.navigateTo({
        url: '/pages/home/station-map'
      })
    },

    startPolling() {
      this.stopPolling()
      this.polling = true
      this.pollingTimer = setInterval(() => {
        this.loadLatestData()
      }, 3000)
    },

    stopPolling() {
      this.polling = false
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer)
        this.pollingTimer = null
      }
    },

    togglePolling() {
      if (this.polling) {
        this.stopPolling()
      } else {
        this.startPolling()
      }
    },

    animateSpectrum(oldPoints = [], newPoints = []) {
      if (!newPoints.length) {
        this.drawSpectrumChart([])
        return
      }

      const maxLen = newPoints.length
      const safeOld = oldPoints.length === maxLen
        ? oldPoints
        : newPoints.map((item, index) => {
            const fallback = oldPoints[index] || item
            return {
              freq: item.freq,
              power: Number(fallback.power)
            }
          })

      let frame = 0
      const totalFrames = 10

      const run = () => {
        frame += 1
        const progress = frame / totalFrames

        const current = newPoints.map((item, index) => {
          const oldPower = Number(safeOld[index]?.power ?? item.power)
          const newPower = Number(item.power)
          return {
            freq: Number(item.freq),
            power: oldPower + (newPower - oldPower) * progress
          }
        })

        this.drawSpectrumChart(current)

        if (frame < totalFrames) {
          setTimeout(run, 28)
        }
      }

      run()
    },

    drawSpectrumChart(points = []) {
      const ctx = uni.createCanvasContext('spectrumCanvas', this)
      const systemInfo = uni.getSystemInfoSync()
      const canvasWidth = Math.max(systemInfo.windowWidth - 48, 300)
      const canvasHeight = 260

      const paddingLeft = 38
      const paddingRight = 16
      const paddingTop = 18
      const paddingBottom = 34

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.setFillStyle('#f8fbff')
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
      bgGradient.addColorStop(0, 'rgba(37,99,235,0.08)')
      bgGradient.addColorStop(1, 'rgba(37,99,235,0.00)')
      ctx.setFillStyle(bgGradient)
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const innerWidth = canvasWidth - paddingLeft - paddingRight
      const innerHeight = canvasHeight - paddingTop - paddingBottom

      ctx.setStrokeStyle('#e5e7eb')
      ctx.setLineWidth(1)

      for (let i = 0; i <= 4; i++) {
        const y = paddingTop + innerHeight * (i / 4)
        ctx.beginPath()
        ctx.moveTo(paddingLeft, y)
        ctx.lineTo(canvasWidth - paddingRight, y)
        ctx.stroke()
      }

      for (let i = 0; i <= 4; i++) {
        const x = paddingLeft + innerWidth * (i / 4)
        ctx.beginPath()
        ctx.moveTo(x, paddingTop)
        ctx.lineTo(x, canvasHeight - paddingBottom)
        ctx.stroke()
      }

      if (!points.length) {
        ctx.setFillStyle('#94a3b8')
        ctx.setFontSize(14)
        ctx.fillText('暂无监测点位数据', canvasWidth / 2 - 54, canvasHeight / 2)
        ctx.draw()
        return
      }

      const powers = points.map(item => Number(item.power)).filter(item => !Number.isNaN(item))
      const minPower = Math.min(...powers)
      const maxPower = Math.max(...powers)
      const diff = maxPower - minPower || 1

      const pointList = points.map((item, index) => {
        const power = Number(item.power)
        const x = paddingLeft + innerWidth * (index / Math.max(points.length - 1, 1))
        const y = paddingTop + innerHeight - ((power - minPower) / diff) * innerHeight
        return { x, y, power }
      })

      const areaGradient = ctx.createLinearGradient(0, paddingTop, 0, canvasHeight - paddingBottom)
      areaGradient.addColorStop(0, 'rgba(37,99,235,0.28)')
      areaGradient.addColorStop(1, 'rgba(37,99,235,0.02)')

      ctx.beginPath()
      pointList.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.lineTo(pointList[pointList.length - 1].x, canvasHeight - paddingBottom)
      ctx.lineTo(pointList[0].x, canvasHeight - paddingBottom)
      ctx.closePath()
      ctx.setFillStyle(areaGradient)
      ctx.fill()

      ctx.beginPath()
      pointList.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.setStrokeStyle('#2563eb')
      ctx.setLineWidth(2.2)
      ctx.stroke()

      let maxIndex = 0
      pointList.forEach((point, index) => {
        if (point.power > pointList[maxIndex].power) {
          maxIndex = index
        }
      })

      const peak = pointList[maxIndex]
      ctx.beginPath()
      ctx.arc(peak.x, peak.y, 4, 0, Math.PI * 2)
      ctx.setFillStyle('#ef4444')
      ctx.fill()

      ctx.setFillStyle('#64748b')
      ctx.setFontSize(11)
      ctx.fillText(maxPower.toFixed(1), 4, paddingTop + 4)
      ctx.fillText(minPower.toFixed(1), 4, canvasHeight - paddingBottom)

      ctx.draw()
    }
  }
}
</script>

<style scoped>
@import '../../common/styles/demo-ui.css';

.monitor-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.monitor-switch-btn {
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
}

.selected-station-bar {
  margin-top: 18rpx;
  padding: 18rpx 22rpx;
  border-radius: 18rpx;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  font-size: 26rpx;
  font-weight: 600;
}

.picker-wrap {
  margin-top: 12rpx;
}

.picker-value {
  min-height: 84rpx;
  line-height: 84rpx;
  padding: 0 24rpx;
  border-radius: 18rpx;
  background: #f8fafc;
  border: 2rpx solid #dbeafe;
  font-size: 28rpx;
  color: #111827;
}

.monitor-action-row {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  flex-wrap: wrap;
}

.monitor-poll-text {
  font-size: 24rpx;
  color: #64748b;
}

.monitor-action-buttons {
  display: flex;
  gap: 14rpx;
}

.demo-mini-btn.outline {
  background: #ffffff;
  color: #2563eb;
  border: 2rpx solid #bfdbfe;
}

.chart-topbar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 22rpx;
}

.topbar-item {
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: #f8fbff;
}

.topbar-label {
  display: block;
  font-size: 22rpx;
  color: #8a97ab;
}

.topbar-value {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #1f2937;
  font-weight: 700;
}

.spectrum-canvas {
  width: 100%;
  height: 520rpx;
  border-radius: 20rpx;
  background: #f8fbff;
}

.axis-row,
.y-axis-tip {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  margin-top: 18rpx;
  font-size: 22rpx;
  color: #6b7280;
}

.demo-info-line {
  padding: 18rpx 0;
  border-bottom: 1rpx solid #eef2f7;
  font-size: 26rpx;
  color: #1f2937;
  line-height: 1.8;
}
</style>