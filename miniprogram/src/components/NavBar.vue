<template>
  <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-content" :style="{ height: navBarHeight + 'px' }">
      <!-- 蒙古元素装饰 - 白云 -->
      <view class="nav-cloud cloud-1"></view>
      <view class="nav-cloud cloud-2"></view>
      <!-- 左侧返回按钮 -->
      <view class="navbar-left" v-if="showBack" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <!-- 标题 -->
      <view class="navbar-title">
        <text>{{ title }}</text>
      </view>
      <!-- 右侧插槽 -->
      <view class="navbar-right">
        <slot name="right" />
      </view>
    </view>
    <!-- 金色装饰线 -->
    <view class="nav-gold-line"></view>
  </view>
  <!-- 占位 -->
  <view :style="{ height: (statusBarHeight + navBarHeight + 4) + 'px' }" />
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: false }
})

const statusBarHeight = ref(0)
const navBarHeight = ref(44)

// 获取状态栏高度
const systemInfo = uni.getSystemInfoSync()
statusBarHeight.value = systemInfo.statusBarHeight || 0

const goBack = () => {
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #ffffff 0%, #faf8f4 100%);
  z-index: 100;
  overflow: hidden;

  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0 30rpx;
  }

  // 白云装饰
  .nav-cloud {
    position: absolute;
    background: rgba(200, 164, 92, 0.08);
    border-radius: 50rpx;
    z-index: 0;
    
    &::before, &::after {
      content: '';
      position: absolute;
      background: rgba(200, 164, 92, 0.08);
      border-radius: 50%;
    }
    
    &.cloud-1 {
      width: 50rpx;
      height: 18rpx;
      top: 10rpx;
      left: 60rpx;
      
      &::before {
        width: 24rpx;
        height: 24rpx;
        top: -12rpx;
        left: 8rpx;
      }
      
      &::after {
        width: 16rpx;
        height: 16rpx;
        top: -8rpx;
        right: 8rpx;
      }
    }
    
    &.cloud-2 {
      width: 40rpx;
      height: 14rpx;
      top: 16rpx;
      right: 80rpx;
      
      &::before {
        width: 20rpx;
        height: 20rpx;
        top: -10rpx;
        left: 6rpx;
      }
      
      &::after {
        width: 14rpx;
        height: 14rpx;
        top: -7rpx;
        right: 6rpx;
      }
    }
  }

  .navbar-left {
    position: absolute;
    left: 30rpx;
    z-index: 1;
    
    .back-icon {
      font-size: 48rpx;
      color: $mongol-red;
      font-weight: 300;
    }
  }

  .navbar-title {
    position: relative;
    z-index: 1;
    
    text {
      font-size: 34rpx;
      font-weight: 700;
      color: $mongol-red;
      letter-spacing: 4rpx;
      position: relative;
      padding-left: 28rpx;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 16rpx;
        height: 16rpx;
        border: 3rpx solid $mongol-gold;
        border-radius: 50%;
      }
      
      &::after {
        content: '';
        position: absolute;
        left: 4rpx;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 8rpx;
        background: $mongol-gold;
        border-radius: 50%;
      }
    }
  }

  .navbar-right {
    position: absolute;
    right: 30rpx;
    z-index: 1;
  }
  
  // 金色装饰线
  .nav-gold-line {
    height: 4rpx;
    background: linear-gradient(90deg, transparent 5%, $mongol-gold 30%, $mongol-gold-light 50%, $mongol-gold 70%, transparent 95%);
  }
}
</style>
