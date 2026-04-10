<template>
  <view class="gallery-page">
    <!-- 顶部轮播区 -->
    <view class="gallery-banner">
      <swiper 
        class="banner-swiper" 
        :indicator-dots="true" 
        :autoplay="true" 
        :interval="4000" 
        :duration="500" 
        circular 
        indicator-color="rgba(255,255,255,0.4)" 
        indicator-active-color="#f5c842"
      >
        <swiper-item v-for="(banner, index) in bannerList" :key="index" @tap="handleBannerTap(banner)">
          <view class="banner-item">
            <image class="banner-image" :src="banner.image" mode="aspectFill" style="width: 100%; height: 380rpx;" />
            <view class="banner-overlay"></view>
            <view class="banner-content">
              <text class="banner-title">{{ banner.title }}</text>
              <text class="banner-subtitle">{{ banner.subtitle }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 分类标签栏 -->
    <view class="category-tabs">
      <scroll-view class="tabs-scroll" scroll-x :show-scrollbar="false">
        <view
          v-for="cat in GALLERY_CATEGORIES"
          :key="cat.value"
          class="tab-item"
          :class="{ active: currentCategory === cat.value }"
          @tap="switchCategory(cat.value)"
        >
          <text class="tab-text">{{ cat.label }}</text>
          <view v-if="currentCategory === cat.value" class="tab-line"></view>
        </view>
      </scroll-view>
    </view>

    <!-- 每日更新提示 -->
    <view class="update-hint">
      <view class="dot-wrapper">
        <view class="dot"></view>
        <view class="dot-pulse"></view>
      </view>
      <text class="hint-text">每日客片更新 · 真实客拍</text>
    </view>

    <!-- 瀑布流内容区 -->
    <view class="waterfall-container">
      <!-- 左列 -->
      <view class="waterfall-column">
        <view
          v-for="item in leftColumn"
          :key="item._id"
          class="gallery-card-wrapper"
          @tap="handleCardClick(item)"
        >
          <GalleryItem :item="item" @preview="handlePreview" />
          <!-- 底部操作按钮 -->
          <view class="card-actions">
            <view class="action-btn copy" @tap.stop="handleCopy(item)" v-if="item.copyText">
              <text class="iconfont">📋</text>
              <text class="btn-text">复制文案</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 右列 -->
      <view class="waterfall-column">
        <view
          v-for="item in rightColumn"
          :key="item._id"
          class="gallery-card-wrapper"
          @tap="handleCardClick(item)"
        >
          <GalleryItem :item="item" @preview="handlePreview" />
          <!-- 底部操作按钮 -->
          <view class="card-actions">
            <view class="action-btn copy" @tap.stop="handleCopy(item)" v-if="item.copyText">
              <text class="iconfont">📋</text>
              <text class="btn-text">复制文案</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-status" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 没有更多 -->
    <view class="no-more" v-if="!loading && !hasMore && galleryList.length > 0">
      <text>已经到底啦~</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && galleryList.length === 0 && !isFirstLoad">
      <view class="empty-image">
        <text class="empty-icon">📷</text>
      </view>
      <text class="empty-text">暂无客片，敬请期待</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import GalleryItem from '@/components/GalleryItem.vue'
import { callFunction } from '@/utils/cloud.js'
import { GALLERY_CATEGORIES } from '@/utils/constants.js'
import { MOCK_BANNERS } from '@/utils/mockData.js'

// Banner 数据
const bannerList = ref([])

// 获取 Banner 数据
const fetchBanners = async () => {
  try {
    const res = await callFunction('banner', { action: 'list' })
    if (res.code === 0 && res.data?.list?.length) {
      bannerList.value = res.data.list
    } else {
      // 使用 Mock 数据作为后备
      bannerList.value = MOCK_BANNERS
    }
  } catch (err) {
    console.error('获取Banner失败:', err)
    // 使用 Mock 数据作为后备
    bannerList.value = MOCK_BANNERS
  }
}

// 处理 Banner 点击
const handleBannerTap = (banner) => {
  if (banner.link && banner.link.startsWith('/')) {
    uni.navigateTo({ url: banner.link })
  }
}

// 状态
const currentCategory = ref('all')
const galleryList = ref([])
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const hasMore = ref(true)
const isFirstLoad = ref(true)

// 瀑布流计算 - 将数据分配到左右两列
const leftColumn = computed(() => {
  return galleryList.value.filter((_, index) => index % 2 === 0)
})

const rightColumn = computed(() => {
  return galleryList.value.filter((_, index) => index % 2 === 1)
})

// 加载客片列表
const loadGalleryList = async (isRefresh = false) => {
  if (loading.value) return
  if (!isRefresh && !hasMore.value) return

  loading.value = true

  try {
    const res = await callFunction('gallery', {
      action: 'list',
      data: {
        page: isRefresh ? 1 : page.value,
        pageSize,
        category: currentCategory.value === 'all' ? '' : currentCategory.value
      }
    })

    const list = res.data?.list || []
    
    if (isRefresh) {
      galleryList.value = list
      page.value = 2
    } else {
      galleryList.value.push(...list)
      page.value++
    }

    hasMore.value = list.length === pageSize
    isFirstLoad.value = false
  } catch (err) {
    console.error('加载客片失败:', err)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

// 切换分类
const switchCategory = (category) => {
  if (currentCategory.value === category) return
  currentCategory.value = category
  page.value = 1
  hasMore.value = true
  galleryList.value = []
  loadGalleryList(true)
}

// 卡片点击 - 预览图片
const handleCardClick = (item) => {
  handlePreview(item)
}

// 预览图片
const handlePreview = (item) => {
  const urls = item.images || [item.coverImage]
  uni.previewImage({
    urls,
    current: urls[0],
    success: () => {
      console.log('预览成功')
    }
  })
}

// 复制文案
const handleCopy = (item) => {
  if (!item.copyText) return

  uni.setClipboardData({
    data: item.copyText,
    success: () => {
      uni.showToast({
        title: '文案已复制，快去发朋友圈吧~',
        icon: 'none',
        duration: 2000
      })
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'none'
      })
    }
  })
}

// 触底加载更多
onReachBottom(() => {
  if (!loading.value && hasMore.value) {
    loadGalleryList()
  }
})

// 下拉刷新
onPullDownRefresh(() => {
  loadGalleryList(true)
})

// 页面加载
onMounted(() => {
  fetchBanners()
  loadGalleryList(true)
})
</script>

<style lang="scss" scoped>
.gallery-page {
  min-height: 100vh;
  background: #f0f8f7;
  padding-bottom: 30rpx;
}

// ==================== 顶部轮播区 ====================
.gallery-banner {
  width: 100%;
  height: 380rpx;
  position: relative;
  
  .banner-swiper {
    width: 100%;
    height: 100%;
  }
  
  .banner-item {
    width: 100%;
    height: 100%;
    position: relative;
    
    .banner-image {
      width: 100%;
      height: 100%;
    }
    
    .banner-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 150rpx;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
    }
    
    .banner-content {
      position: absolute;
      bottom: 40rpx;
      left: 30rpx;
      right: 30rpx;
      z-index: 10;
      
      .banner-title {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: #fff;
        text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
        margin-bottom: 8rpx;
      }
      
      .banner-subtitle {
        display: block;
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.4);
      }
    }
  }
}

// 分类标签栏
.category-tabs {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 20rpx 0;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  // 蒙古元素装饰 - 底部金色线
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3rpx;
    background: linear-gradient(90deg, transparent 5%, $mongol-gold 30%, $mongol-gold-light 50%, $mongol-gold 70%, transparent 95%);
  }

  .tabs-scroll {
    white-space: nowrap;
    padding: 0 20rpx;

    .tab-item {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      padding: 0 24rpx;
      position: relative;

      .tab-text {
        font-size: 28rpx;
        color: #666;
        transition: all 0.3s;
      }

      .tab-line {
        width: 40rpx;
        height: 4rpx;
        background: #f5c842;
        border-radius: 2rpx;
        margin-top: 8rpx;
      }

      &.active {
        .tab-text {
          color: #1a9b8c;
          font-weight: 600;
        }
      }
    }
  }
}

// 每日更新提示
.update-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background: #fff;
  margin-bottom: 16rpx;

  .dot-wrapper {
    position: relative;
    width: 16rpx;
    height: 16rpx;
    margin-right: 12rpx;

    .dot {
      width: 16rpx;
      height: 16rpx;
      background: #1a9b8c;
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
    }

    .dot-pulse {
      width: 16rpx;
      height: 16rpx;
      background: rgba(26, 155, 140, 0.4);
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
      animation: pulse 1.5s ease-out infinite;
    }
  }

  .hint-text {
    font-size: 24rpx;
    color: #999;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

// 瀑布流容器
.waterfall-container {
  display: flex;
  padding: 0 16rpx;
  gap: 16rpx;

  .waterfall-column {
    flex: 1;
    display: flex;
    flex-direction: column;

    .gallery-card-wrapper {
      background: #fff;
      border-radius: 12rpx;
      overflow: hidden;
      margin-bottom: 16rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

      // 覆盖 GalleryItem 的样式
      :deep(.gallery-item) {
        margin-bottom: 0;
        box-shadow: none;
        border-radius: 0;
      }
    }
  }
}

// 卡片操作按钮
.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  border-top: 1rpx solid #f0f0f0;

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8rpx 16rpx;
    border-radius: 30rpx;
    transition: all 0.3s;
  
    &.copy {
      background: rgba(245, 200, 66, 0.15);

      .iconfont {
        font-size: 24rpx;
        margin-right: 6rpx;
      }

      .btn-text {
        font-size: 22rpx;
        color: #f5c842;
      }

      &:active {
        background: rgba(245, 200, 66, 0.25);
      }
    }
  }
}

// 加载状态
.loading-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;

  .loading-spinner {
    width: 32rpx;
    height: 32rpx;
    border: 4rpx solid #f0f0f0;
    border-top-color: #1a9b8c;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 16rpx;
  }

  .loading-text {
    font-size: 26rpx;
    color: #999;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 没有更多
.no-more {
  text-align: center;
  padding: 40rpx;

  text {
    font-size: 24rpx;
    color: #999;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;

  .empty-image {
    width: 200rpx;
    height: 200rpx;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;

    .empty-icon {
      font-size: 80rpx;
    }
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
