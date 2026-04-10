<template>
  <view class="page">
    <!-- 顶部轮播图 -->
    <view class="swiper-section">
      <swiper
        class="image-swiper"
        :indicator-dots="true"
        :autoplay="false"
        :duration="300"
        :circular="true"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#c41230"
        @change="onSwiperChange"
      >
        <swiper-item
          v-for="(image, index) in packageDetail.images || defaultImages"
          :key="index"
        >
          <view class="swiper-image-wrapper">
            <image
              class="swiper-image"
              :src="image"
              mode="aspectFill"
              @tap="previewImage(index)"
            />
          </view>
        </swiper-item>
      </swiper>
      <view class="image-counter" v-if="(packageDetail.images || defaultImages).length > 1">
        <text class="counter-text">{{ currentSwiperIndex + 1 }} / {{ (packageDetail.images || defaultImages).length }}</text>
      </view>
    </view>

    <!-- 套餐信息区 -->
    <view class="info-section">
      <view class="package-header">
        <text class="package-name">{{ packageDetail.name || '套餐名称' }}</text>
        <view class="package-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ packageDetail.price || 0 }}</text>
          <text class="price-unit">起</text>
        </view>
      </view>

      <view class="deposit-info">
        <text class="deposit-text">仅需支付 ¥{{ packageDetail.deposit || 0 }} 定金即可预约</text>
      </view>

      <!-- 标签 -->
      <view class="tags-wrapper" v-if="packageDetail.tags && packageDetail.tags.length > 0">
        <view class="tag-item" v-for="(tag, index) in packageDetail.tags" :key="index">
          <text class="tag-icon">✓</text>
          <text class="tag-text">{{ tag }}</text>
        </view>
      </view>
    </view>

    <!-- 套餐内容详情 -->
    <view class="content-section">
      <view class="section-title">
        <view class="title-line"></view>
        <text class="title-text">套餐详情</text>
        <view class="title-line"></view>
      </view>

      <view class="detail-grid">
        <view class="detail-item">
          <text class="detail-label">拍摄时长</text>
          <text class="detail-value">{{ packageDetail.duration || '-' }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">服装套数</text>
          <text class="detail-value">{{ packageDetail.costumeCount || '-' }}套</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">精修张数</text>
          <text class="detail-value">{{ packageDetail.retouchCount || '-' }}张</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">底片数量</text>
          <text class="detail-value">{{ packageDetail.rawCount || '全部赠送' }}</text>
        </view>
      </view>

      <!-- 包含服务 -->
      <view class="features-section" v-if="packageDetail.features && packageDetail.features.length > 0">
        <text class="features-title">包含服务</text>
        <view class="features-list">
          <view class="feature-item" v-for="(feature, index) in packageDetail.features" :key="index">
            <text class="feature-icon">★</text>
            <text class="feature-text">{{ feature }}</text>
          </view>
        </view>
      </view>

      <!-- 详细描述 -->
      <view class="description-section" v-if="packageDetail.description">
        <text class="description-title">套餐介绍</text>
        <text class="description-content">{{ packageDetail.description }}</text>
      </view>

      <!-- 拍摄场景 -->
      <view class="scenes-section" v-if="packageDetail.scenes && packageDetail.scenes.length > 0">
        <text class="scenes-title">拍摄场景</text>
        <view class="scenes-list">
          <view class="scene-item" v-for="(scene, index) in packageDetail.scenes" :key="index">
            <view class="scene-image-wrapper">
              <view class="scene-image-placeholder" :style="{ background: getGradient(index) }">
                <text class="scene-name">{{ scene.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-left">
        <button class="action-btn contact-btn" open-type="contact">
          <text class="btn-icon">💬</text>
          <text class="btn-text">客服</text>
        </button>
      </view>
      <view class="action-right">
        <view class="book-btn" @tap="goToBooking">
          <text class="book-btn-text">立即预约</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { callFunction } from '@/utils/cloud.js'
import { useUserStore } from '@/store/user.js'

// 响应式数据
const packageId = ref('')
const packageDetail = ref({})
const currentSwiperIndex = ref(0)
const loading = ref(false)

// 默认图片（渐变色占位）
const defaultImages = [
  'https://placehold.co/750x500/c41230/ffffff?text=套餐图片1',
  'https://placehold.co/750x500/e8546a/ffffff?text=套餐图片2',
  'https://placehold.co/750x500/f5a5b0/ffffff?text=套餐图片3'
]

// 渐变色数组
const gradients = [
  'linear-gradient(135deg, #c41230, #e8546a)',
  'linear-gradient(135deg, #e8546a, #f5a5b0)',
  'linear-gradient(135deg, #f5a5b0, #ffdde1)',
  'linear-gradient(135deg, #c41230, #8b0d24)'
]

// 获取渐变色
const getGradient = (index) => {
  return gradients[index % gradients.length]
}

// 轮播图切换
const onSwiperChange = (e) => {
  currentSwiperIndex.value = e.detail.current
}

// 预览图片
const previewImage = (index) => {
  const images = packageDetail.value.images || defaultImages
  uni.previewImage({
    current: images[index],
    urls: images
  })
}

// 跳转到预约页
const goToBooking = () => {
  const userStore = useUserStore()
  
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
    url: `/pages/booking/index?packageId=${packageId.value}`
  })
}

// 获取套餐详情
const fetchPackageDetail = async () => {
  if (!packageId.value) return
  
  loading.value = true
  uni.showLoading({ title: '加载中' })
  
  try {
    const res = await callFunction('package', {
      action: 'detail',
      id: packageId.value
    })
    
    if (res.code === 0) {
      packageDetail.value = res.data || {}
      // 设置页面标题
      uni.setNavigationBarTitle({
        title: packageDetail.value.name || '套餐详情'
      })
    } else {
      uni.showToast({
        title: res.message || '获取失败',
        icon: 'none'
      })
    }
  } catch (err) {
    console.error('获取套餐详情失败:', err)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

// 页面加载
onLoad((options) => {
  packageId.value = options.id || ''
  if (packageId.value) {
    fetchPackageDetail()
  } else {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
  }
})
</script>

<style lang="scss" scoped>
$page-bg: #f5f0e6;
$brand-color: #c41230;
$brand-light: #e8546a;
$text-primary: #333;
$text-secondary: #666;
$text-muted: #999;

.page {
  min-height: 100vh;
  background: $page-bg;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

// 轮播图区域
.swiper-section {
  position: relative;

  .image-swiper {
    height: 500rpx;

    .swiper-image-wrapper {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f5f5f5, #e8e8e8);

      .swiper-image {
        width: 100%;
        height: 100%;
      }
    }
  }

  .image-counter {
    position: absolute;
    right: 24rpx;
    bottom: 24rpx;
    background: rgba(0, 0, 0, 0.5);
    padding: 8rpx 20rpx;
    border-radius: 999rpx;

    .counter-text {
      color: #fff;
      font-size: 24rpx;
    }
  }
}

// 套餐信息区
.info-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .package-header {
    margin-bottom: 16rpx;

    .package-name {
      display: block;
      font-size: 36rpx;
      font-weight: 700;
      color: $text-primary;
      margin-bottom: 16rpx;
      line-height: 1.4;
    }

    .package-price {
      display: flex;
      align-items: baseline;

      .price-symbol {
        font-size: 28rpx;
        color: $brand-color;
        font-weight: 600;
      }

      .price-value {
        font-size: 56rpx;
        font-weight: 700;
        color: $brand-color;
        margin: 0 4rpx;
      }

      .price-unit {
        font-size: 26rpx;
        color: $text-muted;
      }
    }
  }

  .deposit-info {
    background: linear-gradient(135deg, rgba(200, 164, 92, 0.1), rgba(200, 164, 92, 0.05));
    padding: 16rpx 24rpx;
    border-radius: 12rpx;
    margin-bottom: 24rpx;

    .deposit-text {
      font-size: 26rpx;
      color: $brand-color;
    }
  }

  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .tag-item {
      display: flex;
      align-items: center;
      background: #f8f8f8;
      padding: 10rpx 20rpx;
      border-radius: 8rpx;

      .tag-icon {
        font-size: 22rpx;
        color: $brand-color;
        margin-right: 8rpx;
      }

      .tag-text {
        font-size: 24rpx;
        color: $text-secondary;
      }
    }
  }
}

// 内容详情区
.content-section {
  background: #fff;
  padding: 30rpx;

  .section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;

    .title-line {
      flex: 1;
      height: 1rpx;
      background: linear-gradient(90deg, transparent, #ddd, transparent);
      max-width: 100rpx;
    }

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: $text-primary;
      margin: 0 20rpx;
    }
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    margin-bottom: 40rpx;

    .detail-item {
      background: #f5f0e6;
      padding: 24rpx;
      border-radius: 12rpx;

      .detail-label {
        display: block;
        font-size: 24rpx;
        color: $text-muted;
        margin-bottom: 8rpx;
      }

      .detail-value {
        font-size: 30rpx;
        font-weight: 600;
        color: $text-primary;
      }
    }
  }

  .features-section {
    margin-bottom: 40rpx;

    .features-title {
      display: block;
      font-size: 30rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 20rpx;
    }

    .features-list {
      .feature-item {
        display: flex;
        align-items: center;
        padding: 16rpx 0;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .feature-icon {
          font-size: 24rpx;
          color: #c8a45c;
          margin-right: 16rpx;
        }

        .feature-text {
          font-size: 28rpx;
          color: $text-secondary;
        }
      }
    }
  }

  .description-section {
    margin-bottom: 40rpx;

    .description-title {
      display: block;
      font-size: 30rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 20rpx;
    }

    .description-content {
      display: block;
      font-size: 28rpx;
      color: $text-secondary;
      line-height: 1.8;
    }
  }

  .scenes-section {
    .scenes-title {
      display: block;
      font-size: 30rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 20rpx;
    }

    .scenes-list {
      .scene-item {
        margin-bottom: 20rpx;

        .scene-image-wrapper {
          border-radius: 16rpx;
          overflow: hidden;

          .scene-image-placeholder {
            width: 100%;
            height: 300rpx;
            display: flex;
            align-items: center;
            justify-content: center;

            .scene-name {
              font-size: 32rpx;
              font-weight: 600;
              color: #fff;
              text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
            }
          }
        }
      }
    }
  }
}

// 底部占位
.bottom-placeholder {
  height: 140rpx;
}

// 底部操作栏
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;

  .action-left {
    display: flex;
    align-items: center;
    flex: 1;

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 30rpx;
      background: transparent;
      border: none;

      &::after {
        border: none;
      }

      .btn-icon {
        font-size: 40rpx;
        margin-bottom: 4rpx;

        &.active {
          color: $brand-color;
        }
      }

      .btn-text {
        font-size: 22rpx;
        color: $text-secondary;
      }
    }

    .contact-btn {
      padding-left: 0;
    }
  }

  .action-right {
    .book-btn {
      background: linear-gradient(135deg, #8b1a1a, #c41230);
      padding: 24rpx 60rpx;
      border-radius: 999rpx;
      box-shadow: 0 0 0 2rpx rgba(200, 164, 92, 0.3), 0 4rpx 16rpx rgba(196, 18, 48, 0.3);

      .book-btn-text {
        font-size: 32rpx;
        font-weight: 600;
        color: #fff;
      }
    }
  }
}
</style>
