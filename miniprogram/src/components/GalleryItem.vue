<template>
  <view class="gallery-item" @tap="previewImage">
    <image class="gallery-cover" :src="item.coverImage" mode="widthFix" lazy-load style="width: 100%; display: block;" />
    <view class="gallery-info">
      <text class="gallery-title">{{ item.title }}</text>
      <view class="gallery-meta">
        <text class="gallery-tag" v-for="tag in item.tags" :key="tag">#{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true }
})

const emit = defineEmits(['preview'])

const previewImage = () => {
  emit('preview', props.item)
}
</script>

<style lang="scss" scoped>
.gallery-item {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
  break-inside: avoid;
  border-top: 2rpx solid #f5c842;

  .gallery-cover {
    width: 100%;
  }

  .gallery-info {
    padding: 12rpx 16rpx;

    .gallery-title {
      font-size: 26rpx;
      color: #333;
      display: block;
      margin-bottom: 8rpx;
    }

    .gallery-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;

      .gallery-tag {
        font-size: 20rpx;
        color: #f5c842;
      }
    }
  }
}
</style>
