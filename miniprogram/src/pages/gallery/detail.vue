<template>
  <view class="gallery-detail-page">
    <!-- 大图轮播 -->
    <view class="swiper-section">
      <swiper 
        class="image-swiper" 
        :indicator-dots="true" 
        :autoplay="false" 
        :duration="300"
        indicator-color="rgba(255,255,255,0.4)" 
        indicator-active-color="#c41230"
        @tap="handlePreview(currentImageIndex)"
      >
        <swiper-item v-for="(image, index) in galleryImages" :key="index">
          <image 
            class="swiper-image" 
            :src="image" 
            mode="aspectFill"
            @load="onImageLoad"
          />
        </swiper-item>
      </swiper>
      <view class="image-counter" v-if="galleryImages.length > 1">
        {{ currentImageIndex + 1 }} / {{ galleryImages.length }}
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-section">
      <!-- 标题和分类 -->
      <view class="header-section">
        <text class="gallery-title">{{ galleryInfo.title || '客片欣赏' }}</text>
        <view class="category-tag" v-if="galleryInfo.category">
          <text>{{ getCategoryLabel(galleryInfo.category) }}</text>
        </view>
      </view>

      <!-- 朋友圈文案 -->
      <view class="copy-section" v-if="galleryInfo.copyText">
        <view class="section-title">
          <text class="title-icon">✨</text>
          <text>朋友圈文案</text>
        </view>
        <view class="copy-card">
          <text class="copy-text">{{ galleryInfo.copyText }}</text>
          <view class="copy-btn" @tap="handleCopy">
            <text class="btn-icon">📋</text>
            <text class="btn-text">复制文案</text>
          </view>
        </view>
      </view>

      <!-- 拍摄信息 -->
      <view class="info-section" v-if="galleryInfo.shootingInfo">
        <view class="section-title">
          <text class="title-icon">📷</text>
          <text>拍摄信息</text>
        </view>
        <view class="info-card">
          <view class="info-item" v-if="galleryInfo.shootingInfo.location">
            <text class="info-label">拍摄地点</text>
            <text class="info-value">{{ galleryInfo.shootingInfo.location }}</text>
          </view>
          <view class="info-item" v-if="galleryInfo.shootingInfo.package">
            <text class="info-label">拍摄套餐</text>
            <text class="info-value">{{ galleryInfo.shootingInfo.package }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-btn preview" @tap="handlePreview(0)">
        <text class="btn-icon">🔍</text>
        <text class="btn-text">预览大图</text>
      </view>
      <view class="action-btn copy" @tap="handleCopy" v-if="galleryInfo.copyText">
        <text class="btn-icon">📋</text>
        <text class="btn-text">复制文案</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { callFunction } from '@/utils/cloud.js'
import { GALLERY_CATEGORIES } from '@/utils/constants.js'

// 页面参数
const galleryId = ref('')
const galleryInfo = ref({})
const currentImageIndex = ref(0)
const loading = ref(false)

// 图片列表
const galleryImages = computed(() => {
  if (galleryInfo.value.images && galleryInfo.value.images.length > 0) {
    return galleryInfo.value.images
  }
  if (galleryInfo.value.coverImage) {
    return [galleryInfo.value.coverImage]
  }
  return []
})

// 获取分类标签
const getCategoryLabel = (value) => {
  const category = GALLERY_CATEGORIES.find(c => c.value === value)
  return category ? category.label : value
}

// 获取客片详情
const fetchGalleryDetail = async () => {
  if (!galleryId.value) return
  
  loading.value = true
  try {
    const res = await callFunction('gallery', {
      action: 'detail',
      data: { id: galleryId.value }
    })
    
    if (res.code === 0 && res.data) {
      galleryInfo.value = res.data
    } else {
      uni.showToast({ title: '获取详情失败', icon: 'none' })
    }
  } catch (err) {
    console.error('获取客片详情失败:', err)
    uni.showToast({ title: '获取详情失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 预览大图
const handlePreview = (index) => {
  if (galleryImages.value.length === 0) return
  
  uni.previewImage({
    urls: galleryImages.value,
    current: galleryImages.value[index],
    success: () => {
      console.log('预览成功')
    }
  })
}

// 复制文案
const handleCopy = () => {
  if (!galleryInfo.value.copyText) return
  
  uni.setClipboardData({
    data: galleryInfo.value.copyText,
    success: () => {
      uni.showToast({
        title: '文案已复制，快去发朋友圈吧~',
        icon: 'none',
        duration: 2000
      })
    },
    fail: () => {
      uni.showToast({ title: '复制失败', icon: 'none' })
    }
  })
}

// 图片加载完成
const onImageLoad = (e) => {
  // 可以在这里处理图片加载完成后的逻辑
}

// 页面加载
onLoad((options) => {
  if (options.id) {
    galleryId.value = options.id
    fetchGalleryDetail()
  } else {
    uni.showToast({ title: '客片ID不能为空', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<style lang="scss" scoped>
$brand-color: #c41230;
$text-primary: #333;
$text-secondary: #666;
$text-muted: #999;
$bg-color: #f5f5f5;

.gallery-detail-page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

// 轮播区域
.swiper-section {
  position: relative;
  width: 100%;
  height: 600rpx;
  background: #000;

  .image-swiper {
    width: 100%;
    height: 100%;

    .swiper-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .image-counter {
    position: absolute;
    right: 30rpx;
    bottom: 30rpx;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 24rpx;
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }
}

// 内容区域
.content-section {
  padding: 30rpx;

  .header-section {
    margin-bottom: 30rpx;

    .gallery-title {
      display: block;
      font-size: 36rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 16rpx;
    }

    .category-tag {
      display: inline-block;
      background: rgba($brand-color, 0.1);
      color: $brand-color;
      font-size: 24rpx;
      padding: 8rpx 20rpx;
      border-radius: 8rpx;
    }
  }
}

// 区块标题
.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .title-icon {
    font-size: 28rpx;
    margin-right: 8rpx;
  }

  text:last-child {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
  }
}

// 文案区域
.copy-section {
  margin-bottom: 30rpx;

  .copy-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

    .copy-text {
      display: block;
      font-size: 28rpx;
      color: $text-secondary;
      line-height: 1.8;
      margin-bottom: 24rpx;
    }

    .copy-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba($brand-color, 0.1);
      padding: 16rpx 0;
      border-radius: 8rpx;
      transition: all 0.3s;

      &:active {
        background: rgba($brand-color, 0.2);
      }

      .btn-icon {
        font-size: 28rpx;
        margin-right: 8rpx;
      }

      .btn-text {
        font-size: 28rpx;
        color: $brand-color;
        font-weight: 500;
      }
    }
  }
}

// 信息区域
.info-section {
  margin-bottom: 30rpx;

  .info-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: 28rpx;
        color: $text-muted;
      }

      .info-value {
        font-size: 28rpx;
        color: $text-primary;
      }
    }
  }
}

// 底部操作栏
.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10rpx 30rpx;

    &:active {
      opacity: 0.7;
    }

    .btn-icon {
      font-size: 40rpx;
      margin-bottom: 8rpx;
    }

    .btn-text {
      font-size: 24rpx;
      color: $text-secondary;
    }

    &.preview,
    &.copy {
      .btn-text {
        color: $text-primary;
      }
    }
  }
}
</style>
