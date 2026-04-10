<template>
  <view class="page">
    <!-- 页面标题 -->
    <view class="header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="title">订单详情</text>
      <view class="placeholder"></view>
    </view>

    <scroll-view class="content" scroll-y v-if="order._id">
      <!-- 状态卡片 -->
      <view class="status-card">
        <text class="status-label">当前状态</text>
        <text
          class="status-value"
          :style="{ color: getStatusColor(order.status) }"
        >
          {{ getStatusLabel(order.status) }}
        </text>
      </view>

      <!-- 客户信息 -->
      <view class="section">
        <view class="section-title">客户信息</view>
        <view class="info-card">
          <view class="info-row">
            <text class="info-label">客户姓名</text>
            <text class="info-value">{{ order.customerName }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">联系电话</text>
            <view class="info-value-with-action">
              <text class="info-value">{{ order.phone }}</text>
              <text class="action-link" @click="makePhoneCall(order.phone)">拨打</text>
            </view>
          </view>
          <view class="info-row">
            <text class="info-label">拍摄人数</text>
            <text class="info-value">{{ order.peopleCount }} 人</text>
          </view>
        </view>
      </view>

      <!-- 预约信息 -->
      <view class="section">
        <view class="section-title">预约信息</view>
        <view class="info-card">
          <view class="info-row">
            <text class="info-label">套餐名称</text>
            <text class="info-value">{{ order.packageName }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">预约日期</text>
            <text class="info-value">{{ order.bookingDate }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">预约时段</text>
            <text class="info-value">{{ getTimeSlotLabel(order.timeSlot) }}</text>
          </view>
          <view class="info-row" v-if="order.remark">
            <text class="info-label">备注</text>
            <text class="info-value remark">{{ order.remark }}</text>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="section">
        <view class="section-title">订单信息</view>
        <view class="info-card">
          <view class="info-row">
            <text class="info-label">订单编号</text>
            <text class="info-value">{{ order.orderNo }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">订单总价</text>
            <text class="info-value price">¥{{ order.totalPrice }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">定金金额</text>
            <text class="info-value price">¥{{ order.deposit }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">支付状态</text>
            <text
              class="info-value"
              :style="{ color: getPayStatusColor(order.payStatus) }"
            >
              {{ getPayStatusLabel(order.payStatus) }}
            </text>
          </view>
          <view class="info-row" v-if="order.createTime">
            <text class="info-label">下单时间</text>
            <text class="info-value">{{ formatTime(order.createTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮区 -->
      <view class="action-section">
        <!-- 状态流转按钮 -->
        <button
          v-if="showConfirmBtn"
          class="action-btn primary"
          @click="updateStatus('confirmed')"
        >
          确认预约
        </button>
        <button
          v-if="showShootingBtn"
          class="action-btn primary"
          @click="updateStatus('shooting')"
        >
          开始拍摄
        </button>
        <button
          v-if="showRetouchingBtn"
          class="action-btn primary"
          @click="updateStatus('retouching')"
        >
          进入修片
        </button>
        <button
          v-if="showCompleteBtn"
          class="action-btn primary"
          @click="updateStatus('completed')"
        >
          完成订单
        </button>

        <!-- 退款按钮 -->
        <button
          v-if="showRefundBtn"
          class="action-btn warning"
          @click="handleRefund"
        >
          申请退款
        </button>

        <!-- 拨打电话 -->
        <button
          class="action-btn secondary"
          @click="makePhoneCall(order.phone)"
        >
          拨打客户电话
        </button>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { callFunction } from '../../utils/cloud'
import { ORDER_STATUS, PAY_STATUS, TIME_SLOTS } from '../../utils/constants'

const userStore = useUserStore()

const order = ref({})
const loading = ref(true)
const orderId = ref('')

// 计算属性：显示不同操作按钮
const showConfirmBtn = computed(() => order.value.status === 'pending')
const showShootingBtn = computed(() => order.value.status === 'confirmed')
const showRetouchingBtn = computed(() => order.value.status === 'shooting')
const showCompleteBtn = computed(() => order.value.status === 'retouching')
const showRefundBtn = computed(() =>
  order.value.payStatus === 'paid' &&
  !['completed', 'cancelled', 'refunded'].includes(order.value.status)
)

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

// 获取支付状态标签
const getPayStatusLabel = (status) => {
  return PAY_STATUS[status]?.label || status
}

// 获取支付状态颜色
const getPayStatusColor = (status) => {
  return PAY_STATUS[status]?.color || '#999999'
}

// 获取时段标签
const getTimeSlotLabel = (value) => {
  const slot = TIME_SLOTS.find(item => item.value === value)
  return slot ? slot.label : value
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取订单详情
const fetchOrderDetail = async () => {
  if (!orderId.value) return

  try {
    loading.value = true
    const res = await callFunction('booking', {
      action: 'detail',
      data: { id: orderId.value }
    })

    if (res.code === 0 && res.data) {
      order.value = res.data
    } else {
      uni.showToast({
        title: '订单不存在',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (err) {
    console.error('获取订单详情失败:', err)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 更新订单状态
const updateStatus = (newStatus) => {
  const statusMap = {
    confirmed: '确认预约',
    shooting: '开始拍摄',
    retouching: '进入修片',
    completed: '完成订单'
  }

  uni.showModal({
    title: '确认操作',
    content: `确定要${statusMap[newStatus]}吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' })
          const result = await callFunction('booking', {
            action: 'updateStatus',
            data: {
              id: orderId.value,
              status: newStatus
            }
          })

          if (result.code === 0) {
            uni.showToast({
              title: '操作成功',
              icon: 'success'
            })
            fetchOrderDetail()
          } else {
            uni.showToast({
              title: result.message || '操作失败',
              icon: 'none'
            })
          }
        } catch (err) {
          console.error('更新状态失败:', err)
          uni.showToast({
            title: '操作失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 处理退款
const handleRefund = () => {
  uni.showModal({
    title: '确认退款',
    content: '确定要为客户申请退款吗？此操作不可撤销。',
    confirmColor: '#c41230',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' })
          const result = await callFunction('payment', {
            action: 'refund',
            data: { orderId: orderId.value }
          })

          if (result.code === 0) {
            uni.showToast({
              title: '退款申请已提交',
              icon: 'success'
            })
            fetchOrderDetail()
          } else {
            uni.showToast({
              title: result.message || '退款失败',
              icon: 'none'
            })
          }
        } catch (err) {
          console.error('退款失败:', err)
          uni.showToast({
            title: '退款失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 拨打电话
const makePhoneCall = (phone) => {
  if (!phone) {
    uni.showToast({
      title: '电话号码为空',
      icon: 'none'
    })
    return
  }
  uni.makePhoneCall({
    phoneNumber: phone
  })
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  orderId.value = currentPage.$route?.query?.id || currentPage.options?.id

  if (checkAdmin()) {
    fetchOrderDetail()
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #eeeeee;

  .back-btn {
    font-size: 48rpx;
    color: $text-primary;
    padding: 0 20rpx;
  }

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-primary;
  }

  .placeholder {
    width: 60rpx;
  }
}

// 内容区
.content {
  flex: 1;
  padding: 30rpx;
}

// 状态卡片
.status-card {
  background: $card-bg;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  .status-label {
    font-size: 26rpx;
    color: $text-secondary;
    margin-bottom: 16rpx;
  }

  .status-value {
    font-size: 48rpx;
    font-weight: bold;
  }
}

// 分区
.section {
  margin-bottom: 30rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: 20rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid $primary-color;
  }
}

// 信息卡片
.info-card {
  background: $card-bg;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 28rpx;
      color: $text-secondary;
      flex-shrink: 0;
      margin-right: 30rpx;
    }

    .info-value {
      font-size: 28rpx;
      color: $text-primary;
      text-align: right;
      flex: 1;

      &.price {
        color: $primary-color;
        font-weight: bold;
      }

      &.remark {
        line-height: 1.6;
      }
    }

    .info-value-with-action {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .action-link {
        font-size: 26rpx;
        color: $primary-color;
        padding: 6rpx 16rpx;
        background: #fff0f0;
        border-radius: 8rpx;
      }
    }
  }
}

// 操作按钮区
.action-section {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  .action-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 45rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;

    &.primary {
      background: $primary-color;
      color: #ffffff;
    }

    &.secondary {
      background: #f5f5f5;
      color: $text-primary;
    }

    &.warning {
      background: #ff976a;
      color: #ffffff;
    }

    &:active {
      opacity: 0.9;
    }
  }
}

// 底部留白
.bottom-space {
  height: 60rpx;
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
