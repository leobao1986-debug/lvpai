<template>
  <view class="floating-btn" @tap="handleTap">
    <text class="btn-text">立即\n预约</text>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user.js'

const emit = defineEmits(['click'])
const userStore = useUserStore()

const handleTap = () => {
  emit('click')
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '提示',
      content: '预约需要先登录，是否前往登录？',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          uni.switchTab({ url: '/pages/mine/index' })
        }
      }
    })
    return
  }
  
  uni.navigateTo({
    url: '/pages/booking/index'
  })
}
</script>

<style lang="scss" scoped>
.floating-btn {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #8b1a1a, #c41230);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 4rpx rgba(200, 164, 92, 0.6), 0 6rpx 20rpx rgba(139, 26, 26, 0.4);
  z-index: 999;
  animation: pulse 2s infinite;

  .btn-text {
    color: #fff;
    font-size: 24rpx;
    font-weight: bold;
    text-align: center;
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
