<template>
  <view class="page">
    <!-- 页面标题 -->
    <view class="header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="title">店铺设置</text>
      <view class="placeholder"></view>
    </view>

    <scroll-view class="form-container" scroll-y v-if="!loading">
      <!-- 基本信息 -->
      <view class="section">
        <view class="section-title">基本信息</view>
        <view class="form-card">
          <view class="form-item">
            <text class="label required">店铺名称</text>
            <input
              class="input"
              v-model="form.name"
              placeholder="请输入店铺名称"
              maxlength="50"
            />
          </view>
          <view class="form-item">
            <text class="label required">联系电话</text>
            <input
              class="input"
              v-model="form.phone"
              type="number"
              placeholder="请输入联系电话"
              maxlength="20"
            />
          </view>
          <view class="form-item">
            <text class="label required">店铺地址</text>
            <input
              class="input"
              v-model="form.address"
              placeholder="请输入店铺地址"
              maxlength="200"
            />
          </view>
        </view>
      </view>

      <!-- 营业时间 -->
      <view class="section">
        <view class="section-title">营业时间</view>
        <view class="form-card">
          <view class="form-item">
            <text class="label required">旺季营业时间</text>
            <input
              class="input"
              v-model="form.peakHours"
              placeholder="如：8:00-20:00"
              maxlength="30"
            />
          </view>
          <view class="form-item">
            <text class="label required">淡季营业时间</text>
            <input
              class="input"
              v-model="form.offPeakHours"
              placeholder="如：9:00-18:00"
              maxlength="30"
            />
          </view>
        </view>
      </view>

      <!-- 店铺公告 -->
      <view class="section">
        <view class="section-title">店铺公告</view>
        <view class="form-card">
          <view class="form-item textarea-item">
            <textarea
              class="textarea"
              v-model="form.notice"
              placeholder="输入店铺公告，将在首页展示给用户"
              maxlength="500"
            />
            <text class="word-count">{{ form.notice.length }}/500</text>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-actions">
        <button class="save-btn" @click="saveSettings">保存设置</button>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { callFunction, getDB } from '../../utils/cloud'
import { STORE_INFO } from '../../utils/constants'

const userStore = useUserStore()

const loading = ref(true)

// 表单数据
const form = ref({
  name: '',
  phone: '',
  address: '',
  peakHours: '',
  offPeakHours: '',
  notice: ''
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

// 获取店铺设置
const fetchSettings = async () => {
  try {
    loading.value = true
    const db = getDB()
    const res = await db.collection('settings').limit(1).get()

    if (res.data && res.data.length > 0) {
      const data = res.data[0]
      form.value = {
        name: data.name || STORE_INFO.name,
        phone: data.phone || STORE_INFO.phone,
        address: data.address || STORE_INFO.address,
        peakHours: data.peakHours || STORE_INFO.businessHours.peak,
        offPeakHours: data.offPeakHours || STORE_INFO.businessHours.offPeak,
        notice: data.notice || ''
      }
    } else {
      // 使用默认配置
      form.value = {
        name: STORE_INFO.name,
        phone: STORE_INFO.phone,
        address: STORE_INFO.address,
        peakHours: STORE_INFO.businessHours.peak,
        offPeakHours: STORE_INFO.businessHours.offPeak,
        notice: ''
      }
    }
  } catch (err) {
    console.error('获取设置失败:', err)
    // 使用默认配置
    form.value = {
      name: STORE_INFO.name,
      phone: STORE_INFO.phone,
      address: STORE_INFO.address,
      peakHours: STORE_INFO.businessHours.peak,
      offPeakHours: STORE_INFO.businessHours.offPeak,
      notice: ''
    }
  } finally {
    loading.value = false
  }
}

// 表单验证
const validateForm = () => {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入店铺名称', icon: 'none' })
    return false
  }
  if (!form.value.phone.trim()) {
    uni.showToast({ title: '请输入联系电话', icon: 'none' })
    return false
  }
  if (!form.value.address.trim()) {
    uni.showToast({ title: '请输入店铺地址', icon: 'none' })
    return false
  }
  if (!form.value.peakHours.trim()) {
    uni.showToast({ title: '请输入旺季营业时间', icon: 'none' })
    return false
  }
  if (!form.value.offPeakHours.trim()) {
    uni.showToast({ title: '请输入淡季营业时间', icon: 'none' })
    return false
  }
  return true
}

// 保存设置
const saveSettings = async () => {
  if (!validateForm()) return

  try {
    uni.showLoading({ title: '保存中...' })

    const db = getDB()
    const data = {
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      address: form.value.address.trim(),
      peakHours: form.value.peakHours.trim(),
      offPeakHours: form.value.offPeakHours.trim(),
      notice: form.value.notice.trim(),
      updateTime: db.serverDate()
    }

    // 查询是否已有设置记录
    const existRes = await db.collection('settings').limit(1).get()

    if (existRes.data && existRes.data.length > 0) {
      // 更新
      await db.collection('settings').doc(existRes.data[0]._id).update({
        data
      })
    } else {
      // 新增
      await db.collection('settings').add({
        data: {
          ...data,
          createTime: db.serverDate()
        }
      })
    }

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (err) {
    console.error('保存设置失败:', err)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  if (checkAdmin()) {
    fetchSettings()
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

  &.textarea-item {
    flex-direction: column;
    align-items: stretch;
    position: relative;
    padding-bottom: 60rpx;
  }

  .label {
    font-size: 28rpx;
    color: $text-primary;
    width: 180rpx;
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

  .textarea {
    width: 100%;
    height: 240rpx;
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
    bottom: 20rpx;
    font-size: 24rpx;
    color: $text-muted;
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
