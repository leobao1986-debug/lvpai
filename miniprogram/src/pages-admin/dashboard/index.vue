<template>
  <view class="page">
    <!-- 顶部欢迎区 -->
    <view class="header">
      <text class="title">管理后台</text>
      <text class="subtitle">朵兰摄影·静安雨霞</text>
    </view>

    <!-- 数据卡片区 -->
    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-value">{{ stats.todayBookings }}</text>
        <text class="stat-label">今日预约</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.pendingOrders }}</text>
        <text class="stat-label">待处理订单</text>
      </view>
      <view class="stat-card highlight">
        <text class="stat-value">¥{{ stats.monthIncome }}</text>
        <text class="stat-label">本月收入</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.totalGallery }}</text>
        <text class="stat-label">累计客片</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.totalBookings }}</text>
        <text class="stat-label">累计预约</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.totalUsers }}</text>
        <text class="stat-label">总用户数</text>
      </view>
    </view>

    <!-- 通知设置区域 -->
    <view class="section-title">通知设置</view>
    <view class="notify-card">
      <view class="notify-info">
        <view class="notify-title">
          <text class="notify-icon">🔔</text>
          <text class="notify-text">新订单通知</text>
        </view>
        <view class="notify-status">
          <text v-if="subscribeStatus.isSubscribed" class="status-badge active">
            已订阅
          </text>
          <text v-else class="status-badge inactive">
            未订阅
          </text>
          <text v-if="subscribeStatus.isSubscribed" class="remain-count">
            剩余 {{ subscribeStatus.remainCount }} 次
          </text>
        </view>
      </view>
      <view class="notify-desc">
        订阅后，有新订单支付成功时会通过微信消息通知您
      </view>
      <button 
        class="subscribe-btn" 
        :class="{ subscribed: subscribeStatus.isSubscribed }"
        @click="subscribeNotify"
        :disabled="subscribeLoading"
      >
        <text v-if="subscribeLoading">处理中...</text>
        <text v-else-if="subscribeStatus.isSubscribed">继续订阅（增加通知次数）</text>
        <text v-else>订阅新订单通知</text>
      </button>
    </view>

    <!-- 快捷入口 -->
    <view class="section-title">快捷入口</view>
    <view class="quick-actions">
      <view class="action-item" @click="navigateTo('/pages-admin/orders/index')">
        <view class="action-icon order">
          <text class="icon">📋</text>
        </view>
        <text class="action-text">订单管理</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages-admin/packages-manage/index')">
        <view class="action-icon package">
          <text class="icon">📦</text>
        </view>
        <text class="action-text">套餐管理</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages-admin/gallery-manage/index')">
        <view class="action-icon gallery">
          <text class="icon">🖼️</text>
        </view>
        <text class="action-text">客片管理</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages-admin/settings/index')">
        <view class="action-icon settings">
          <text class="icon">⚙️</text>
        </view>
        <text class="action-text">店铺设置</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { callFunction } from '../../utils/cloud'
import { SUBSCRIBE_TEMPLATE } from '../../utils/constants'

const userStore = useUserStore()
const loading = ref(true)
const subscribeLoading = ref(false)

const stats = ref({
  todayBookings: 0,
  pendingOrders: 0,
  monthIncome: 0,
  totalGallery: 0,
  totalBookings: 0,
  totalUsers: 0
})

// 订阅状态
const subscribeStatus = ref({
  isSubscribed: false,
  remainCount: 0
})

// 检查管理员权限
const checkAdmin = () => {
  if (!userStore.isAdminUser) {
    uni.showToast({
      title: '无权访问',
      icon: 'none'
    })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
    return false
  }
  return true
}

// 获取统计数据
const fetchStats = async () => {
  try {
    loading.value = true
    const res = await callFunction('stats', { action: 'overview' })
    if (res.code === 0 && res.data) {
      stats.value = res.data
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
    uni.showToast({
      title: '数据加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 页面跳转
const navigateTo = (url) => {
  uni.navigateTo({ url })
}

// 获取订阅状态
const fetchSubscribeStatus = async () => {
  const templateId = SUBSCRIBE_TEMPLATE.NEW_ORDER.templateId
  
  if (!templateId) {
    console.log('模板ID未配置')
    return
  }
  
  try {
    const res = await callFunction('notify', {
      action: 'getSubscribeStatus',
      data: { templateId }
    })
    
    if (res.code === 0 && res.data) {
      subscribeStatus.value = res.data
    }
  } catch (err) {
    console.error('获取订阅状态失败:', err)
  }
}

// 订阅新订单通知
const subscribeNotify = async () => {
  const templateId = SUBSCRIBE_TEMPLATE.NEW_ORDER.templateId
  
  if (!templateId) {
    uni.showToast({ 
      title: '模板ID未配置，请联系开发者', 
      icon: 'none' 
    })
    return
  }
  
  subscribeLoading.value = true
  
  try {
    // 请求订阅授权
    const res = await new Promise((resolve, reject) => {
      uni.requestSubscribeMessage({
        tmplIds: [templateId],
        success: resolve,
        fail: reject
      })
    })
    
    // 检查用户是否同意
    if (res[templateId] === 'accept') {
      // 记录订阅到数据库
      const subscribeRes = await callFunction('notify', {
        action: 'subscribe',
        data: { templateId }
      })
      
      if (subscribeRes.code === 0) {
        // 更新订阅状态
        subscribeStatus.value.isSubscribed = true
        subscribeStatus.value.remainCount = subscribeRes.data.remainCount
        
        uni.showToast({ title: '订阅成功', icon: 'success' })
      } else {
        uni.showToast({ 
          title: subscribeRes.message || '订阅失败', 
          icon: 'none' 
        })
      }
    } else if (res[templateId] === 'reject') {
      uni.showToast({ title: '您拒绝了订阅', icon: 'none' })
    } else if (res[templateId] === 'ban') {
      uni.showToast({ 
        title: '您已拒绝过订阅，可在小程序设置中开启', 
        icon: 'none',
        duration: 3000
      })
    }
  } catch (err) {
    console.error('订阅失败:', err)
    uni.showToast({ 
      title: '订阅失败，请重试', 
      icon: 'none' 
    })
  } finally {
    subscribeLoading.value = false
  }
}

onMounted(() => {
  if (checkAdmin()) {
    fetchStats()
    fetchSubscribeStatus()
  }
})
</script>

<style lang="scss" scoped>
$primary-color: #c41230;
$bg-color: #f5f5f5;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$text-muted: #999999;

.page {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 30rpx;
  box-sizing: border-box;
}

// 顶部欢迎区
.header {
  margin-bottom: 40rpx;

  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: $primary-color;
    margin-bottom: 10rpx;
  }

  .subtitle {
    display: block;
    font-size: 28rpx;
    color: $text-secondary;
  }
}

// 数据卡片区
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 50rpx;
}

.stat-card {
  background: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  &.highlight {
    background: linear-gradient(135deg, $primary-color, #e63950);

    .stat-value,
    .stat-label {
      color: #ffffff;
    }
  }

  .stat-value {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: $primary-color;
    margin-bottom: 10rpx;
  }

  .stat-label {
    display: block;
    font-size: 24rpx;
    color: $text-secondary;
  }
}

// 分区标题
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: 30rpx;
  padding-left: 20rpx;
  border-left: 8rpx solid $primary-color;
}

// 通知设置卡片
.notify-card {
  background: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  .notify-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .notify-title {
    display: flex;
    align-items: center;

    .notify-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }

    .notify-text {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-primary;
    }
  }

  .notify-status {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .status-badge {
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      font-size: 22rpx;

      &.active {
        background: #e8f5e9;
        color: #2e7d32;
      }

      &.inactive {
        background: #fafafa;
        color: #999;
      }
    }

    .remain-count {
      font-size: 24rpx;
      color: $text-muted;
    }
  }

  .notify-desc {
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 24rpx;
  }

  .subscribe-btn {
    width: 100%;
    height: 80rpx;
    background: $primary-color;
    color: #ffffff;
    font-size: 28rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;

    &::after {
      border: none;
    }

    &.subscribed {
      background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
    }

    &[disabled] {
      opacity: 0.6;
    }
  }
}

// 快捷入口
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
  background: $card-bg;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.96);
  }

  .action-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;

    &.order {
      background: #fff0f0;
    }

    &.package {
      background: #f0f8ff;
    }

    &.gallery {
      background: #f0fff0;
    }

    &.settings {
      background: #fffaf0;
    }

    .icon {
      font-size: 40rpx;
    }
  }

  .action-text {
    font-size: 26rpx;
    color: $text-primary;
  }
}

// 加载遮罩
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .loading-text {
    color: $text-secondary;
    font-size: 28rpx;
  }
}
</style>
