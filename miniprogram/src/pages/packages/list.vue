<template>
  <view class="page">
    <!-- 分类标签栏 -->
    <view class="category-tabs">
      <scroll-view scroll-x class="tabs-scroll" :scroll-with-animation="true">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentTab === tab.value }"
          @tap="switchTab(tab.value)"
        >
          <text class="tab-text">{{ tab.label }}</text>
          <view class="tab-line" v-if="currentTab === tab.value"></view>
        </view>
      </scroll-view>
      <!-- 金色装饰线 -->
      <view class="tab-gold-line"></view>
    </view>

    <!-- 引导文案 -->
    <view class="guide-text" v-if="currentGuideText">
      <text class="guide-icon">✨</text>
      <text class="guide-content">{{ currentGuideText }}</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading-container" v-if="loading">
      <view class="skeleton-list">
        <view class="skeleton-item" v-for="i in 3" :key="i">
          <view class="skeleton-image"></view>
          <view class="skeleton-content">
            <view class="skeleton-title"></view>
            <view class="skeleton-desc"></view>
            <view class="skeleton-price"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 套餐列表 -->
    <view class="package-list" v-else-if="packageList.length > 0">
      <PackageCard
        v-for="item in packageList"
        :key="item._id"
        :item="item"
      />
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <view class="empty-icon">📷</view>
      <text class="empty-text">暂无相关套餐</text>
      <text class="empty-subtext">敬请期待更多精彩套餐</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { callFunction } from '@/utils/cloud.js'
import { PACKAGE_CATEGORIES } from '@/utils/constants.js'
import PackageCard from '@/components/PackageCard.vue'

// 分类标签数据
const tabs = [
  { value: 'all', label: '全部' },
  ...PACKAGE_CATEGORIES
]

// 引导文案映射
const guideTexts = {
  'basic': '景区指定拍摄点，出片率100%',
  'advanced': '蒙古袍/民族风/公主服，一站式换装',
  'family': '全家福，记录美好时光',
  'vip': 'VIP专属定制，尊享私人摄影'
}

// 响应式数据
const currentTab = ref('all')
const packageList = ref([])
const loading = ref(false)

// 当前引导文案
const currentGuideText = computed(() => {
  return guideTexts[currentTab.value] || ''
})

// 切换标签
const switchTab = (value) => {
  if (currentTab.value === value) return
  currentTab.value = value
  fetchPackageList()
}

// 获取套餐列表
const fetchPackageList = async () => {
  loading.value = true
  try {
    const params = {
      action: 'list',
      data: {}
    }
    // 非"全部"时传入分类参数
    if (currentTab.value !== 'all') {
      params.data.category = currentTab.value
    }
    
    const res = await callFunction('package', params)
    if (res.code === 0) {
      packageList.value = res.data?.list || []
    } else {
      uni.showToast({
        title: res.message || '获取失败',
        icon: 'none'
      })
    }
  } catch (err) {
    console.error('获取套餐列表失败:', err)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 页面加载
onLoad(() => {
  fetchPackageList()
})
</script>

<style lang="scss" scoped>
$page-bg: #f5f0e6;
$brand-color: #c41230;
$text-primary: #333;
$text-secondary: #666;
$text-muted: #999;

.page {
  min-height: 100vh;
  background: $page-bg;
  padding-bottom: 40rpx;
}

// 分类标签栏
.category-tabs {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  
  // 金色装饰线
  .tab-gold-line {
    height: 3rpx;
    background: linear-gradient(90deg, transparent 5%, $mongol-gold 30%, $mongol-gold-light 50%, $mongol-gold 70%, transparent 95%);
  }

  .tabs-scroll {
    white-space: nowrap;
    padding: 0 20rpx;
  }

  .tab-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 32rpx;
    position: relative;

    .tab-text {
      font-size: 28rpx;
      color: $text-secondary;
      transition: all 0.3s ease;
    }

    .tab-line {
      position: absolute;
      bottom: 12rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background: #c8a45c;
      border-radius: 2rpx;
    }

    &.active {
      .tab-text {
        color: $brand-color;
        font-weight: 600;
        font-size: 30rpx;
      }
    }
  }
}

// 引导文案
.guide-text {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 30rpx;
  background: rgba(200, 164, 92, 0.08);

  .guide-icon {
    font-size: 28rpx;
    margin-right: 8rpx;
  }

  .guide-content {
    font-size: 26rpx;
    color: #6b4226;
  }
}

// 加载状态 - 骨架屏
.loading-container {
  padding: 24rpx;

  .skeleton-list {
    .skeleton-item {
      background: #fff;
      border-radius: 16rpx;
      overflow: hidden;
      margin-bottom: 24rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

      .skeleton-image {
        width: 100%;
        height: 320rpx;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      .skeleton-content {
        padding: 20rpx 24rpx;

        .skeleton-title {
          width: 60%;
          height: 36rpx;
          background: #f0f0f0;
          border-radius: 4rpx;
          margin-bottom: 16rpx;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-desc {
          width: 80%;
          height: 28rpx;
          background: #f0f0f0;
          border-radius: 4rpx;
          margin-bottom: 20rpx;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-price {
          width: 30%;
          height: 40rpx;
          background: #f0f0f0;
          border-radius: 4rpx;
          animation: shimmer 1.5s infinite;
        }
      }
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 套餐列表
.package-list {
  padding: 24rpx;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 32rpx;
    color: $text-primary;
    margin-bottom: 12rpx;
  }

  .empty-subtext {
    font-size: 26rpx;
    color: $text-muted;
  }
}
</style>
