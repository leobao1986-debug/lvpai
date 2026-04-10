<template>
  <view class="page">
    <!-- 用户信息区 -->
    <view class="user-header">
      <view class="header-bg"></view>
      
      <!-- 未登录状态 - 登录引导 -->
      <view v-if="!isLoggedIn" class="login-section">
        <button open-type="chooseAvatar" @chooseavatar="onChooseAvatar" class="avatar-choose-btn">
          <view class="avatar-placeholder-wrapper">
            <text class="avatar-icon">👤</text>
          </view>
        </button>
        <text class="login-hint">点击头像授权登录</text>
      </view>
      
      <!-- 已登录状态 - 用户信息 -->
      <view v-else class="user-info" @click="handleUserInfoClick">
        <image 
          class="user-avatar" 
          :src="userInfo?.avatar || '/static/tabbar/mine.png'" 
          mode="aspectFill"
        />
        <view class="user-meta">
          <text class="user-name">{{ userInfo?.nickname || '微信用户' }}</text>
          <text class="user-id">ID: {{ shortId }}</text>
        </view>
        <text class="arrow-icon">›</text>
      </view>
    </view>

    <!-- 功能入口列表 -->
    <view class="menu-card">
      <view class="menu-item" @click="navigateTo('/pages/order/list?type=booking')">
        <view class="menu-icon booking">📅</view>
        <text class="menu-text">我的预约</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider"></view>
      
      <view class="menu-item" @click="navigateTo('/pages/order/list?type=order')">
        <view class="menu-icon order">🛒</view>
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider"></view>
            
      <button class="menu-item contact-btn" open-type="contact">
        <view class="menu-icon contact">💬</view>
        <text class="menu-text">联系客服</text>
        <text class="menu-arrow">›</text>
      </button>
      <view class="menu-divider"></view>
      
      <view class="menu-item" @click="makePhoneCall">
        <view class="menu-icon phone">📞</view>
        <text class="menu-text">拨打电话</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider"></view>
      
      <!-- 退出登录 - 已登录时显示 -->
      <view v-if="isLoggedIn" class="menu-item logout-item" @click="handleLogout">
        <view class="menu-icon logout">🚪</view>
        <text class="menu-text logout-text">退出登录</text>
      </view>
    </view>

    <!-- 管理员入口 -->
    <view v-if="userStore.isAdminUser" class="menu-card admin-card">
      <view class="menu-item admin-item" @click="navigateTo('/pages-admin/dashboard/index')">
        <view class="menu-icon admin">⚙️</view>
        <text class="menu-text">管理后台</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="footer">
      <text class="version">版本号 v1.0.0</text>
      <text class="brand">朵兰摄影·静安雨霞</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../store/user'
import { STORE_INFO } from '../../utils/constants'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 登录相关状态
const isLoggingIn = ref(false)

// 计算短ID显示
const shortId = computed(() => {
  if (!userInfo.value?._id) return '-'
  return userInfo.value._id.slice(-6).toUpperCase()
})

// 选择头像并直接登录
const onChooseAvatar = async (e) => {
  const avatarUrl = e.detail.avatarUrl
  if (!avatarUrl || isLoggingIn.value) return
  
  isLoggingIn.value = true
  
  try {
    uni.showLoading({ title: '登录中...' })
    // 直接用头像登录，昵称使用默认值
    await userStore.doLogin({
      nickname: '微信用户',
      avatar: avatarUrl
    })
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })
  } catch (err) {
    uni.hideLoading()
    console.error('登录失败:', err)
    uni.showToast({ title: '登录失败', icon: 'none' })
  } finally {
    isLoggingIn.value = false
  }
}

// 已登录用户点击头像区域
const handleUserInfoClick = () => {
  // 可以跳转到用户详情页或编辑资料页
  // 暂时不做操作
}

// 手机号脱敏
const maskPhone = (phone) => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 页面跳转
const navigateTo = (url) => {
  uni.navigateTo({ url })
}

// 拨打电话
const makePhoneCall = () => {
  if (!STORE_INFO.phone) {
    uni.showToast({
      title: '暂无联系电话',
      icon: 'none'
    })
    return
  }
  uni.makePhoneCall({
    phoneNumber: STORE_INFO.phone
  })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.clearUser()
        uni.showToast({
          title: '已退出登录',
          icon: 'none'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f0f8f7;
  padding-bottom: 40rpx;
}

// 用户信息区
.user-header {
  position: relative;
  padding: 60rpx 40rpx 80rpx;
  overflow: hidden;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1a9b8c 0%, #2ab5a8 50%, #1a9b8c 100%);
    border-radius: 0 0 40rpx 40rpx;
    border-bottom: 3rpx solid #f5c842;
    
    // 蒙古包装饰 - 左侧
    &::before {
      content: '';
      position: absolute;
      left: 30rpx;
      bottom: 20rpx;
      width: 50rpx;
      height: 40rpx;
      opacity: 0.15;
      
      // 蒙古包屋顶
      border-left: 25rpx solid transparent;
      border-right: 25rpx solid transparent;
      border-bottom: 18rpx solid #fff;
    }
    
    // 蒙古包装饰 - 右侧
    &::after {
      content: '';
      position: absolute;
      right: 40rpx;
      bottom: 15rpx;
      width: 40rpx;
      height: 32rpx;
      opacity: 0.12;
      
      border-left: 20rpx solid transparent;
      border-right: 20rpx solid transparent;
      border-bottom: 14rpx solid #fff;
    }
  }
  
  // 登录引导区
  .login-section {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;
    
    .avatar-choose-btn {
      width: 160rpx;
      height: 160rpx;
      padding: 0;
      margin: 0;
      background: transparent;
      border: none;
      line-height: normal;
      
      &::after {
        display: none;
      }
      
      .avatar-placeholder-wrapper {
        width: 160rpx;
        height: 160rpx;
        border-radius: 50%;
        border: 4rpx solid rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        
        .avatar-icon {
          font-size: 60rpx;
          opacity: 0.7;
        }
      }
    }
    
    .login-hint {
      margin-top: 24rpx;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  // 已登录用户信息
  .user-info {
    position: relative;
    display: flex;
    align-items: center;
    
    .user-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
      background: #ffffff;
    }
    
    .user-meta {
      flex: 1;
      margin-left: 30rpx;
      
      .user-name {
        display: block;
        font-size: 40rpx;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 8rpx;
      }
      
      .user-phone {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .arrow-icon {
      font-size: 40rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

// 功能菜单卡片
.menu-card {
  margin: -40rpx 30rpx 30rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
  
  &.admin-card {
    margin-top: 0;
    
    .admin-item {
      .menu-icon {
        background: rgba(196, 18, 48, 0.1);
      }
      
      .menu-text {
        color: #1a9b8c;
        font-weight: 500;
      }
    }
  }
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #ffffff;
  
  &:active {
    background: #f9f9f9;
  }
  
  &.contact-btn {
    margin: 0;
    padding: 30rpx;
    line-height: inherit;
    border: none;
    border-radius: 0;
    
    &::after {
      display: none;
    }
  }
  
  .menu-icon {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    font-size: 32rpx;
    margin-right: 24rpx;
    
    &.booking {
      background: rgba(245, 200, 66, 0.15);
    }
    
    &.order {
      background: rgba(26, 155, 140, 0.12);
    }
    
    &.contact {
      background: rgba(13, 92, 84, 0.12);
    }
    
    &.phone {
      background: rgba(245, 200, 66, 0.15);
    }
    
    &.admin {
      background: rgba(26, 155, 140, 0.1);
    }
  }
  
  .menu-text {
    flex: 1;
    font-size: 30rpx;
    color: #333333;
    text-align: left;
  }
  
  .menu-arrow {
    font-size: 32rpx;
    color: #cccccc;
  }
}

.menu-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin-left: 110rpx;
}

// 退出登录项
.logout-item {
  .menu-icon.logout {
    background: rgba(255, 77, 79, 0.1);
  }
  
  .logout-text {
    color: #ff4d4f;
  }
}

// 底部信息
.footer {
  text-align: center;
  padding: 40rpx 0;
  
  .version {
    display: block;
    font-size: 24rpx;
    color: #0d5c54;
    margin-bottom: 12rpx;
  }
  
  .brand {
    font-size: 26rpx;
    color: #666666;
    font-weight: 500;
  }
}
</style>
