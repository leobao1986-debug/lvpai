<template>
  <view class="page">
    <!-- 标签页切换（仅订单类型） -->
    <view v-if="listType === 'order'" class="tab-bar">
      <view 
        v-for="tab in orderTabs" 
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 列表内容 -->
    <scroll-view 
      class="list-container"
      :class="{ 'has-tabs': listType === 'order' }"
      scroll-y
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 预约列表 -->
      <template v-if="listType === 'booking'">
        <view 
          v-for="item in list" 
          :key="item._id"
          class="list-item booking-item"
          @click="goToDetail(item._id, 'booking')"
        >
          <view class="item-header">
            <text class="item-title">{{ item.packageName }}</text>
            <text class="status-tag" :style="{ color: getBookingStatus(item.status).color }">
              {{ getBookingStatus(item.status).label }}
            </text>
          </view>
          <view class="item-body">
            <view class="info-row">
              <text class="info-label">预约日期：</text>
              <text class="info-value">{{ item.date }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">预约时段：</text>
              <text class="info-value">{{ getTimeSlotLabel(item.timeSlot) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">预约人数：</text>
              <text class="info-value">{{ item.persons }}人</text>
            </view>
          </view>
          <view class="item-footer">
            <text class="create-time">{{ formatTime(item.createTime) }}</text>
            <view class="action-btns">
              <view 
                v-if="item.status === 'pending'"
                class="btn cancel"
                @click.stop="cancelBooking(item._id)"
              >
                取消预约
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 订单列表 -->
      <template v-if="listType === 'order'">
        <view 
          v-for="item in list" 
          :key="item._id"
          class="list-item order-item"
          @click="goToDetail(item._id, 'order')"
        >
          <view class="item-header">
            <text class="order-no">订单号：{{ item.orderNo }}</text>
            <text class="status-tag" :style="{ color: getPayStatus(item.payStatus).color }">
              {{ getPayStatus(item.payStatus).label }}
            </text>
          </view>
          <view class="item-body">
            <view class="package-info">
              <text class="package-name">{{ item.packageName }}</text>
              <text class="package-price">¥{{ item.depositAmount }}</text>
            </view>
            <view v-if="item.bookingDate" class="info-row">
              <text class="info-label">预约日期：</text>
              <text class="info-value">{{ item.bookingDate }}</text>
            </view>
          </view>
          <view class="item-footer">
            <text class="create-time">{{ formatTime(item.createTime) }}</text>
            <view class="action-btns">
              <view 
                v-if="item.payStatus === 'unpaid'"
                class="btn pay"
                @click.stop="goToPay(item._id)"
              >
                去支付
              </view>
            </view>
          </view>
        </view>
      </template>
      
      <!-- 空状态 -->
      <view v-if="list.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无{{ pageTitle }}</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="list.length > 0" class="load-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore">没有更多了</text>
        <text v-else>上拉加载更多</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { callFunction } from '../../utils/cloud'
import { BOOKING_STATUS, PAY_STATUS, getTimeSlotLabel } from '../../utils/constants'

const props = defineProps({
  type: {
    type: String,
    default: 'booking'
  }
})

// 页面参数
const listType = ref('')
const pageTitle = computed(() => {
  const titles = {
    booking: '预约记录',
    order: '订单'
  }
  return titles[listType.value] || ''
})

// 订单标签页
const orderTabs = [
  { value: 'all', label: '全部' },
  { value: 'unpaid', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]
const currentTab = ref('all')

// 列表数据
const list = ref([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10
const noMore = ref(false)

// 获取预约状态
const getBookingStatus = (status) => {
  return BOOKING_STATUS[status] || { label: status, color: '#999999' }
}

// 获取支付状态
const getPayStatus = (status) => {
  return PAY_STATUS[status] || { label: status, color: '#999999' }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 切换标签
const switchTab = (tab) => {
  if (currentTab.value === tab) return
  currentTab.value = tab
  page.value = 1
  list.value = []
  noMore.value = false
  fetchList()
}

// 获取列表数据
const fetchList = async () => {
  if (loading.value || noMore.value) return
  loading.value = true

  try {
    let res
    if (listType.value === 'booking') {
      res = await callFunction('booking', {
        action: 'list',
        data: { page: page.value, pageSize }
      })
    } else if (listType.value === 'order') {
      const payStatus = currentTab.value === 'all' ? undefined : currentTab.value
      res = await callFunction('payment', {
        action: 'myOrders',
        data: { page: page.value, pageSize, payStatus }
      })
    }

    if (res && res.data) {
      const newList = res.data.list || []
      if (page.value === 1) {
        list.value = newList
      } else {
        list.value = [...list.value, ...newList]
      }
      noMore.value = newList.length < pageSize
    }
  } catch (err) {
    console.error('获取列表失败:', err)
    uni.showToast({ title: '获取失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (noMore.value || loading.value) return
  page.value++
  fetchList()
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  noMore.value = false
  fetchList()
}

// 跳转到详情
const goToDetail = (id, type) => {
  uni.navigateTo({
    url: `/pages/order/detail?id=${id}&type=${type}`
  })
}

// 去支付
const goToPay = (orderId) => {
  uni.navigateTo({
    url: `/pages/payment/index?orderId=${orderId}`
  })
}

// 取消预约
const cancelBooking = async (id) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该预约吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await callFunction('booking', {
            action: 'cancel',
            data: { id }
          })
          // 更新本地状态
          const item = list.value.find(item => item._id === id)
          if (item) {
            item.status = 'cancelled'
          }
          uni.showToast({ title: '取消成功', icon: 'success' })
        } catch (err) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}

// 页面加载
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const { type } = currentPage.$page?.options || currentPage.options || {}
  listType.value = type || 'booking'
  uni.setNavigationBarTitle({ title: pageTitle.value })
  fetchList()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 标签栏
.tab-bar {
  display: flex;
  background: #ffffff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .tab-item {
    flex: 1;
    padding: 24rpx 0;
    text-align: center;
    position: relative;
    
    .tab-text {
      font-size: 28rpx;
      color: #666666;
    }
    
    &.active {
      .tab-text {
        color: #1a9b8c;
        font-weight: 500;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: #1a9b8c;
        border-radius: 2rpx;
      }
    }
  }
}

// 列表容器
.list-container {
  height: calc(100vh - 88rpx);
  
  &.has-tabs {
    height: calc(100vh - 176rpx);
  }
}

// 列表项
.list-item {
  margin: 20rpx 30rpx;
  padding: 30rpx;
  background: #ffffff;
  border-radius: 16rpx;
  
  &.booking-item,
  &.order-item {
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      .item-title,
      .order-no {
        font-size: 30rpx;
        font-weight: 500;
        color: #333333;
      }
      
      .status-tag {
        font-size: 26rpx;
        font-weight: 500;
      }
    }
    
    .item-body {
      margin-bottom: 20rpx;
      
      .info-row {
        display: flex;
        margin-bottom: 12rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-label {
          font-size: 26rpx;
          color: #999999;
        }
        
        .info-value {
          font-size: 26rpx;
          color: #333333;
        }
      }
      
      .package-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;
        
        .package-name {
          font-size: 30rpx;
          color: #333333;
          font-weight: 500;
        }
        
        .package-price {
          font-size: 32rpx;
          color: #1a9b8c;
          font-weight: 600;
        }
      }
    }
    
    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20rpx;
      border-top: 1rpx solid #f5f5f5;
      
      .create-time {
        font-size: 24rpx;
        color: #999999;
      }
      
      .action-btns {
        display: flex;
        gap: 16rpx;
        
        .btn {
          padding: 12rpx 28rpx;
          border-radius: 8rpx;
          font-size: 26rpx;
          
          &.pay {
            background: #1a9b8c;
            color: #ffffff;
          }
          
          &.cancel {
            background: #f5f5f5;
            color: #666666;
          }
          
          &:active {
            opacity: 0.8;
          }
        }
      }
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
    color: #999999;
  }
}

// 加载更多
.load-more {
  text-align: center;
  padding: 30rpx;
  
  text {
    font-size: 24rpx;
    color: #999999;
  }
}
</style>
