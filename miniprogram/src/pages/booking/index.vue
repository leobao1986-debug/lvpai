<template>
  <view class="booking-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">预约拍摄</text>
      <text class="page-subtitle">选择您心仪的套餐和时间</text>
    </view>

    <!-- 选择套餐 -->
    <view class="section">
      <view class="section-title">
        <text class="title-icon">📦</text>
        <text>选择套餐</text>
      </view>
      <view class="card">
        <!-- 已选套餐展示 -->
        <view v-if="selectedPackage" class="selected-package">
          <image v-if="selectedPackage.coverImage" :src="selectedPackage.coverImage" class="package-image" mode="aspectFill" style="width: 140rpx; height: 140rpx;" />
          <view class="package-info">
            <text class="package-name">{{ selectedPackage.name }}</text>
            <text class="package-price">¥{{ selectedPackage.price }}</text>
            <text class="deposit-amount">定金 ¥{{ selectedPackage.deposit || selectedPackage.price * 0.3 }}</text>
          </view>
          <view class="change-btn" @click="showPackageSelector = true">
            <text>更换</text>
          </view>
        </view>
        <!-- 未选择套餐 -->
        <view v-else class="select-package-btn" @click="showPackageSelector = true">
          <text class="select-icon">+</text>
          <text>点击选择套餐</text>
        </view>
      </view>
    </view>

    <!-- 选择日期 -->
    <view class="section">
      <view class="section-title">
        <text class="title-icon">📅</text>
        <text>选择日期</text>
      </view>
      <view class="card">
        <!-- 月份切换 -->
        <view class="calendar-header">
          <text class="month-text">{{ currentYear }}年{{ currentMonth }}月</text>
          <view class="month-nav">
            <text class="nav-btn" :class="{ disabled: !canGoPrev }" @click="prevMonth">‹</text>
            <text class="nav-btn" :class="{ disabled: !canGoNext }" @click="nextMonth">›</text>
          </view>
        </view>
        <!-- 星期标题 -->
        <view class="week-header">
          <text v-for="day in weekDays" :key="day" class="week-day">{{ day }}</text>
        </view>
        <!-- 日期网格 -->
        <view class="days-grid">
          <view
            v-for="(day, index) in calendarDays"
            :key="index"
            class="day-cell"
            :class="{
              'other-month': !day.isCurrentMonth,
              'disabled': day.disabled,
              'selected': selectedDate === day.date
            }"
            @click="selectDate(day)"
          >
            <text class="day-text">{{ day.day }}</text>
          </view>
        </view>
        <!-- 已选日期展示 -->
        <view v-if="selectedDate" class="selected-date-info">
          <text>已选择：{{ formatDate(selectedDate) }}</text>
        </view>
      </view>
    </view>

    <!-- 选择时段 -->
    <view class="section">
      <view class="section-title">
        <text class="title-icon">⏰</text>
        <text>选择拍摄时段</text>
      </view>
      <view class="time-slots-container">
        <!-- 上午时段 -->
        <view class="period-group">
          <view class="period-label">上午</view>
          <view class="time-grid">
            <view 
              v-for="slot in morningSlots" 
              :key="slot.value"
              class="time-slot"
              :class="{ active: selectedTimeSlot === slot.value, disabled: slot.booked || slot.passed }"
              @click="selectTimeSlot(slot)"
            >
              <text class="time-text">{{ slot.value }}</text>
              <text class="time-status" v-if="slot.booked">已约</text>
              <text class="time-status" v-else-if="slot.passed">已过</text>
            </view>
          </view>
        </view>
        
        <!-- 下午时段 -->
        <view class="period-group">
          <view class="period-label">下午</view>
          <view class="time-grid">
            <view 
              v-for="slot in afternoonSlots" 
              :key="slot.value"
              class="time-slot"
              :class="{ active: selectedTimeSlot === slot.value, disabled: slot.booked || slot.passed }"
              @click="selectTimeSlot(slot)"
            >
              <text class="time-text">{{ slot.value }}</text>
              <text class="time-status" v-if="slot.booked">已约</text>
              <text class="time-status" v-else-if="slot.passed">已过</text>
            </view>
          </view>
        </view>
        
        <!-- 黄金时段 -->
        <view class="period-group golden">
          <view class="period-label">黄金时段 ✨</view>
          <view class="time-grid">
            <view 
              v-for="slot in goldenSlots" 
              :key="slot.value"
              class="time-slot"
              :class="{ active: selectedTimeSlot === slot.value, disabled: slot.booked || slot.passed }"
              @click="selectTimeSlot(slot)"
            >
              <text class="time-text">{{ slot.value }}</text>
              <text class="time-status" v-if="slot.booked">已约</text>
              <text class="time-status" v-else-if="slot.passed">已过</text>
            </view>
          </view>
        </view>
        
        <!-- 提示 -->
        <view class="slot-tip">
          <text class="tip-icon">ℹ️</text>
          <text class="tip-text">每个时段最多接1组拍摄</text>
        </view>
      </view>
    </view>

    <!-- 联系人信息 -->
    <view class="section">
      <view class="section-title">
        <text class="title-icon">👤</text>
        <text>联系人信息</text>
      </view>
      <view class="card form-card">
        <view class="form-item">
          <text class="form-label">联系人姓名 <text class="required">*</text></text>
          <input
            v-model="form.contactName"
            class="form-input"
            placeholder="请输入联系人姓名"
            maxlength="20"
          />
        </view>
        <view class="form-item">
          <text class="form-label">联系电话 <text class="required">*</text></text>
          <input
            v-model="form.contactPhone"
            class="form-input"
            placeholder="请输入手机号码"
            type="number"
            maxlength="11"
          />
        </view>
        <view class="form-item">
          <text class="form-label">拍摄人数</text>
          <view class="persons-selector">
            <view
              v-for="n in 10"
              :key="n"
              class="person-option"
              :class="{ 'selected': form.persons === n }"
              @click="form.persons = n"
            >
              <text>{{ n }}人</text>
            </view>
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">备注</text>
          <textarea
            v-model="form.remark"
            class="form-textarea"
            placeholder="如有特殊需求请在此说明（选填）"
            maxlength="200"
          />
          <text class="textarea-count">{{ form.remark.length }}/200</text>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <view class="price-info">
        <text class="deposit-label">需支付定金</text>
        <text class="deposit-price">¥{{ depositAmount }}</text>
      </view>
      <button class="submit-btn" :disabled="!canSubmit" @click="handleSubmit">
        提交预约
      </button>
    </view>

    <!-- 套餐选择弹窗 -->
    <view v-if="showPackageSelector" class="modal-overlay" @click="showPackageSelector = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择套餐</text>
          <text class="modal-close" @click="showPackageSelector = false">×</text>
        </view>
        <scroll-view class="package-list" scroll-y>
          <view
            v-for="pkg in packageList"
            :key="pkg._id"
            class="package-option"
            :class="{ 'selected': selectedPackage?._id === pkg._id }"
            @click="selectPackage(pkg)"
          >
            <image v-if="pkg.coverImage" :src="pkg.coverImage" class="option-image" mode="aspectFill" style="width: 120rpx; height: 120rpx;" />
            <view class="option-info">
              <text class="option-name">{{ pkg.name }}</text>
              <text class="option-price">¥{{ pkg.price }}</text>
              <text class="option-deposit">定金 ¥{{ pkg.deposit || Math.floor(pkg.price * 0.3) }}</text>
            </view>
            <view v-if="selectedPackage?._id === pkg._id" class="check-icon">✓</view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { callFunction } from '../../utils/cloud.js'
import { TIME_SLOTS } from '../../utils/constants.js'
import { useUserStore } from '../../store/user.js'

const userStore = useUserStore()

// 套餐相关
const selectedPackage = ref(null)
const packageList = ref([])
const showPackageSelector = ref(false)

// 日历相关
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)
const selectedDate = ref('')
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 时段相关
const bookedSlots = ref([]) // 已被预约的时段列表
const selectedTimeSlot = ref('')

// 判断时段是否已过（当天的已过时段不可选）
const isSlotPassed = (slotValue) => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  // 如果选择的日期不是今天，所有时段都可选
  if (selectedDate.value !== todayStr) return false
  
  // 如果是今天，检查时段是否已过
  const now = today.getHours() * 60 + today.getMinutes()
  const [hours, minutes] = slotValue.split(':').map(Number)
  const slotTime = hours * 60 + (minutes || 0)
  
  return slotTime <= now  // 当前时间已过该时段开始时间
}

// 按时间段分组的时段列表
const morningSlots = computed(() => 
  TIME_SLOTS.filter(s => s.period === 'morning').map(s => ({
    ...s,
    booked: bookedSlots.value.includes(s.value),
    passed: isSlotPassed(s.value)
  }))
)
const afternoonSlots = computed(() => 
  TIME_SLOTS.filter(s => s.period === 'afternoon').map(s => ({
    ...s,
    booked: bookedSlots.value.includes(s.value),
    passed: isSlotPassed(s.value)
  }))
)
const goldenSlots = computed(() => 
  TIME_SLOTS.filter(s => s.period === 'golden').map(s => ({
    ...s,
    booked: bookedSlots.value.includes(s.value),
    passed: isSlotPassed(s.value)
  }))
)

// 监听日期变化，如果选中的时段变为已过，清除选中
watch(() => selectedDate.value, () => {
  if (selectedTimeSlot.value && isSlotPassed(selectedTimeSlot.value)) {
    selectedTimeSlot.value = ''
  }
})

// 表单数据
const form = ref({
  contactName: '',
  contactPhone: '',
  persons: 1,
  remark: ''
})

// 计算属性：日历天数
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const prevLastDay = new Date(year, month - 1, 0)
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 60)
  
  // 上月日期
  const firstDayWeek = firstDay.getDay()
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = prevLastDay.getDate() - i
    days.push({
      day,
      date: '',
      isCurrentMonth: false,
      disabled: true
    })
  }
  
  // 当月日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month - 1, i)
    const dateStr = formatDateStr(date)
    const isDisabled = date < today || date > maxDate
    days.push({
      day: i,
      date: dateStr,
      isCurrentMonth: true,
      disabled: isDisabled
    })
  }
  
  // 下月日期（补齐一行）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      date: '',
      isCurrentMonth: false,
      disabled: true
    })
  }
  
  return days
})

// 月份导航
const canGoPrev = computed(() => {
  const today = new Date()
  return currentDate.value > new Date(today.getFullYear(), today.getMonth(), 1)
})

const canGoNext = computed(() => {
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 60)
  return currentDate.value < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
})

const prevMonth = () => {
  if (!canGoPrev.value) return
  currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
}

const nextMonth = () => {
  if (!canGoNext.value) return
  currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
}

// 日期格式化
const formatDateStr = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  return `${month}月${day}日 ${weekDay}`
}

// 选择日期
const selectDate = (day) => {
  if (day.disabled || !day.date) return
  selectedDate.value = day.date
  selectedTimeSlot.value = ''
  fetchAvailableSlots(day.date)
}

// 获取可预约时段
const fetchAvailableSlots = async (date) => {
  try {
    bookedSlots.value = []
    const res = await callFunction('booking', {
      action: 'availableSlots',
      data: { date }
    })
    if (res.code === 0) {
      bookedSlots.value = res.data.bookedSlots || []
    }
  } catch (err) {
    console.error('获取时段失败:', err)
    uni.showToast({ title: '获取时段失败', icon: 'none' })
  }
}

// 选择时段
const selectTimeSlot = (slot) => {
  if (slot.booked || slot.passed) return
  selectedTimeSlot.value = slot.value
}

// 选择套餐
const selectPackage = (pkg) => {
  selectedPackage.value = pkg
  showPackageSelector.value = false
}

// 获取套餐列表
const fetchPackageList = async () => {
  try {
    const res = await callFunction('package', {
      action: 'list',
      data: { status: 'active' }
    })
    if (res.code === 0) {
      packageList.value = res.data.list || []
    }
  } catch (err) {
    console.error('获取套餐列表失败:', err)
  }
}

// 获取套餐详情
const fetchPackageDetail = async (id) => {
  try {
    const res = await callFunction('package', {
      action: 'detail',
      data: { id }
    })
    if (res.code === 0) {
      selectedPackage.value = res.data
    }
  } catch (err) {
    console.error('获取套餐详情失败:', err)
    uni.showToast({ title: '获取套餐信息失败', icon: 'none' })
  }
}

// 定金金额
const depositAmount = computed(() => {
  if (!selectedPackage.value) return 0
  return selectedPackage.value.deposit || Math.floor(selectedPackage.value.price * 0.3)
})

// 手机号校验
const isValidPhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 是否可提交
const canSubmit = computed(() => {
  return selectedPackage.value &&
    selectedDate.value &&
    selectedTimeSlot.value &&
    !isSlotPassed(selectedTimeSlot.value) &&
    form.value.contactName.trim() &&
    isValidPhone(form.value.contactPhone)
})

// 提交预约
const handleSubmit = async () => {
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
  
  // 表单验证 - 逐项检查必填字段
  if (!selectedPackage.value) {
    uni.showToast({ title: '请选择拍摄套餐', icon: 'none' })
    return
  }
  if (!selectedDate.value) {
    uni.showToast({ title: '请选择拍摄日期', icon: 'none' })
    return
  }
  if (!selectedTimeSlot.value) {
    uni.showToast({ title: '请选择拍摄时段', icon: 'none' })
    return
  }
  if (isSlotPassed(selectedTimeSlot.value)) {
    uni.showToast({ title: '该时段已过，请重新选择', icon: 'none' })
    selectedTimeSlot.value = ''
    return
  }
  if (!form.value.contactName || !form.value.contactName.trim()) {
    uni.showToast({ title: '请填写联系人姓名', icon: 'none' })
    return
  }
  if (!form.value.contactPhone || !form.value.contactPhone.trim()) {
    uni.showToast({ title: '请填写联系电话', icon: 'none' })
    return
  }
  // 手机号格式验证
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(form.value.contactPhone.trim())) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!form.value.persons || form.value.persons < 1) {
    uni.showToast({ title: '请填写拍摄人数', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '提交中...' })
    
    const res = await callFunction('booking', {
      action: 'create',
      data: {
        packageId: selectedPackage.value._id,
        date: selectedDate.value,
        timeSlot: selectedTimeSlot.value,
        contactName: form.value.contactName.trim(),
        contactPhone: form.value.contactPhone,
        persons: form.value.persons,
        remark: form.value.remark.trim(),
        depositAmount: depositAmount.value,
        totalPrice: selectedPackage.value.price
      }
    })
    
    uni.hideLoading()
    
    if (res.code === 0) {
      const { order } = res.data
      // 预约成功后显示弹窗，引导用户去订单列表支付
      uni.showModal({
        title: '预约成功',
        content: '您的预约已提交成功！请前往"我的订单"完成定金支付。',
        confirmText: '查看订单',
        cancelText: '返回首页',
        success: (res) => {
          if (res.confirm) {
            // 跳转到我的订单列表
            uni.navigateTo({ url: '/pages/order/list?type=order' })
          } else {
            // 返回首页
            uni.switchTab({ url: '/pages/index/index' })
          }
        }
      })
    } else {
      uni.showToast({ title: res.message || '预约失败', icon: 'none' })
    }
  } catch (err) {
    uni.hideLoading()
    console.error('提交预约失败:', err)
    uni.showToast({ title: err.message || '预约失败', icon: 'none' })
  }
}

// 页面加载
onLoad((options) => {
  fetchPackageList()
  
  if (options.packageId) {
    fetchPackageDetail(options.packageId)
  }
  
  // 设置默认日期为今天
  const today = new Date()
  selectedDate.value = formatDateStr(today)
  fetchAvailableSlots(selectedDate.value)
})
</script>

<style lang="scss" scoped>
$primary-color: #1a9b8c;
$gold-color: #f5c842;
$bg-color: #f0f8f7;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$text-tertiary: #999999;
$border-color: #e5e5e5;

.booking-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.page-header {
  background: linear-gradient(135deg, $primary-color 0%, #e63950 100%);
  padding: 40rpx 30rpx;
  
  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #ffffff;
    letter-spacing: 2rpx;
  }
  
  .page-subtitle {
    display: block;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 10rpx;
  }
}

.section {
  margin: 20rpx 30rpx;
  
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
    
    .title-icon {
      margin-right: 12rpx;
      font-size: 32rpx;
    }
  }
}

.card {
  background: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

// 套餐选择
.selected-package {
  display: flex;
  align-items: center;
  
  .package-image {
    width: 140rpx;
    height: 140rpx;
    border-radius: 12rpx;
    margin-right: 24rpx;
    background-color: $bg-color;
  }
  
  .package-info {
    flex: 1;
    
    .package-name {
      display: block;
      font-size: 30rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 8rpx;
    }
    
    .package-price {
      display: block;
      font-size: 24rpx;
      color: $text-secondary;
      text-decoration: line-through;
      margin-bottom: 4rpx;
    }
    
    .deposit-amount {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      color: $primary-color;
    }
  }
  
  .change-btn {
    padding: 12rpx 24rpx;
    background: rgba($primary-color, 0.1);
    border-radius: 30rpx;
    
    text {
      font-size: 26rpx;
      color: $primary-color;
    }
  }
}

.select-package-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  border: 2rpx dashed $border-color;
  border-radius: 12rpx;
  
  .select-icon {
    font-size: 40rpx;
    color: $primary-color;
    margin-right: 12rpx;
  }
  
  text:last-child {
    font-size: 28rpx;
    color: $text-secondary;
  }
}

// 日历
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  
  .month-text {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
  }
  
  .month-nav {
    display: flex;
    gap: 20rpx;
    
    .nav-btn {
      width: 48rpx;
      height: 48rpx;
      line-height: 48rpx;
      text-align: center;
      background: $bg-color;
      border-radius: 50%;
      font-size: 32rpx;
      color: $text-primary;
      
      &.disabled {
        color: $text-tertiary;
        background: #f0f0f0;
      }
    }
  }
}

.week-header {
  display: flex;
  margin-bottom: 16rpx;
  
  .week-day {
    flex: 1;
    text-align: center;
    font-size: 26rpx;
    color: $text-tertiary;
  }
}

.days-grid {
  display: flex;
  flex-wrap: wrap;
  
  .day-cell {
    width: 14.28%;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .day-text {
      width: 64rpx;
      height: 64rpx;
      line-height: 64rpx;
      text-align: center;
      font-size: 28rpx;
      color: $text-primary;
      border-radius: 50%;
    }
    
    &.other-month {
      .day-text {
        color: $text-tertiary;
      }
    }
    
    &.disabled {
      .day-text {
        color: #cccccc;
      }
    }
    
    &.selected {
      .day-text {
        background: $primary-color;
        color: #ffffff;
      }
    }
    
    &:not(.disabled):not(.other-month):active {
      .day-text {
        background: rgba($primary-color, 0.1);
      }
    }
  }
}

.selected-date-info {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid $border-color;
  
  text {
    font-size: 28rpx;
    color: $primary-color;
  }
}

// 时段选择
.time-slots-container {
  background: $card-bg;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.period-group {
  margin-bottom: 24rpx;
  
  &:last-of-type {
    margin-bottom: 0;
  }
  
  &.golden {
    .period-label {
      color: $gold-color;
    }
  }
  
  .period-label {
    font-size: 26rpx;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 16rpx;
    padding-left: 8rpx;
  }
}

.time-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.time-slot {
  width: calc(25% - 12rpx);
  height: 72rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: $bg-color;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  position: relative;
  
  .time-text {
    font-size: 26rpx;
    font-weight: 500;
    color: $text-primary;
  }
  
  .time-status {
    font-size: 20rpx;
    color: #ff4d4f;
    margin-top: 4rpx;
  }
  
  &.active {
    border-color: $gold-color;
    background: rgba(200, 164, 92, 0.1);
    
    .time-text {
      color: $gold-color;
      font-weight: 600;
    }
  }
  
  &.disabled {
    opacity: 0.4;
    background: #f5f5f5;
    
    .time-text {
      color: $text-tertiary;
    }
  }
}

.slot-tip {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid $border-color;
  
  .tip-icon {
    font-size: 24rpx;
    margin-right: 8rpx;
  }
  
  .tip-text {
    font-size: 24rpx;
    color: $text-tertiary;
  }
}

// 表单
.form-card {
  .form-item {
    margin-bottom: 30rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .form-label {
      display: block;
      font-size: 28rpx;
      color: $text-primary;
      margin-bottom: 16rpx;
      
      .required {
        color: $primary-color;
      }
    }
    
    .form-input {
      height: 80rpx;
      background: $bg-color;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      color: $text-primary;
      border: 2rpx solid transparent;
      
      &:focus {
        border-color: $gold-color;
      }
    }
    
    .persons-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      
      .person-option {
        min-width: 80rpx;
        height: 64rpx;
        line-height: 64rpx;
        text-align: center;
        background: $bg-color;
        border-radius: 12rpx;
        padding: 0 20rpx;
        
        text {
          font-size: 26rpx;
          color: $text-secondary;
        }
        
        &.selected {
          background: $primary-color;
          
          text {
            color: #ffffff;
          }
        }
      }
    }
    
    .form-textarea {
      width: 100%;
      height: 160rpx;
      background: $bg-color;
      border-radius: 12rpx;
      padding: 20rpx 24rpx;
      font-size: 28rpx;
      color: $text-primary;
      box-sizing: border-box;
      border: 2rpx solid transparent;
      
      &:focus {
        border-color: $gold-color;
      }
    }
    
    .textarea-count {
      display: block;
      text-align: right;
      font-size: 24rpx;
      color: $text-tertiary;
      margin-top: 8rpx;
    }
  }
}

// 底部占位
.bottom-placeholder {
  height: 160rpx;
}

// 底部提交栏
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: $card-bg;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .price-info {
    .deposit-label {
      display: block;
      font-size: 24rpx;
      color: $text-secondary;
    }
    
    .deposit-price {
      display: block;
      font-size: 44rpx;
      font-weight: bold;
      color: $primary-color;
    }
  }
  
  .submit-btn {
    width: 280rpx;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #1a9b8c, #2ab5a8);
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 0 0 2rpx rgba(245, 200, 66, 0.3), 0 6rpx 20rpx rgba(26, 155, 140, 0.3);
    
    &:disabled {
      background: #cccccc;
      box-shadow: none;
    }
    
    &:active {
      opacity: 0.9;
    }
  }
}

// 弹窗
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  height: 70vh;
  background: $card-bg;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid $border-color;
  
  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
  }
  
  .modal-close {
    width: 56rpx;
    height: 56rpx;
    line-height: 56rpx;
    text-align: center;
    font-size: 40rpx;
    color: $text-secondary;
  }
}

.package-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.package-option {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: $bg-color;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid transparent;
  
  &.selected {
    border-color: $primary-color;
    background: rgba($primary-color, 0.05);
  }
  
  .option-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    background-color: #e0e0e0;
  }
  
  .option-info {
    flex: 1;
    
    .option-name {
      display: block;
      font-size: 28rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 8rpx;
    }
    
    .option-price {
      display: block;
      font-size: 24rpx;
      color: $text-secondary;
      text-decoration: line-through;
    }
    
    .option-deposit {
      display: block;
      font-size: 28rpx;
      font-weight: bold;
      color: $primary-color;
    }
  }
  
  .check-icon {
    width: 40rpx;
    height: 40rpx;
    line-height: 40rpx;
    text-align: center;
    background: $primary-color;
    color: #ffffff;
    border-radius: 50%;
    font-size: 24rpx;
  }
}
</style>
