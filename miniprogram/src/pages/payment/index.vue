<template>
  <view class="payment-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">支付确认</text>
    </view>

    <!-- 倒计时提示 -->
    <view v-if="countdown > 0 && orderInfo.payStatus === 'unpaid'" class="countdown-bar">
      <text class="countdown-icon">⏱️</text>
      <text class="countdown-text">请在 {{ formatCountdown }} 内完成支付，超时订单将自动取消</text>
    </view>

    <!-- 订单摘要 -->
    <view class="section">
      <view class="section-title">订单信息</view>
      <view class="card order-card">
        <view class="order-item">
          <text class="item-label">套餐名称</text>
          <text class="item-value">{{ orderInfo.packageName || '-' }}</text>
        </view>
        <view class="order-item">
          <text class="item-label">预约日期</text>
          <text class="item-value">{{ formatDate(orderInfo.bookingDate) }}</text>
        </view>
        <view class="order-item">
          <text class="item-label">预约时段</text>
          <text class="item-value">{{ formatTimeSlot(orderInfo.timeSlot) }}</text>
        </view>
        <view class="order-item">
          <text class="item-label">联系人</text>
          <text class="item-value">{{ orderInfo.contactName || '-' }}</text>
        </view>
        <view class="order-item">
          <text class="item-label">联系电话</text>
          <text class="item-value">{{ orderInfo.contactPhone || '-' }}</text>
        </view>
        <view class="order-item">
          <text class="item-label">拍摄人数</text>
          <text class="item-value">{{ orderInfo.persons || 1 }}人</text>
        </view>
      </view>
    </view>

    <!-- 支付信息 -->
    <view class="section">
      <view class="section-title">支付信息</view>
      <view class="card payment-card">
        <view class="price-row">
          <text class="price-label">套餐总价</text>
          <text class="price-value original">¥{{ orderInfo.totalPrice || 0 }}</text>
        </view>
        <view class="price-row deposit-row">
          <text class="price-label">需支付定金</text>
          <text class="price-value deposit">¥{{ orderInfo.depositAmount || 0 }}</text>
        </view>
        <view class="price-notice">
          <text class="notice-icon">ℹ️</text>
          <text class="notice-text">定金支付后，到店拍摄时支付尾款</text>
        </view>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="section">
      <view class="section-title">支付方式</view>
      <view class="card pay-method-card">
        <view class="pay-method">
          <view class="method-icon">
            <text>💳</text>
          </view>
          <view class="method-info">
            <text class="method-name">微信支付</text>
            <text class="method-desc">推荐使用微信支付</text>
          </view>
          <view class="method-check">
            <view class="check-circle checked">
              <text class="check-icon">✓</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部支付栏 -->
    <view class="bottom-bar">
      <view class="pay-info">
        <text class="pay-label">实付金额</text>
        <text class="pay-amount">¥{{ orderInfo.depositAmount || 0 }}</text>
      </view>
      <button 
        class="pay-btn" 
        :disabled="paying || orderInfo.payStatus !== 'unpaid' || countdown <= 0"
        @click="handlePay"
      >
        <text v-if="paying">支付中...</text>
        <text v-else>支付定金 ¥{{ orderInfo.depositAmount || 0 }}</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { callFunction } from '../../utils/cloud.js'
import { getTimeSlotLabel } from '../../utils/constants.js'

// 订单信息
const orderId = ref('')
const orderInfo = ref({
  payStatus: 'unpaid'
})
const paying = ref(false)

// 倒计时
const countdown = ref(0)
const countdownTimer = ref(null)

// 格式化倒计时
const formatCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 获取订单详情
const fetchOrderDetail = async () => {
  if (!orderId.value) return
  
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await callFunction('payment', {
      action: 'getOrder',
      data: { orderId: orderId.value }
    })
    uni.hideLoading()
    
    if (res.code === 0) {
      orderInfo.value = res.data
      
      // 计算倒计时（30分钟）
      if (res.data.payStatus === 'unpaid' && res.data.createTime) {
        const createdTime = new Date(res.data.createTime).getTime()
        const expireTime = createdTime + 30 * 60 * 1000
        const now = Date.now()
        const remaining = Math.floor((expireTime - now) / 1000)
        countdown.value = Math.max(0, remaining)
        
        if (countdown.value > 0) {
          startCountdown()
        }
      }
      
      // 如果订单已支付，跳转到结果页
      if (res.data.payStatus === 'paid') {
        uni.redirectTo({
          url: `/pages/payment/result?orderId=${orderId.value}&status=success`
        })
      }
    } else {
      uni.showToast({ title: res.message || '获取订单失败', icon: 'none' })
    }
  } catch (err) {
    uni.hideLoading()
    console.error('获取订单详情失败:', err)
    uni.showToast({ title: '获取订单失败', icon: 'none' })
  }
}

// 启动倒计时
const startCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
  
  countdownTimer.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(countdownTimer.value)
      // 倒计时结束，刷新订单状态
      fetchOrderDetail()
    }
  }, 1000)
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  return `${month}月${day}日 ${weekDay}`
}

// 格式化时段
const formatTimeSlot = (slot) => {
  return getTimeSlotLabel(slot) || '-'
}

// 处理支付
const handlePay = async () => {
  if (paying.value || orderInfo.value.payStatus !== 'unpaid' || countdown.value <= 0) {
    return
  }
  
  // 先弹出确认框（演示模式提示）
  uni.showModal({
    title: '确认支付',
    content: `确认支付定金 ¥${orderInfo.value.depositAmount || 0}？\n（当前为演示模式）`,
    confirmText: '确认支付',
    success: async (res) => {
      if (res.confirm) {
        await paySuccess()
      }
    }
  })
}

// 执行支付成功逻辑
const paySuccess = async () => {
  try {
    paying.value = true
    uni.showLoading({ title: '支付处理中...' })
    
    // 调用创建订单（模拟）
    await callFunction('payment', {
      action: 'createOrder',
      data: { orderId: orderId.value }
    })
    
    // 模拟支付成功
    const res = await callFunction('payment', {
      action: 'paySuccess',
      data: { orderId: orderId.value }
    })
    
    uni.hideLoading()
    paying.value = false
    
    if (res.code === 0) {
      uni.redirectTo({
        url: `/pages/payment/result?orderId=${orderId.value}&status=success`
      })
    } else {
      uni.showToast({ title: res.message || '支付失败', icon: 'none' })
    }
  } catch (err) {
    uni.hideLoading()
    paying.value = false
    console.error('支付失败:', err)
    uni.showToast({ title: err.message || '支付失败', icon: 'none' })
  }
}

// 页面加载
onLoad((options) => {
  if (options.orderId) {
    orderId.value = options.orderId
    fetchOrderDetail()
  } else {
    uni.showToast({ title: '订单ID不能为空', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
})
</script>

<style lang="scss" scoped>
$primary-color: #1a9b8c;
$bg-color: #f0f8f7;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$text-tertiary: #999999;
$border-color: #e5e5e5;

.payment-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.page-header {
  background: $primary-color;
  padding: 30rpx;
  
  .page-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
  }
}

.countdown-bar {
  background: #fff5f0;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .countdown-icon {
    font-size: 28rpx;
    margin-right: 10rpx;
  }
  
  .countdown-text {
    font-size: 26rpx;
    color: #ff6b35;
  }
}

.section {
  margin: 20rpx 30rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 16rpx;
  }
}

.card {
  background: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

// 订单信息
.order-card {
  .order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-label {
      font-size: 28rpx;
      color: $text-secondary;
    }
    
    .item-value {
      font-size: 28rpx;
      color: $text-primary;
      font-weight: 500;
    }
  }
}

// 支付信息
.payment-card {
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    
    &.deposit-row {
      padding-top: 24rpx;
      margin-top: 16rpx;
      border-top: 2rpx dashed $border-color;
    }
    
    .price-label {
      font-size: 28rpx;
      color: $text-secondary;
    }
    
    .price-value {
      font-size: 28rpx;
      color: $text-primary;
      
      &.original {
        text-decoration: line-through;
        color: $text-tertiary;
      }
      
      &.deposit {
        font-size: 44rpx;
        font-weight: bold;
        color: $primary-color;
      }
    }
  }
  
  .price-notice {
    display: flex;
    align-items: center;
    margin-top: 20rpx;
    padding: 16rpx;
    background: #f8f8f8;
    border-radius: 8rpx;
    
    .notice-icon {
      font-size: 24rpx;
      margin-right: 8rpx;
    }
    
    .notice-text {
      font-size: 24rpx;
      color: $text-tertiary;
    }
  }
}

// 支付方式
.pay-method-card {
  .pay-method {
    display: flex;
    align-items: center;
    
    .method-icon {
      width: 64rpx;
      height: 64rpx;
      background: #07c160;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      
      text {
        font-size: 36rpx;
      }
    }
    
    .method-info {
      flex: 1;
      
      .method-name {
        display: block;
        font-size: 30rpx;
        font-weight: 600;
        color: $text-primary;
      }
      
      .method-desc {
        display: block;
        font-size: 24rpx;
        color: $text-tertiary;
        margin-top: 4rpx;
      }
    }
    
    .method-check {
      .check-circle {
        width: 44rpx;
        height: 44rpx;
        border-radius: 50%;
        border: 2rpx solid $border-color;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.checked {
          background: $primary-color;
          border-color: $primary-color;
        }
        
        .check-icon {
          color: #ffffff;
          font-size: 24rpx;
        }
      }
    }
  }
}

// 底部占位
.bottom-placeholder {
  height: 160rpx;
}

// 底部支付栏
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: $card-bg;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .pay-info {
    .pay-label {
      display: block;
      font-size: 24rpx;
      color: $text-secondary;
    }
    
    .pay-amount {
      display: block;
      font-size: 44rpx;
      font-weight: bold;
      color: $primary-color;
    }
  }
  
  .pay-btn {
    width: 320rpx;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #1a9b8c, #2ab5a8);
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    
    &:disabled {
      background: #cccccc;
    }
    
    &:active {
      opacity: 0.9;
    }
  }
}
</style>
