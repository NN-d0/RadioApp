<template>
  <view class="container">
    <view class="page-shell">
      <view class="demo-page-header">
        <view class="demo-page-title">告警中心</view>
        <view class="demo-page-subtitle">移动端查看告警、筛选告警、进入详情并执行处置</view>
      </view>

      <view class="demo-card">
        <view class="demo-section-head">
          <view class="demo-section-title">状态筛选</view>
          <view class="demo-section-desc">按状态快速过滤</view>
        </view>

        <view class="demo-chip-row">
          <view
            v-for="item in statusTabs"
            :key="String(item.value)"
            class="demo-chip"
            :class="{ 'is-active': queryForm.alarmStatus === item.value }"
            @click="changeStatus(item.value)"
          >
            {{ item.label }}
          </view>
        </view>

        <view class="search-wrap">
          <view class="demo-search-row">
            <input
              v-model="queryForm.keyword"
              class="demo-search-input"
              placeholder="请输入告警标题或告警编号"
              placeholder-class="demo-placeholder"
              confirm-type="search"
              @confirm="handleSearch"
            />
            <button class="demo-mini-btn" @click="handleSearch">查询</button>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <view class="demo-summary-row">
          <view class="demo-summary-card">
            <view class="demo-summary-label">当前页</view>
            <view class="demo-summary-value">{{ list.length }}</view>
          </view>
          <view class="demo-summary-card">
            <view class="demo-summary-label">总记录</view>
            <view class="demo-summary-value">{{ total }}</view>
          </view>
          <view class="demo-summary-card">
            <view class="demo-summary-label">未处理</view>
            <view class="demo-summary-value is-danger">{{ pendingCount }}</view>
          </view>
        </view>
      </view>

      <view class="demo-card demo-list-card">
        <view class="demo-section-head alarm-head">
          <view class="demo-section-title">告警列表</view>
          <view class="demo-section-desc">点击进入详情</view>
        </view>

        <view v-if="list.length > 0">
          <view
            v-for="item in list"
            :key="item.id"
            class="demo-list-item"
            @click="goDetail(item)"
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
            <view class="demo-item-line">类型：{{ item.alarmType || '-' }}</view>
            <view class="demo-item-line">时间：{{ formatTime(item.alarmTime) }}</view>

            <view class="demo-item-foot">
              <view class="demo-item-tip">点击查看详情与处置</view>
              <view class="demo-item-arrow">›</view>
            </view>
          </view>
        </view>

        <view v-else class="demo-empty-wrap">
          <view class="demo-empty-text">暂无告警数据</view>
          <button class="demo-outline-btn retry-btn" @click="loadPage(true)">重新加载</button>
        </view>
      </view>

      <button
        v-if="list.length > 0"
        class="demo-outline-btn more-btn"
        :disabled="loading || finished"
        @click="loadPage(false)"
      >
        {{ finished ? '已经到底了' : (loading ? '加载中...' : '加载更多') }}
      </button>
    </view>
  </view>
</template>

<script>
import { getAlarmPageApi } from '../../common/api/alarm'

export default {
  data() {
    return {
      loading: false,
      total: 0,
      finished: false,
      list: [],
      queryForm: {
        current: 1,
        size: 10,
        alarmStatus: '',
        keyword: ''
      },
      statusTabs: [
        { label: '全部', value: '' },
        { label: '未处理', value: 0 },
        { label: '已确认', value: 1 },
        { label: '已处理', value: 2 }
      ]
    }
  },
  computed: {
    pendingCount() {
      return this.list.filter(item => item.alarmStatus === 0).length
    }
  },
  onShow() {
    const needRefresh = uni.getStorageSync('alarm_list_need_refresh')
    if (needRefresh) {
      uni.removeStorageSync('alarm_list_need_refresh')
      this.loadPage(true)
      return
    }

    if (this.list.length === 0) {
      this.loadPage(true)
    }
  },
  onPullDownRefresh() {
    this.loadPage(true).finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    if (!this.finished && !this.loading) {
      this.loadPage(false)
    }
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
        HIGH: 'level-high',
        MEDIUM: 'level-medium',
        LOW: 'level-low'
      }
      return map[level] || 'level-medium'
    },
    statusClass(status) {
      const map = {
        0: 'status-pending',
        1: 'status-confirmed',
        2: 'status-handled'
      }
      return map[status] || 'status-pending'
    },
    changeStatus(status) {
      if (this.queryForm.alarmStatus === status) return
      this.queryForm.alarmStatus = status
      this.loadPage(true)
    },
    handleSearch() {
      this.loadPage(true)
    },
    async loadPage(reset = true) {
      if (this.loading) return

      try {
        this.loading = true

        if (reset) {
          this.queryForm.current = 1
          this.finished = false
        }

        const res = await getAlarmPageApi({
          current: this.queryForm.current,
          size: this.queryForm.size,
          alarmStatus: this.queryForm.alarmStatus === '' ? undefined : this.queryForm.alarmStatus,
          keyword: this.queryForm.keyword || undefined
        })

        const data = res.data || {}
        const records = data.records || []
        const total = data.total || 0

        this.total = total

        if (reset) {
          this.list = records
        } else {
          this.list = [...this.list, ...records]
        }

        if (this.list.length >= total || records.length < this.queryForm.size) {
          this.finished = true
        } else {
          this.queryForm.current += 1
        }
      } catch (error) {
        console.error('APP 告警列表加载失败：', error)
        uni.showToast({
          title: error?.msg || '告警列表加载失败',
          icon: 'none',
          duration: 2500
        })
      } finally {
        this.loading = false
      }
    },
    goDetail(item) {
      uni.setStorageSync('current_alarm_detail', item)
      uni.navigateTo({
        url: '/pages/alarm/detail?id=' + item.id
      })
    }
  }
}
</script>

<style scoped>
@import '../../common/styles/demo-ui.css';

.search-wrap {
  margin-top: 24rpx;
}

.alarm-head {
  padding-top: 24rpx;
}

.tag-col {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.retry-btn {
  margin-top: 20rpx;
}

.more-btn {
  margin-bottom: 24rpx;
}
</style>