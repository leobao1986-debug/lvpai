<template>
  <view class="home-page">
    <!-- 首页顶部 - 蓝天白云+蒙古包设计 -->
    <view class="hero-section">
      <!-- 蓝天背景 -->
      <view class="sky-bg" :style="{ paddingTop: (statusBarHeight + navBarHeight) + 'px' }">
        <!-- 白云装饰 -->
        <view class="cloud cloud-1"></view>
        <view class="cloud cloud-2"></view>
        <view class="cloud cloud-3"></view>
        <view class="cloud cloud-4"></view>
        
        <!-- 标题 -->
        <view class="hero-title">
          <text class="main-title">朵兰摄影</text>
          <text class="sub-title">成吉思汗陵 · 蒙古袍旅拍</text>
        </view>
        
        <!-- Slogan -->
        <view class="hero-slogan">
          <text>{{ SLOGAN }}</text>
        </view>
      </view>
      
      <!-- 蒙古包穹顶过渡 -->
      <view class="yurt-transition">
        <view class="yurt-dome"></view>
        <!-- 蒙古包装饰门 -->
        <view class="yurt-door">
          <view class="door-arch"></view>
        </view>
      </view>
    </view>

    <!-- 核心功能区（快捷入口） -->
    <view class="quick-actions">
      <view class="action-item" v-for="(item, index) in quickActions" :key="index" @tap="handleQuickAction(item.path)">
        <view class="action-icon" :style="{ background: item.bg }">
          <text class="icon-text">{{ item.icon }}</text>
        </view>
        <text class="action-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- 热门套餐区 -->
    <view class="section hot-packages">
      <view class="section-header">
        <view class="section-title">
          <view class="title-line"></view>
          <text class="title-text">热门套餐</text>
        </view>
        <view class="section-more" @tap="goToPackages">
          <text>查看更多</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <scroll-view class="package-scroll" scroll-x show-scrollbar="false">
        <view class="package-list">
          <PackageCard v-for="item in hotPackages" :key="item._id" :item="item" image-height="420rpx" class="horizontal-card" />
        </view>
      </scroll-view>
    </view>

    <!-- 必拍场景区 -->
    <view class="section scenes-section">
      <view class="section-header">
        <view class="section-title">
          <view class="title-line"></view>
          <text class="title-text">必拍场景</text>
        </view>
      </view>
      <view class="scenes-grid">
        <view class="scene-card" v-for="(scene, index) in scenes" :key="index">
          <view class="scene-image">
            <image class="scene-img" :src="scene.image" mode="aspectFill" style="width: 100%; height: 200rpx;" />
            <view class="scene-overlay"></view>
          </view>
          <view class="scene-info">
            <text class="scene-name">{{ scene.name }}</text>
            <text class="scene-desc">{{ scene.description }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 信任背书区 -->
    <view class="trust-section">
      <view class="trust-badges">
        <view class="badge-item">
          <text class="badge-icon">✓</text>
          <text class="badge-text">景区官方合作指定拍摄点</text>
        </view>
        <view class="badge-item">
          <text class="badge-icon">📷</text>
          <text class="badge-text">累计拍摄超10000组客片</text>
        </view>
      </view>
      <view class="trust-stats">
        <view class="stat-item">
          <text class="stat-number">10000+</text>
          <text class="stat-label">拍摄组数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-number">5A</text>
          <text class="stat-label">景区合作</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-number">100%</text>
          <text class="stat-label">出片率</text>
        </view>
      </view>
    </view>

    <!-- 悬浮预约按钮 -->
    <FloatingButton />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PackageCard from '@/components/PackageCard.vue'
import FloatingButton from '@/components/FloatingButton.vue'
import { callFunction } from '@/utils/cloud.js'
import { SLOGAN, STORE_INFO } from '@/utils/constants.js'

// 状态栏高度
const statusBarHeight = ref(0)
const navBarHeight = ref(44)

// 快捷入口
const quickActions = ref([
  { name: '预约拍摄', icon: '📅', path: '/pages/booking/index', bg: 'linear-gradient(135deg, #1a9b8c, #2ab5a8)' },
  { name: '热门套餐', icon: '📦', path: '/pages/packages/list', bg: 'linear-gradient(135deg, #f5c842, #fae8a0)' },
  { name: '客片欣赏', icon: '🖼️', path: '/pages/gallery/index', bg: 'linear-gradient(135deg, #1a9b8c, #2ab5a8)' },
  { name: '门店导航', icon: '📍', path: 'store', bg: 'linear-gradient(135deg, #0d5c54, #1a9b8c)' }
])

// 热门套餐数据
const hotPackages = ref([])
const loading = ref(false)

// 必拍场景
const scenes = ref([])

// 获取热门套餐
const fetchHotPackages = async () => {
  loading.value = true
  try {
    const res = await callFunction('package', { action: 'list', data: {} })
    if (res.code === 0 && res.data) {
      // 取前4个上架的套餐
      hotPackages.value = res.data.list || []
      hotPackages.value = hotPackages.value
        .filter(item => item.status === 'on')
        .slice(0, 4)
        .map(item => ({
          ...item,
          coverImage: item.coverImage || '/static/placeholder.jpg'
        }))
    }
  } catch (err) {
    console.error('获取热门套餐失败:', err)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 处理快捷入口点击
const handleQuickAction = (path) => {
  if (path === 'store') {
    // 打开地图导航
    uni.openLocation({
      latitude: STORE_INFO.latitude,
      longitude: STORE_INFO.longitude,
      name: STORE_INFO.name,
      address: STORE_INFO.address
    })
  } else {
    uni.navigateTo({ url: path })
  }
}

// 跳转到套餐列表
const goToPackages = () => {
  uni.navigateTo({ url: '/pages/packages/list' })
}



// 获取场景数据
const fetchScenes = async () => {
  try {
    const res = await callFunction('scene', { action: 'list' })
    if (res.code === 0 && res.data) {
      scenes.value = res.data.list || []
    }
  } catch (err) {
    console.error('获取场景失败:', err)
  }
}

// 页面加载
onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  
  // 加载数据
  fetchHotPackages()
  fetchScenes()
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background-color: #f0f8f7;
}

// ==================== 蓝天白云+蒙古包顶部设计 ====================
.hero-section {
  position: relative;
  overflow: hidden;
}

// 青绿背景
.sky-bg {
  background: linear-gradient(180deg, 
    #1a9b8c 0%,   // 青绿
    #2ab5a8 35%,  // 亮青绿
    #4fc4b8 65%,  // 浅青绿
    #a8ddd6 100%  // 极浅青绿
  );
  padding-bottom: 100rpx;
  position: relative;
  overflow: hidden;
  
  // 太阳光晕效果
  // 装饰光晕效果
  &::before {
    content: '';
    position: absolute;
    top: 60rpx;
    right: 60rpx;
    width: 100rpx;
    height: 100rpx;
    background: radial-gradient(circle, 
      rgba(245, 200, 66, 0.9) 0%,
      rgba(245, 200, 66, 0.4) 40%,
      transparent 70%
    );
    border-radius: 50%;
    animation: sunGlow 3s ease-in-out infinite alternate;
  }
}

@keyframes sunGlow {
  from {
    transform: scale(1);
    opacity: 0.8;
  }
  to {
    transform: scale(1.2);
    opacity: 1;
  }
}

// 白云装饰 - 纯CSS绘制
.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 100rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 255, 255, 0.5);
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50%;
  }
}

.cloud-1 {
  width: 140rpx;
  height: 40rpx;
  top: 120rpx;
  left: 40rpx;
  animation: cloudFloat1 8s ease-in-out infinite;
  
  &::before {
    width: 60rpx;
    height: 60rpx;
    top: -30rpx;
    left: 25rpx;
  }
  
  &::after {
    width: 45rpx;
    height: 45rpx;
    top: -22rpx;
    right: 25rpx;
  }
}

.cloud-2 {
  width: 180rpx;
  height: 45rpx;
  top: 80rpx;
  right: 60rpx;
  animation: cloudFloat2 10s ease-in-out infinite;
  
  &::before {
    width: 70rpx;
    height: 70rpx;
    top: -35rpx;
    left: 35rpx;
  }
  
  &::after {
    width: 50rpx;
    height: 50rpx;
    top: -25rpx;
    right: 30rpx;
  }
}

.cloud-3 {
  width: 110rpx;
  height: 30rpx;
  top: 180rpx;
  right: 100rpx;
  opacity: 0.85;
  animation: cloudFloat3 12s ease-in-out infinite;
  
  &::before {
    width: 45rpx;
    height: 45rpx;
    top: -22rpx;
    left: 18rpx;
  }
  
  &::after {
    width: 35rpx;
    height: 35rpx;
    top: -17rpx;
    right: 18rpx;
  }
}

.cloud-4 {
  width: 90rpx;
  height: 25rpx;
  top: 140rpx;
  left: 220rpx;
  opacity: 0.75;
  animation: cloudFloat4 9s ease-in-out infinite;
  
  &::before {
    width: 38rpx;
    height: 38rpx;
    top: -19rpx;
    left: 12rpx;
  }
  
  &::after {
    width: 28rpx;
    height: 28rpx;
    top: -14rpx;
    right: 12rpx;
  }
}

// 白云漂浮动画
@keyframes cloudFloat1 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(30rpx); }
}

@keyframes cloudFloat2 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-25rpx); }
}

@keyframes cloudFloat3 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-35rpx); }
}

@keyframes cloudFloat4 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(25rpx); }
}

// 标题区域
.hero-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40rpx;
  position: relative;
  z-index: 10;
  
  .main-title {
    font-size: 56rpx;
    font-weight: 700;
    color: #fff;
    letter-spacing: 12rpx;
    text-shadow: 
      0 2rpx 4rpx rgba(0, 0, 0, 0.2),
      0 4rpx 20rpx rgba(74, 144, 217, 0.4);
  }
  
  .sub-title {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 4rpx;
    margin-top: 12rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  }
}

// Slogan
.hero-slogan {
  display: flex;
  justify-content: center;
  margin-top: 50rpx;
  position: relative;
  z-index: 10;
  
  text {
    font-size: 30rpx;
    color: rgba(255, 255, 255, 0.98);
    letter-spacing: 2rpx;
    text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
    padding: 16rpx 40rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 999rpx;
    backdrop-filter: blur(10px);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
  }
}

// 蒙古包穹顶过渡
.yurt-transition {
  height: 120rpx;
  background: #f0f8f7;
  position: relative;
  margin-top: -60rpx;
  
  // 蒙古包穹顶形状
  .yurt-dome {
    position: absolute;
    top: -80rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 140%;
    height: 160rpx;
    background: #f0f8f7;
    border-radius: 50% 50% 0 0;
    
    // 穹顶装饰纹路
    &::before {
      content: '';
      position: absolute;
      top: 40rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 4rpx;
      background: linear-gradient(90deg, 
        transparent 0%,
        $mongol-gold 20%,
        $mongol-gold-light 50%,
        $mongol-gold 80%,
        transparent 100%
      );
    }
    
    // 蒙古包顶部开口装饰
    &::after {
      content: '';
      position: absolute;
      top: 20rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 40rpx;
      background: linear-gradient(135deg, $mongol-gold 0%, $mongol-gold-light 100%);
      border-radius: 50%;
      box-shadow: 0 0 20rpx rgba(200, 164, 92, 0.5);
    }
  }
  
  // 蒙古包门拱
  .yurt-door {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200rpx;
    height: 100rpx;
    
    .door-arch {
      width: 100%;
      height: 100%;
      border: 4rpx solid transparent;
      border-top: 4rpx solid rgba(200, 164, 92, 0.3);
      border-radius: 100rpx 100rpx 0 0;
      position: relative;
      
      // 门框装饰
      &::before, &::after {
        content: '';
        position: absolute;
        bottom: 0;
        width: 4rpx;
        height: 80rpx;
        background: linear-gradient(180deg, 
          $mongol-gold 0%,
          rgba(200, 164, 92, 0.3) 100%
        );
      }
      
      &::before { left: 20rpx; }
      &::after { right: 20rpx; }
    }
  }
}

// 快捷入口
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 40rpx 30rpx;
  background-color: #fff;
  margin: -40rpx 30rpx 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .action-icon {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);

      .icon-text {
        font-size: 40rpx;
      }
    }

    .action-name {
      font-size: 26rpx;
      color: #0a4a43;
      font-weight: 500;
    }
  }
}

// 区块通用样式
.section {
  padding: 30rpx;
  margin-bottom: 20rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      display: flex;
      align-items: center;

      .title-line {
        width: 6rpx;
        height: 32rpx;
        background: linear-gradient(180deg, #f5c842, #fae8a0);
        border-radius: 3rpx;
        margin-right: 16rpx;
      }

      .title-text {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
    }

    .section-more {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #f5c842;

      .arrow {
        margin-left: 4rpx;
        font-size: 28rpx;
      }
    }
  }
}

// 热门套餐
.hot-packages {
  background-color: #fff;

  .package-scroll {
    width: 100%;

    .package-list {
      display: flex;
      padding-right: 30rpx;

      :deep(.package-card) {
        flex-shrink: 0;
        width: 560rpx;
        margin-right: 20rpx;
        margin-bottom: 0;

        &:last-child {
          margin-right: 0;
        }
        
        // 横向卡片图片高度按 4:3 比例调整
        .card-cover-wrapper {
          height: 420rpx;
          
          .card-cover {
            height: 420rpx;
          }
        }
      }
    }
  }
}

// 必拍场景
.scenes-section {
  background-color: #fff;

  .scenes-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;

    .scene-card {
      border-radius: 16rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

      .scene-image {
        height: 200rpx;
        position: relative;

        .scene-img {
          width: 100%;
          height: 100%;
        }

        .scene-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80rpx;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
        }

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2rpx;
          background: linear-gradient(90deg, transparent, #f5c842, transparent);
        }
      }

      .scene-info {
        padding: 16rpx;

        .scene-name {
          display: block;
          font-size: 28rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 4rpx;
        }

        .scene-desc {
          display: block;
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}

// 信任背书
.trust-section {
  background: linear-gradient(135deg, #f0f8f7, #d8efe8);
  padding: 40rpx 30rpx;

  .trust-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20rpx;
    margin-bottom: 40rpx;

    .badge-item {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #1a9b8c, #2ab5a8);
      padding: 12rpx 24rpx;
      border-radius: 999rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

      .badge-icon {
        font-size: 24rpx;
        margin-right: 8rpx;
        color: #ffffff;
      }

      .badge-text {
        font-size: 24rpx;
        color: #ffffff;
      }
    }
  }

  .trust-stats {
    display: flex;
    justify-content: center;
    align-items: center;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 40rpx;

      .stat-number {
        font-size: 40rpx;
        font-weight: bold;
        color: #1a9b8c;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 24rpx;
        color: #999;
      }
    }

    .stat-divider {
      width: 2rpx;
      height: 60rpx;
      background-color: #f5c842;
    }
  }
}
</style>
