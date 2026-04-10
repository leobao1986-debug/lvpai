<template>
  <view class="page">
    <!-- 页面标题 -->
    <view class="header">
      <text class="title">订单管理</text>
    </view>

    <!-- 筛选栏 -->
    <scroll-view class="filter-bar" scroll-x>
      <view
        v-for="item in statusFilters"
        :key="item.value"
        class="filter-item"
        :class="{ active: currentStatus === item.value }"
        @click="changeStatus(item.value)"
      >
        <text>{{ item.label }}</text>
      </view>
    </scroll-view>

    <!-- 订单列表 -->
    <scroll-view
      class="order-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view
        v-for="order in orderList"
        :key="order._id"
        class="order-card"
        @click="goToDetail(order._id)"
      >
        <view class="order-header">
          <text class="order-no">订单号: {{ order.orderNo }}</text>
          <text
            class="status-tag"
            :style="{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }"
          >
            {{ getStatusLabel(order.status) }}
          </text>
        </view>
        <view class="order-body">
          <text class="package-name">{{ order.packageName }}</text>
          <view class="customer-info">
            <text class="customer-name">{{ order.customerName }}</text>
            <text class="booking-date">{{ order.bookingDate }} {{ order.timeSlotLabel }}</text>
          </view>
        </view>
        <view class="order-footer">
          <text class="price">¥{{ order.totalPrice }}</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="orderList.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="orderList.length > 0" class="load-more">
        <text v-if="loadingMore">加载中...</text>
        <text v-else-if="noMore">没有更多了</text>
      </view>
    </scroll-view>

    <!-- 加载状态 -->
    <view v-if="loading && orderList.length === 0" class="loading-mask">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { callFunction } from '../../utils/cloud'
import { ORDER_STATUS } from '../../utils/constants'

const userStore = useUserStore()

// 状态筛选
const statusFilters = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'shooting', label: '拍摄中' },
  { value: 'retouching', label: '修片中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const currentStatus = ref('')
const orderList = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10
const noMore = ref(false)

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

// 获取状态标签
const getStatusLabel = (status) => {
  return ORDER_STATUS[status]?.label || status
}

// 获取状态颜色
const getStatusColor = (status) => {
  return ORDER_STATUS[status]?.color || '#999999'
}

// 获取订单列表
const fetchOrders = async (isLoadMore = false) => {
  if (loading.value || loadingMore.value) return

  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    page.value = 1
    noMore.value = false
  }

  try {
    const res = await callFunction('booking', {
      action: 'list',
      data: {
        isAdmin: true,
        status: currentStatus.value,
        page: page.value,
        pageSize
      }
    })

    if (res.code === 0) {
      const list = res.data.list || []
      // 处理时段标签
      const timeSlotMap = {
        morning: '上午',
        afternoon: '下午',
        golden: '黄金时段'
      }
      list.forEach(item => {
        item.timeSlotLabel = timeSlotMap[item.timeSlot] || item.timeSlot
      })

      if (isLoadMore) {
        orderList.value.push(...list)
      } else {
        orderList.value = list
      }

      if (list.length < pageSize) {
        noMore.value = true
      }
    }
  } catch (err) {
    console.error('获取订单列表失败:', err)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    loadingMore.value = false
    refreshing.value = false
  }
}

// 切换状态筛选
const changeStatus = (status) => {
  if (currentStatus.value === status) return
  currentStatus.value = status
  fetchOrders(false)
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  noMore.value = false
  fetchOrders(false)
}

// 加载更多
const loadMore = () => {
  if (noMore.value || loadingMore.value) return
  page.value++
  fetchOrders(true)
}

// 跳转到详情
const goToDetail = (id) => {
  uni.navigateTo({
    url: `/pages-admin/orders/detail?id=${id}`
  })
}

onMounted(() => {
  if (checkAdmin()) {
    fetchOrders()
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
  display: flex;
  flex-direction: column;
}

// 页面标题
.header {
  background: $card-bg;
  padding: 30rpx;
  border-bottom: 1rpx solid #eeeeee;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-primary;
  }
}

// 筛选栏
.filter-bar {
  background: $card-bg;
  white-space: nowrap;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eeeeee;

  .filter-item {
    display: inline-block;
    padding: 12rpx 30rpx;
    margin-right: 20rpx;
    background: #f5f5f5;
    border-radius: 30rpx;
    font-size: 26rpx;
    color: $text-secondary;
    transition: all 0.3s;

    &.active {
      background: $primary-color;
      color: #ffffff;
    }
  }
}

// 订单列表
.order-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.order-card {
  background: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .order-no {
      font-size: 26rpx;
      color: $text-muted;
    }

    .status-tag {
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      font-size: 24rpx;
    }
  }

  .order-body {
    margin-bottom: 20rpx;

    .package-name {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 12rpx;
    }

    .customer-info {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .customer-name {
        font-size: 28rpx;
        color: $text-secondary;
      }

      .booking-date {
        font-size: 26rpx;
        color: $text-muted;
      }
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;

    .price {
      font-size: 32rpx;
      font-weight: bold;
      color: $primary-color;
    }

    .arrow {
      font-size: 40rpx;
      color: $text-muted;
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: $text-muted;
  }
}

// 加载更多
.load-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: $text-muted;
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
