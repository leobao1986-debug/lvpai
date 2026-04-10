<template>
  <view class="page">
    <!-- 地图区域 -->
    <view class="map-section">
      <map
        class="store-map"
        :latitude="latitude"
        :longitude="longitude"
        :markers="markers"
        :scale="15"
        show-location
      />
    </view>

    <!-- 店铺信息卡片 -->
    <view class="store-card">
      <view class="store-header">
        <text class="store-name">{{ storeInfo.name }}</text>
        <view class="official-badge">
          <text class="badge-text">景区官方合作指定拍摄点</text>
        </view>
      </view>
      
      <view class="store-info">
        <view class="info-item">
          <text class="info-icon">📍</text>
          <text class="info-text">{{ storeInfo.address }}</text>
        </view>
        <view class="info-item">
          <text class="info-icon">🕐</text>
          <view class="business-hours">
            <text class="hours-text">{{ storeInfo.businessHours.peak }}</text>
            <text class="hours-text">{{ storeInfo.businessHours.offPeak }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn primary" @click="openNavigation">
          <text class="btn-icon">🧭</text>
          <text class="btn-text">一键导航</text>
        </view>
        <view class="action-btn secondary" @click="makePhoneCall">
          <text class="btn-icon">📞</text>
          <text class="btn-text">拨打电话</text>
        </view>
      </view>
    </view>

    <!-- 底部预约引导 -->
    <view class="booking-guide">
      <view class="guide-content">
        <text class="guide-title">🎁 到店免费试穿蒙古袍</text>
        <text class="guide-desc">提前预约，享受专属服务</text>
      </view>
      <view class="guide-btn" @click="goToBooking">
        <text class="guide-btn-text">立即预约</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { STORE_INFO } from '../../utils/constants'

const storeInfo = STORE_INFO
const latitude = ref(39.5883)
const longitude = ref(109.8023)

const markers = ref([
  {
    id: 1,
    latitude: 39.5883,
    longitude: 109.8023,
    title: '朵兰摄影·静安雨霞',
    iconPath: '/static/tabbar/home.png',
    width: 30,
    height: 30
  }
])

// 一键导航
const openNavigation = () => {
  uni.openLocation({
    latitude: latitude.value,
    longitude: longitude.value,
    name: storeInfo.name,
    address: storeInfo.address,
    success: () => {
      console.log('打开导航成功')
    },
    fail: (err) => {
      console.error('打开导航失败:', err)
      uni.showToast({
        title: '导航打开失败',
        icon: 'none'
      })
    }
  })
}

// 拨打电话
const makePhoneCall = () => {
  if (!storeInfo.phone) {
    uni.showToast({
      title: '暂无联系电话',
      icon: 'none'
    })
    return
  }
  uni.makePhoneCall({
    phoneNumber: storeInfo.phone,
    success: () => {
      console.log('拨打电话成功')
    },
    fail: (err) => {
      console.error('拨打电话失败:', err)
    }
  })
}

// 跳转到预约页
const goToBooking = () => {
  uni.switchTab({
    url: '/pages/booking/index'
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f0e6;
  // 淡雅的蒙古纹样背景
  background-image: 
    radial-gradient(circle at 20% 80%, rgba($mongol-gold, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba($mongol-blue, 0.03) 0%, transparent 50%);
}

// 地图区域
.map-section {
  width: 100%;
  height: 500rpx;
  position: relative;
  
  // 地图底部装饰线
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(90deg, transparent 5%, $mongol-gold 30%, $mongol-gold-light 50%, $mongol-gold 70%, transparent 95%);
    z-index: 2;
  }
  
  .store-map {
    width: 100%;
    height: 100%;
  }
}

// 店铺信息卡片
.store-card {
  margin: -40rpx 30rpx 30rpx;
  padding: 40rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

.store-header {
  margin-bottom: 30rpx;
  
  .store-name {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 16rpx;
  }
  
  .official-badge {
    display: inline-flex;
    padding: 8rpx 20rpx;
    background: linear-gradient(135deg, #c8a45c 0%, #d4b06a 100%);
    border-radius: 8rpx;
    
    .badge-text {
      font-size: 22rpx;
      color: #ffffff;
      font-weight: 500;
    }
  }
}

.store-info {
  margin-bottom: 30rpx;
  
  .info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .info-icon {
      font-size: 32rpx;
      margin-right: 16rpx;
      flex-shrink: 0;
    }
    
    .info-text {
      flex: 1;
      font-size: 28rpx;
      color: #666666;
      line-height: 1.6;
    }
    
    .business-hours {
      display: flex;
      flex-direction: column;
      
      .hours-text {
        font-size: 28rpx;
        color: #666666;
        line-height: 1.6;
        
        &:first-child {
          margin-bottom: 8rpx;
        }
      }
    }
  }
}

// 操作按钮
.action-buttons {
  display: flex;
  gap: 24rpx;
  
  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx 0;
    border-radius: 12rpx;
    
    .btn-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }
    
    .btn-text {
      font-size: 28rpx;
      font-weight: 500;
    }
    
    &.primary {
      background: linear-gradient(135deg, #8b1a1a 0%, #c41230 100%);
      box-shadow: 0 0 0 2rpx rgba(200, 164, 92, 0.3), 0 4rpx 16rpx rgba(196, 18, 48, 0.3);
      
      .btn-text {
        color: #ffffff;
      }
    }
    
    &.secondary {
      background: #f5f5f5;
      
      .btn-text {
        color: #333333;
      }
    }
    
    &:active {
      opacity: 0.9;
    }
  }
}

// 底部预约引导
.booking-guide {
  margin: 0 30rpx 40rpx;
  padding: 30rpx;
  background: rgba(200, 164, 92, 0.08);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2rpx solid rgba(200, 164, 92, 0.3);
  
  .guide-content {
    .guide-title {
      display: block;
      font-size: 30rpx;
      font-weight: 600;
      color: #8b1a1a;
      margin-bottom: 8rpx;
    }
    
    .guide-desc {
      font-size: 24rpx;
      color: #999999;
    }
  }
  
  .guide-btn {
    padding: 16rpx 32rpx;
    background: #c41230;
    border-radius: 30rpx;
    
    .guide-btn-text {
      font-size: 26rpx;
      color: #ffffff;
      font-weight: 500;
    }
    
    &:active {
      opacity: 0.9;
    }
  }
}
</style>
