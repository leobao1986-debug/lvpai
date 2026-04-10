<template>
  <view class="page">
    <!-- 状态栏 -->
    <view class="status-bar" :style="{ background: statusInfo.color }">
      <text class="status-icon">{{ statusInfo.icon }}</text>
      <text class="status-text">{{ statusInfo.label }}</text>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y>
      <!-- 订单信息 -->
      <view v-if="detailType === 'order'" class="info-card">
        <view class="card-title">订单信息</view>
        <view class="info-row">
          <text class="label">订单编号</text>
          <text class="value">{{ detail.orderNo }}</text>
        </view>
        <view class="info-row">
          <text class="label">创建时间</text>
          <text class="value">{{ formatTime(detail.createTime) }}</text>
        </view>
        <view class="info-row">
          <text class="label">支付状态</text>
          <text class="value" :style="{ color: statusInfo.color }">{{ statusInfo.label }}</text>
        </view>
      </view>

      <!-- 预约信息 -->
      <view v-if="detailType === 'booking'" class="info-card">
        <view class="card-title">预约信息</view>
        <view class="info-row">
          <text class="label">预约状态</text>
          <text class="value" :style="{ color: statusInfo.color }">{{ statusInfo.label }}</text>
        </view>
        <view class="info-row">
          <text class="label">预约日期</text>
          <text class="value">{{ detail.date }}</text>
        </view>
        <view class="info-row">
          <text class="label">预约时段</text>
          <text class="value">{{ getTimeSlotLabel(detail.timeSlot) }}</text>
        </view>
        <view class="info-row">
          <text class="label">预约人数</text>
          <text class="value">{{ detail.persons }}人</text>
        </view>
      </view>

      <!-- 套餐信息 -->
      <view class="info-card">
        <view class="card-title">套餐信息</view>
        <view class="package-box">
          <image 
            v-if="detail.packageCover" 
            class="package-cover" 
            :src="detail.packageCover" 
            mode="aspectFill"
          />
          <view class="package-info">
            <text class="package-name">{{ detail.packageName }}</text>
            <text class="package-price">¥{{ detail.packagePrice || detail.depositAmount }}</text>
          </view>
        </view>
      </view>

      <!-- 联系人信息 -->
      <view v-if="detail.contactName" class="info-card">
        <view class="card-title">联系人信息</view>
        <view class="info-row">
          <text class="label">联系人</text>
          <text class="value">{{ detail.contactName }}</text>
        </view>
        <view class="info-row">
          <text class="label">联系电话</text>
          <text class="value">{{ detail.contactPhone }}</text>
        </view>
      </view>

      <!-- 支付信息 -->
      <view v-if="detailType === 'order' && detail.payStatus !== 'unpaid'" class="info-card">
        <view class="card-title">支付信息</view>
        <view class="info-row">
          <text class="label">定金金额</text>
          <text class="value price">¥{{ detail.depositAmount }}</text>
        </view>
        <view v-if="detail.payTime" class="info-row">
          <text class="label">支付时间</text>
          <text class="value">{{ formatTime(detail.payTime) }}</text>
        </view>
        <view v-if="detail.transactionId" class="info-row">
          <text class="label">交易单号</text>
          <text class="value">{{ detail.transactionId }}</text>
        </view>
      </view>

      <!-- 备注 -->
      <view v-if="detail.remark" class="info-card">
        <view class="card-title">备注</view>
        <view class="remark-text">{{ detail.remark }}</view>
      </view>

      <!-- 底部占位 -->
      <view class="footer-placeholder"></view>
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view class="footer-actions">
      <template v-if="detailType === 'order'">
        <template v-if="detail.payStatus === 'unpaid'">
          <view class="btn secondary" @click="cancelOrder">取消订单</view>
          <view class="btn primary" @click="goToPay">去支付</view>
        </template>
        <template v-if="detail.payStatus === 'paid'">
          <button class="btn secondary contact-btn" open-type="contact">联系客服</button>
          <view class="btn primary" @click="goToBooking">再次预约</view>
        </template>
        <template v-if="detail.payStatus === 'refunded' || detail.status === 'cancelled'">
          <view class="btn primary" @click="goToBooking">重新预约</view>
        </template>
        <template v-if="detail.status === 'completed'">
          <view class="btn primary" @click="goToBooking">再次预约</view>
        </template>
      </template>

      <template v-if="detailType === 'booking'">
        <template v-if="detail.status === 'pending'">
          <view class="btn secondary" @click="cancelBooking">取消预约</view>
          <view class="btn primary" @click="contactService">联系客服</view>
        </template>
        <template v-if="detail.status === 'confirmed'">
          <button class="btn secondary contact-btn" open-type="contact">联系客服</button>
          <view class="btn primary" @click="goToStore">查看门店</view>
        </template>
        <template v-if="detail.status === 'completed'">
          <view class="btn primary" @click="goToBooking">再次预约</view>
        </template>
        <template v-if="detail.status === 'cancelled'">
          <view class="btn primary" @click="goToBooking">重新预约</view>
        </template>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { callFunction } from '../../utils/cloud'
import { ORDER_STATUS, BOOKING_STATUS, PAY_STATUS, getTimeSlotLabel } from '../../utils/constants'

// 页面参数
const detailType = ref('') // order / booking
const detailId = ref('')
const detail = ref({})
const loading = ref(false)

// 状态信息
const statusInfo = computed(() => {
  if (detailType.value === 'order') {
    const status = detail.value.payStatus || 'unpaid'
    return PAY_STATUS[status] || { label: status, color: '#999999', icon: '📋' }
  } else {
    const status = detail.value.status || 'pending'
    const info = BOOKING_STATUS[status] || { label: status, color: '#999999' }
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      completed: '✨',
      cancelled: '❌'
    }
    return { ...info, icon: icons[status] || '📋' }
  }
})

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取详情
const fetchDetail = async () => {
  loading.value = true
  try {
    let res
    if (detailType.value === 'order') {
      res = await callFunction('payment', {
        action: 'getOrder',
        data: { orderId: detailId.value }
      })
    } else {
      res = await callFunction('booking', {
        action: 'detail',
        data: { id: detailId.value }
      })
    }
    if (res && res.data) {
      detail.value = res.data
    }
  } catch (err) {
    console.error('获取详情失败:', err)
    uni.showToast({ title: '获取详情失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 取消订单
const cancelOrder = () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: (res) => {
      if (res.confirm) {
        // 调用取消订单接口
        uni.showToast({ title: '已取消', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

// 取消预约
const cancelBooking = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该预约吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await callFunction('booking', {
            action: 'cancel',
            data: { id: detailId.value }
          })
          // 更新本地状态
          detail.value.status = 'cancelled'
          uni.showToast({ title: '取消成功', icon: 'success' })
        } catch (err) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}

// 去支付
const goToPay = () => {
  uni.navigateTo({
    url: `/pages/payment/index?orderId=${detailId.value}`
  })
}

// 去预约
const goToBooking = () => {
  uni.switchTab({
    url: '/pages/booking/index'
  })
}

// 联系客服
const contactService = () => {
  // 通过 button open-type="contact" 处理
}

// 查看门店
const goToStore = () => {
  uni.switchTab({
    url: '/pages/store/index'
  })
}

// 页面加载
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const { id, type } = currentPage.$page?.options || currentPage.options || {}
  detailId.value = id
  detailType.value = type || 'order'
  fetchDetail()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

// 状态栏
.status-bar {
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  
  .status-icon {
    font-size: 48rpx;
    margin-right: 20rpx;
  }
  
  .status-text {
    font-size: 40rpx;
    font-weight: 600;
    color: #ffffff;
  }
}

// 内容区域
.content {
  flex: 1;
  height: 0;
}

// 信息卡片
.info-card {
  margin: 20rpx 30rpx;
  padding: 30rpx;
  background: #ffffff;
  border-radius: 16rpx;
  
  .card-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      font-size: 28rpx;
      color: #999999;
    }
    
    .value {
      font-size: 28rpx;
      color: #333333;
      
      &.price {
        color: #1a9b8c;
        font-weight: 600;
        font-size: 32rpx;
      }
    }
  }
  
  .package-box {
    display: flex;
    align-items: center;
    
    .package-cover {
      width: 140rpx;
      height: 140rpx;
      border-radius: 12rpx;
      margin-right: 24rpx;
      background: #f5f5f5;
    }
    
    .package-info {
      flex: 1;
      
      .package-name {
        display: block;
        font-size: 30rpx;
        color: #333333;
        font-weight: 500;
        margin-bottom: 12rpx;
      }
      
      .package-price {
        font-size: 32rpx;
        color: #1a9b8c;
        font-weight: 600;
      }
    }
  }
  
  .remark-text {
    font-size: 28rpx;
    color: #666666;
    line-height: 1.6;
  }
}

// 底部占位
.footer-placeholder {
  height: 140rpx;
}

// 底部操作按钮
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .btn {
    padding: 20rpx 40rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    text-align: center;
    min-width: 160rpx;
    
    &.primary {
      background: #1a9b8c;
      color: #ffffff;
    }
    
    &.secondary {
      background: #f5f5f5;
      color: #666666;
    }
    
    &.contact-btn {
      margin: 0;
      line-height: inherit;
      border: none;
      
      &::after {
        display: none;
      }
    }
    
    &:active {
      opacity: 0.8;
    }
  }
}
</style>
