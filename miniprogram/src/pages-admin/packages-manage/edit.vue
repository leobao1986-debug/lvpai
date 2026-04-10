<template>
  <view class="page">
    <!-- 页面标题 -->
    <view class="header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="title">{{ isEdit ? '编辑套餐' : '新增套餐' }}</text>
      <view class="placeholder"></view>
    </view>

    <scroll-view class="form-container" scroll-y>
      <!-- 基本信息 -->
      <view class="section">
        <view class="section-title">基本信息</view>
        <view class="form-card">
          <view class="form-item">
            <text class="label required">套餐名称</text>
            <input
              class="input"
              v-model="form.name"
              placeholder="请输入套餐名称"
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
          <view class="form-item">
            <text class="label required">价格</text>
            <input
              class="input"
              v-model="form.price"
              type="digit"
              placeholder="请输入价格"
            />
            <text class="unit">元</text>
          </view>
          <view class="form-item">
            <text class="label required">定金金额</text>
            <input
              class="input"
              v-model="form.deposit"
              type="digit"
              placeholder="请输入定金金额"
            />
            <text class="unit">元</text>
          </view>
        </view>
      </view>

      <!-- 服务详情 -->
      <view class="section">
        <view class="section-title">服务详情</view>
        <view class="form-card">
          <view class="form-item">
            <text class="label">拍摄时长</text>
            <input
              class="input"
              v-model="form.duration"
              type="number"
              placeholder="请输入拍摄时长"
            />
            <text class="unit">分钟</text>
          </view>
          <view class="form-item">
            <text class="label">服装套数</text>
            <input
              class="input"
              v-model="form.costumeCount"
              type="number"
              placeholder="请输入服装套数"
            />
            <text class="unit">套</text>
          </view>
          <view class="form-item">
            <text class="label">精修张数</text>
            <input
              class="input"
              v-model="form.retouchCount"
              type="number"
              placeholder="请输入精修张数"
            />
            <text class="unit">张</text>
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
            <text class="label">详情图片</text>
            <view class="image-list">
              <view
                v-for="(img, index) in form.detailImages"
                :key="index"
                class="image-item"
              >
                <image class="preview-image" :src="img" mode="aspectFill" />
                <text class="delete-btn" @click="deleteDetailImage(index)">×</text>
              </view>
              <view
                v-if="form.detailImages.length < 9"
                class="upload-box small"
                @click="chooseDetailImages"
              >
                <text class="upload-icon">+</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 套餐特色 -->
      <view class="section">
        <view class="section-title">套餐特色</view>
        <view class="form-card">
          <view class="form-item">
            <text class="label">特色亮点</text>
            <view class="features-list">
              <view
                v-for="(feature, index) in form.features"
                :key="index"
                class="feature-item"
              >
                <input
                  class="feature-input"
                  v-model="form.features[index]"
                  placeholder="输入特色亮点"
                  maxlength="50"
                />
                <text class="delete-btn" @click="deleteFeature(index)">×</text>
              </view>
              <view
                v-if="form.features.length < 6"
                class="add-feature"
                @click="addFeature"
              >
                <text class="add-icon">+</text>
                <text>添加特色</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="label">标签</text>
            <input
              class="input"
              v-model="form.tag"
              placeholder="如：热卖、新品（选填）"
              maxlength="20"
            />
          </view>
          <view class="form-item">
            <text class="label">详细描述</text>
            <textarea
              class="textarea"
              v-model="form.description"
              placeholder="请输入套餐详细描述"
              maxlength="500"
            />
            <text class="word-count">{{ form.description.length }}/500</text>
          </view>
        </view>
      </view>

      <!-- 上架状态 -->
      <view class="section">
        <view class="section-title">其他设置</view>
        <view class="form-card">
          <view class="form-item switch-item">
            <text class="label">上架状态</text>
            <switch
              :checked="form.status === 'active'"
              color="#c41230"
              @change="toggleStatus"
            />
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-actions">
        <button class="save-btn" @click="savePackage">保存</button>
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
import { PACKAGE_CATEGORIES } from '../../utils/constants'

const userStore = useUserStore()

const isEdit = ref(false)
const packageId = ref('')
const loading = ref(false)
const loadingText = ref('加载中...')

// 表单数据
const form = ref({
  name: '',
  category: '',
  price: '',
  deposit: '',
  duration: '',
  costumeCount: '',
  retouchCount: '',
  coverImage: '',
  detailImages: [],
  features: [],
  tag: '',
  description: '',
  status: 'active'
})

// 分类选项
const categoryOptions = PACKAGE_CATEGORIES
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
        const cloudPath = `packages/cover_${Date.now()}.${ext}`
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

// 选择详情图片
const chooseDetailImages = () => {
  const remainCount = 9 - form.value.detailImages.length
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
          const cloudPath = `packages/detail_${Date.now()}_${index}.${ext}`
          return uploadFile(filePath, cloudPath)
        })
        const fileIDs = await Promise.all(uploadPromises)
        form.value.detailImages.push(...fileIDs)
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

// 删除详情图片
const deleteDetailImage = (index) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        form.value.detailImages.splice(index, 1)
      }
    }
  })
}

// 添加特色
const addFeature = () => {
  form.value.features.push('')
}

// 删除特色
const deleteFeature = (index) => {
  form.value.features.splice(index, 1)
}

// 切换上架状态
const toggleStatus = (e) => {
  form.value.status = e.detail.value ? 'active' : 'inactive'
}

// 表单验证
const validateForm = () => {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入套餐名称', icon: 'none' })
    return false
  }
  if (!form.value.category) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return false
  }
  if (!form.value.price || parseFloat(form.value.price) <= 0) {
    uni.showToast({ title: '请输入有效的价格', icon: 'none' })
    return false
  }
  if (!form.value.deposit || parseFloat(form.value.deposit) <= 0) {
    uni.showToast({ title: '请输入有效的定金金额', icon: 'none' })
    return false
  }
  if (!form.value.coverImage) {
    uni.showToast({ title: '请上传封面图', icon: 'none' })
    return false
  }
  return true
}

// 保存套餐
const savePackage = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    loadingText.value = '保存中...'

    // 过滤空特色
    const features = form.value.features.filter(f => f.trim())

    const data = {
      name: form.value.name.trim(),
      category: form.value.category,
      price: parseFloat(form.value.price),
      deposit: parseFloat(form.value.deposit),
      duration: parseInt(form.value.duration) || 0,
      costumeCount: parseInt(form.value.costumeCount) || 0,
      retouchCount: parseInt(form.value.retouchCount) || 0,
      coverImage: form.value.coverImage,
      detailImages: form.value.detailImages,
      features,
      tag: form.value.tag.trim(),
      description: form.value.description.trim(),
      status: form.value.status
    }

    let res
    if (isEdit.value) {
      res = await callFunction('package', {
        action: 'update',
        data: { id: packageId.value, ...data }
      })
    } else {
      res = await callFunction('package', {
        action: 'create',
        data
      })
    }

    if (res.code === 0) {
      uni.showToast({
        title: isEdit.value ? '更新成功' : '创建成功',
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

// 获取套餐详情
const fetchPackageDetail = async () => {
  if (!packageId.value) return

  try {
    loading.value = true
    const res = await callFunction('package', {
      action: 'detail',
      data: { id: packageId.value }
    })

    if (res.code === 0 && res.data) {
      const data = res.data
      form.value = {
        name: data.name || '',
        category: data.category || '',
        price: String(data.price || ''),
        deposit: String(data.deposit || ''),
        duration: String(data.duration || ''),
        costumeCount: String(data.costumeCount || ''),
        retouchCount: String(data.retouchCount || ''),
        coverImage: data.coverImage || '',
        detailImages: data.detailImages || [],
        features: data.features && data.features.length > 0 ? data.features : [],
        tag: data.tag || '',
        description: data.description || '',
        status: data.status || 'active'
      }
    } else {
      uni.showToast({ title: '套餐不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  } catch (err) {
    console.error('获取套餐详情失败:', err)
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
  packageId.value = currentPage.$route?.query?.id || currentPage.options?.id
  isEdit.value = !!packageId.value

  if (checkAdmin()) {
    if (isEdit.value) {
      fetchPackageDetail()
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

  .unit {
    font-size: 26rpx;
    color: $text-muted;
    margin-left: 16rpx;
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
    flex: 1;
    height: 200rpx;
    font-size: 28rpx;
    color: $text-primary;
    text-align: left;
    padding: 20rpx;
    background: #f9f9f9;
    border-radius: 12rpx;
    margin-top: 20rpx;
  }

  .word-count {
    position: absolute;
    right: 30rpx;
    bottom: 20rpx;
    font-size: 24rpx;
    color: $text-muted;
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

// 特色列表
.features-list {
  flex: 1;

  .feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;

    .feature-input {
      flex: 1;
      height: 70rpx;
      padding: 0 20rpx;
      background: #f9f9f9;
      border-radius: 8rpx;
      font-size: 28rpx;
    }

    .delete-btn {
      width: 50rpx;
      height: 50rpx;
      margin-left: 16rpx;
      background: #ff4d4f;
      color: #ffffff;
      border-radius: 50%;
      font-size: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .add-feature {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    color: $primary-color;
    font-size: 28rpx;

    .add-icon {
      width: 40rpx;
      height: 40rpx;
      background: $primary-color;
      color: #ffffff;
      border-radius: 50%;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12rpx;
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
