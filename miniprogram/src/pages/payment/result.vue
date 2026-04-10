<template>
  <view class="result-page">
    <!-- 成功状态 -->
    <view v-if="isSuccess" class="result-content success">
      <view class="result-icon success-icon">
        <text>✓</text>
      </view>
      <text class="result-title">支付成功</text>
      <text class="result-desc">您的预约已成功，我们将尽快与您联系确认</text>
      
      <!-- 订单信息卡片 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">订单编号</text>
          <text class="info-value order-no">{{ orderInfo.orderNo || '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">定金金额</text>
          <text class="info-value price">¥{{ orderInfo.depositAmount || 0 }}</text>
        </view>
        <view class="divider"></view>
        <view class="info-row">
          <text class="info-label">预约日期</text>
          <text class="info-value">{{ formatDate(bookingInfo.date) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">预约时段</text>
          <text class="info-value">{{ formatTimeSlot(bookingInfo.timeSlot) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">套餐名称</text>
          <text class="info-value">{{ orderInfo.packageName || '-' }}</text>
        </view>
      </view>
    </view>

    <!-- 失败状态 -->
    <view v-else class="result-content fail">
      <view class="result-icon fail-icon">
        <text>✕</text>
      </view>
      <text class="result-title">支付失败</text>
      <text class="result-desc">订单支付未成功，请重新尝试支付</text>
      
      <!-- 失败信息卡片 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">订单编号</text>
          <text class="info-value order-no">{{ orderInfo.orderNo || '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">待付金额</text>
          <text class="info-value price">¥{{ orderInfo.depositAmount || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button v-if="isSuccess" class="btn btn-primary" @click="goToOrderDetail">
        查看订单
      </button>
      <button v-else class="btn btn-primary" @click="retryPay">
        重新支付
      </button>
      <button class="btn btn-secondary" @click="goToHome">
        返回首页
      </button>
    </view>

    <!-- 客服提示 -->
    <view class="service-tips">
      <text class="tips-icon">💬</text>
      <text class="tips-text">如有问题，请联系客服：400-xxx-xxxx</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { callFunction } from '../../utils/cloud.js'
import { TIME_SLOTS } from '../../utils/constants.js'

// 状态
const orderId = ref('')
const status = ref('success')
const orderInfo = ref({})
const bookingInfo = ref({})

// 是否成功
const isSuccess = computed(() => status.value === 'success')

// 获取订单详情
const fetchOrderDetail = async () => {
  if (!orderId.value) return
  
  try {
    const res = await callFunction('payment', {
      action: 'getOrder',
      data: { orderId: orderId.value }
    })
    
    if (res.code === 0) {
      orderInfo.value = res.data
      // 如果有bookingId，获取预约信息
      if (res.data.bookingId) {
        await fetchBookingDetail(res.data.bookingId)
      }
    }
  } catch (err) {
    console.error('获取订单详情失败:', err)
  }
}

// 获取预约详情
const fetchBookingDetail = async (bookingId) => {
  try {
    const res = await callFunction('booking', {
      action: 'detail',
      data: { id: bookingId }
    })
    if (res.code === 0 && res.data) {
      bookingInfo.value = res.data
    }
  } catch (err) {
    console.error('获取预约详情失败:', err)
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  return `${year}-${month}-${day} ${weekDay}`
}

// 格式化时段
const formatTimeSlot = (slot) => {
  if (!slot) return '-'
  const timeSlot = TIME_SLOTS.find(t => t.value === slot)
  return timeSlot ? timeSlot.label : slot
}

// 查看订单详情
const goToOrderDetail = () => {
  uni.redirectTo({
    url: `/pages/order/detail?id=${orderId.value}`
  })
}

// 重新支付
const retryPay = () => {
  uni.redirectTo({
    url: `/pages/payment/index?orderId=${orderId.value}`
  })
}

// 返回首页
const goToHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 页面加载
onLoad((options) => {
  if (options.orderId) {
    orderId.value = options.orderId
  }
  if (options.status) {
    status.value = options.status
  }
  fetchOrderDetail()
})
</script>

<style lang="scss" scoped>
$primary-color: #c41230;
$success-color: #07c160;
$fail-color: #ff4d4f;
$bg-color: #f5f0e6;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$text-tertiary: #999999;

.result-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 60rpx 40rpx;
  padding-bottom: calc(60rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(60rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &.success {
    .result-icon {
      background: $success-color;
    }
    
    .result-title {
      color: $success-color;
    }
  }
  
  &.fail {
    .result-icon {
      background: $fail-color;
    }
    
    .result-title {
      color: $fail-color;
    }
  }
}

.result-icon {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  
  text {
    color: #ffffff;
    font-size: 72rpx;
    font-weight: bold;
  }
}

.result-title {
  font-size: 44rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.result-desc {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 50rpx;
  text-align: center;
}

// 信息卡片
.info-card {
  width: 100%;
  background: $card-bg;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 50rpx;
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    
    .info-label {
      font-size: 28rpx;
      color: $text-secondary;
    }
    
    .info-value {
      font-size: 28rpx;
      color: $text-primary;
      font-weight: 500;
      
      &.order-no {
        font-family: monospace;
        font-size: 26rpx;
      }
      
      &.price {
        font-size: 36rpx;
        font-weight: bold;
        color: $primary-color;
      }
    }
  }
  
  .divider {
    height: 1rpx;
    background: #f0f0f0;
    margin: 20rpx 0;
  }
}

// 操作按钮
.action-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  
  .btn {
    width: 100%;
    height: 96rpx;
    line-height: 96rpx;
    border-radius: 48rpx;
    font-size: 32rpx;
    font-weight: 600;
    border: none;
    
    &.btn-primary {
      background: linear-gradient(135deg, #8b1a1a, #c41230);
      color: #ffffff;
      
      &:active {
        opacity: 0.9;
      }
    }
    
    &.btn-secondary {
      background: #ffffff;
      color: $text-primary;
      border: 2rpx solid $border-color;
      
      &:active {
        background: #f8f8f8;
      }
    }
  }
}

// 客服提示
.service-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 50rpx;
  
  .tips-icon {
    font-size: 28rpx;
    margin-right: 10rpx;
  }
  
  .tips-text {
    font-size: 26rpx;
    color: $text-tertiary;
  }
}
</style>
