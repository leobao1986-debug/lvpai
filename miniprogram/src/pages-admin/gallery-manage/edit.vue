<template>
  <view class="page">
    <!-- 页面标题 -->
    <view class="header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="title">{{ isEdit ? '编辑客片' : '发布客片' }}</text>
      <view class="placeholder"></view>
    </view>

    <scroll-view class="form-container" scroll-y>
      <!-- 基本信息 -->
      <view class="section">
        <view class="section-title">基本信息</view>
        <view class="form-card">
          <view class="form-item">
            <text class="label required">标题</text>
            <input
              class="input"
              v-model="form.title"
              placeholder="请输入客片标题"
              maxlength="50"
            />
          </view>
          <view class="form-item">
            <text class="label required">分类</text>
            <picker
              mode="selector"
              :range="categoryOptions"
              range-key="label"
              :value="categoryIndex"
              @change="onCategoryChange"
            >
              <view class="picker">
                <text :class="{ placeholder: !form.category }">
                  {{ categoryLabel || '请选择分类' }}
                </text>
                <text class="arrow">›</text>
              </view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 标签 -->
      <view class="section">
        <view class="section-title">标签</view>
        <view class="form-card">
          <view class="tags-section">
            <view class="tags-list">
              <view
                v-for="(tag, index) in form.tags"
                :key="index"
                class="tag-item"
              >
                <text>{{ tag }}</text>
                <text class="delete-btn" @click="deleteTag(index)">×</text>
              </view>
              <view
                v-if="form.tags.length < 5"
                class="add-tag-input"
              >
                <input
                  v-model="newTag"
                  placeholder="添加标签"
                  maxlength="10"
                  @confirm="addTag"
                />
                <text class="add-btn-small" @click="addTag">+</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 图片上传 -->
      <view class="section">
        <view class="section-title">图片上传</view>
        <view class="form-card">
          <view class="upload-item">
            <text class="label required">封面图</text>
            <view class="upload-box" @click="chooseCoverImage">
              <image
                v-if="form.coverImage"
                class="preview-image"
                :src="form.coverImage"
                mode="aspectFill"
              />
              <view v-else class="upload-placeholder">
                <text class="upload-icon">📷</text>
                <text class="upload-text">点击上传封面</text>
              </view>
            </view>
          </view>
          <view class="upload-item">
            <text class="label required">客片图片</text>
            <text class="upload-tip">最多上传9张图片</text>
            <view class="image-list">
              <view
                v-for="(img, index) in form.images"
                :key="index"
                class="image-item"
              >
                <image class="preview-image" :src="img" mode="aspectFill" />
                <text class="delete-btn" @click="deleteImage(index)">×</text>
              </view>
              <view
                v-if="form.images.length < 9"
                class="upload-box small"
                @click="chooseImages"
              >
                <text class="upload-icon">+</text>
                <text class="upload-text">添加</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 朋友圈文案 -->
      <view class="section">
        <view class="section-title">朋友圈文案</view>
        <view class="form-card">
          <view class="form-item textarea-item">
            <textarea
              class="textarea"
              v-model="form.momentsText"
              placeholder="输入适合分享到朋友圈的文案"
              maxlength="500"
            />
            <text class="word-count">{{ form.momentsText.length }}/500</text>
          </view>
        </view>
      </view>

      <!-- 发布状态 -->
      <view class="section">
        <view class="section-title">发布设置</view>
        <view class="form-card">
          <view class="form-item switch-item">
            <text class="label">立即发布</text>
            <switch
              :checked="form.status === 'published'"
              color="#c41230"
              @change="toggleStatus"
            />
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-actions">
        <button class="save-btn" @click="saveGallery">保存</button>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <text class="loading-text">{{ loadingText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { callFunction, uploadFile } from '../../utils/cloud'
import { GALLERY_CATEGORIES } from '../../utils/constants'

const userStore = useUserStore()

const isEdit = ref(false)
const galleryId = ref('')
const loading = ref(false)
const loadingText = ref('加载中...')
const newTag = ref('')

// 表单数据
const form = ref({
  title: '',
  category: '',
  tags: [],
  coverImage: '',
  images: [],
  momentsText: '',
  status: 'draft'
})

// 分类选项（排除"全部"）
const categoryOptions = GALLERY_CATEGORIES.filter(item => item.value !== 'all')
const categoryIndex = computed(() => {
  return categoryOptions.findIndex(item => item.value === form.value.category)
})
const categoryLabel = computed(() => {
  const category = categoryOptions.find(item => item.value === form.value.category)
  return category ? category.label : ''
})

// 检查管理员权限
const checkAdmin = () => {
  if (!userStore.isAdminUser) {
    uni.showToast({
      title: '无权访问',
      icon: 'none'
    })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
    return false
  }
  return true
}

// 分类选择
const onCategoryChange = (e) => {
  const index = e.detail.value
  form.value.category = categoryOptions[index].value
}

// 添加标签
const addTag = () => {
  const tag = newTag.value.trim()
  if (!tag) {
    uni.showToast({ title: '请输入标签', icon: 'none' })
    return
  }
  if (form.value.tags.includes(tag)) {
    uni.showToast({ title: '标签已存在', icon: 'none' })
    return
  }
  if (form.value.tags.length >= 5) {
    uni.showToast({ title: '最多添加5个标签', icon: 'none' })
    return
  }
  form.value.tags.push(tag)
  newTag.value = ''
}

// 删除标签
const deleteTag = (index) => {
  form.value.tags.splice(index, 1)
}

// 选择封面图
const chooseCoverImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      try {
        loading.value = true
        loadingText.value = '上传中...'
        const filePath = res.tempFilePaths[0]
        const ext = filePath.split('.').pop()
        const cloudPath = `gallery/cover_${Date.now()}.${ext}`
        const fileID = await uploadFile(filePath, cloudPath)
        form.value.coverImage = fileID
        uni.showToast({ title: '上传成功', icon: 'success' })
      } catch (err) {
        console.error('上传失败:', err)
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        loading.value = false
      }
    }
  })
}

// 选择客片图片
const chooseImages = () => {
  const remainCount = 9 - form.value.images.length
  uni.chooseImage({
    count: remainCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      try {
        loading.value = true
        loadingText.value = '上传中...'
        const uploadPromises = res.tempFilePaths.map((filePath, index) => {
          const ext = filePath.split('.').pop()
          const cloudPath = `gallery/image_${Date.now()}_${index}.${ext}`
          return uploadFile(filePath, cloudPath)
        })
        const fileIDs = await Promise.all(uploadPromises)
        form.value.images.push(...fileIDs)
        uni.showToast({ title: '上传成功', icon: 'success' })
      } catch (err) {
        console.error('上传失败:', err)
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除图片
const deleteImage = (index) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        form.value.images.splice(index, 1)
      }
    }
  })
}

// 切换发布状态
const toggleStatus = (e) => {
  form.value.status = e.detail.value ? 'published' : 'draft'
}

// 表单验证
const validateForm = () => {
  if (!form.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return false
  }
  if (!form.value.category) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return false
  }
  if (!form.value.coverImage) {
    uni.showToast({ title: '请上传封面图', icon: 'none' })
    return false
  }
  if (form.value.images.length === 0) {
    uni.showToast({ title: '请至少上传一张客片图片', icon: 'none' })
    return false
  }
  return true
}

// 保存客片
const saveGallery = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    loadingText.value = '保存中...'

    const data = {
      title: form.value.title.trim(),
      category: form.value.category,
      tags: form.value.tags,
      coverImage: form.value.coverImage,
      images: form.value.images,
      momentsText: form.value.momentsText.trim(),
      status: form.value.status
    }

    let res
    if (isEdit.value) {
      res = await callFunction('gallery', {
        action: 'update',
        data: { id: galleryId.value, ...data }
      })
    } else {
      res = await callFunction('gallery', {
        action: 'create',
        data
      })
    }

    if (res.code === 0) {
      uni.showToast({
        title: isEdit.value ? '更新成功' : '发布成功',
        icon: 'success'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: res.message || '保存失败',
        icon: 'none'
      })
    }
  } catch (err) {
    console.error('保存失败:', err)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 获取客片详情
const fetchGalleryDetail = async () => {
  if (!galleryId.value) return

  try {
    loading.value = true
    const res = await callFunction('gallery', {
      action: 'detail',
      data: { id: galleryId.value }
    })

    if (res.code === 0 && res.data) {
      const data = res.data
      form.value = {
        title: data.title || '',
        category: data.category || '',
        tags: data.tags || [],
        coverImage: data.coverImage || '',
        images: data.images || [],
        momentsText: data.momentsText || '',
        status: data.status || 'draft'
      }
    } else {
      uni.showToast({ title: '客片不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  } catch (err) {
    console.error('获取客片详情失败:', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  galleryId.value = currentPage.$route?.query?.id || currentPage.options?.id
  isEdit.value = !!galleryId.value

  if (checkAdmin()) {
    if (isEdit.value) {
      fetchGalleryDetail()
    }
  }
})
</script>

<style lang="scss" scoped>
$primary-color: #c41230;
$bg-color: #f5f5f5;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$text-muted: #999999;

.page {
  min-height: 100vh;
  background-color: $bg-color;
  display: flex;
  flex-direction: column;
}

// 页面标题
.header {
  background: $card-bg;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #eeeeee;

  .back-btn {
    font-size: 48rpx;
    color: $text-primary;
    padding: 0 20rpx;
  }

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-primary;
  }

  .placeholder {
    width: 60rpx;
  }
}

// 表单容器
.form-container {
  flex: 1;
  padding: 30rpx;
}

// 分区
.section {
  margin-bottom: 30rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: 20rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid $primary-color;
  }
}

// 表单卡片
.form-card {
  background: $card-bg;
  border-radius: 16rpx;
  padding: 0 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

// 表单项
.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &.switch-item {
    justify-content: space-between;
  }

  &.textarea-item {
    flex-direction: column;
    align-items: stretch;
    position: relative;
  }

  .label {
    font-size: 28rpx;
    color: $text-primary;
    width: 160rpx;
    flex-shrink: 0;

    &.required::before {
      content: '*';
      color: $primary-color;
      margin-right: 4rpx;
    }
  }

  .input {
    flex: 1;
    font-size: 28rpx;
    color: $text-primary;
    text-align: right;
  }

  .picker {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    text {
      font-size: 28rpx;
      color: $text-primary;

      &.placeholder {
        color: $text-muted;
      }
    }

    .arrow {
      margin-left: 10rpx;
      color: $text-muted;
    }
  }

  .textarea {
    width: 100%;
    height: 200rpx;
    font-size: 28rpx;
    color: $text-primary;
    padding: 20rpx;
    background: #f9f9f9;
    border-radius: 12rpx;
    margin-top: 20rpx;
    box-sizing: border-box;
  }

  .word-count {
    position: absolute;
    right: 10rpx;
    bottom: 10rpx;
    font-size: 24rpx;
    color: $text-muted;
  }
}

// 标签区域
.tags-section {
  padding: 30rpx 0;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .tag-item {
    display: flex;
    align-items: center;
    padding: 12rpx 20rpx;
    background: #fff0f0;
    color: $primary-color;
    border-radius: 30rpx;
    font-size: 26rpx;

    .delete-btn {
      margin-left: 12rpx;
      width: 32rpx;
      height: 32rpx;
      background: $primary-color;
      color: #ffffff;
      border-radius: 50%;
      font-size: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .add-tag-input {
    display: flex;
    align-items: center;
    padding: 12rpx 20rpx;
    background: #f5f5f5;
    border-radius: 30rpx;

    input {
      width: 120rpx;
      font-size: 26rpx;
      color: $text-primary;
    }

    .add-btn-small {
      width: 40rpx;
      height: 40rpx;
      margin-left: 12rpx;
      background: $primary-color;
      color: #ffffff;
      border-radius: 50%;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 上传项
.upload-item {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .label {
    display: block;
    font-size: 28rpx;
    color: $text-primary;
    margin-bottom: 20rpx;

    &.required::before {
      content: '*';
      color: $primary-color;
      margin-right: 4rpx;
    }
  }

  .upload-tip {
    font-size: 24rpx;
    color: $text-muted;
    margin-bottom: 20rpx;
    display: block;
  }
}

// 上传框
.upload-box {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #dddddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;

  &.small {
    width: 160rpx;
    height: 160rpx;
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;

    .upload-icon {
      font-size: 48rpx;
      margin-bottom: 10rpx;
    }

    .upload-text {
      font-size: 24rpx;
      color: $text-muted;
    }
  }

  .preview-image {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
  }
}

// 图片列表
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .image-item {
    position: relative;
    width: 160rpx;
    height: 160rpx;

    .preview-image {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
    }

    .delete-btn {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      width: 40rpx;
      height: 40rpx;
      background: #ee0a24;
      color: #ffffff;
      border-radius: 50%;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 底部操作
.bottom-actions {
  margin-top: 40rpx;

  .save-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background: $primary-color;
    color: #ffffff;
    border-radius: 45rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;

    &:active {
      opacity: 0.9;
    }
  }
}

// 底部留白
.bottom-space {
  height: 60rpx;
}

// 加载遮罩
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .loading-text {
    color: $text-secondary;
    font-size: 28rpx;
  }
}
</style>
