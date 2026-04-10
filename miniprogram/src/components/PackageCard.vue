<template>
  <view class="package-card" @tap="goDetail">
    <!-- 图片容器 - 使用固定宽高比 -->
    <view class="card-cover-wrapper" :style="{ width: '100%', height: imageHeight, overflow: 'hidden' }">
      <image class="card-cover" :src="item.coverImage" mode="aspectFill" lazy-load :style="{ width: '100%', height: imageHeight }" />
      <!-- 底部渐变遮罩 -->
      <view class="cover-gradient"></view>
    </view>
    <view class="card-info">
      <text class="card-name">{{ item.name }}</text>
      <text class="card-desc">{{ item.description }}</text>
      <view class="card-bottom">
        <view class="card-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ item.price }}</text>
          <text class="price-unit">起</text>
        </view>
        <view class="card-tag" v-if="item.tag">
          <text>{{ item.tag }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  imageHeight: { type: String, default: '360rpx' }
})

const goDetail = () => {
  uni.navigateTo({
    url: `/pages/packages/detail?id=${props.item._id}`
  })
}
</script>

<style lang="scss" scoped>
.package-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  border-top: 3rpx solid #f5c842;
  border-bottom: 1rpx solid rgba(245, 200, 66, 0.3);

  // 图片容器 - 使用固定高度（微信小程序推荐方式）
  .card-cover-wrapper {
    width: 100%;
    height: 360rpx; // 固定高度
    overflow: hidden;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    
    .card-cover {
      width: 100%;
      height: 100%;
      // 注意：微信小程序使用 mode="aspectFill" 控制图片缩放，不需要 CSS object-fit
    }
    
    // 底部渐变遮罩
    .cover-gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60rpx;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.15), transparent);
      pointer-events: none;
    }
  }

  .card-info {
    padding: 20rpx 24rpx;

    .card-name {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 8rpx;
    }

    .card-desc {
      font-size: 24rpx;
      color: #999;
      display: block;
      margin-bottom: 16rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-price {
        .price-symbol {
          font-size: 24rpx;
          color: #1a9b8c;
        }
        .price-value {
          font-size: 40rpx;
          font-weight: bold;
          color: #1a9b8c;
        }
        .price-unit {
          font-size: 22rpx;
          color: #999;
          margin-left: 4rpx;
        }
      }

      .card-tag {
        background: linear-gradient(135deg, #f5c842, #fae8a0);
        color: #0a4a43;
        font-size: 20rpx;
        padding: 4rpx 16rpx;
        border-radius: 999rpx;
      }
    }
  }
}
</style>
