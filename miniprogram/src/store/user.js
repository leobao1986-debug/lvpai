import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserProfile, isAdmin as checkIsAdmin } from '../utils/auth'

export const useUserStore = defineStore('user', () => {
  // 从本地存储恢复用户信息
  const userInfo = ref(uni.getStorageSync('userInfo') || null)
  const isLoggedIn = computed(() => !!userInfo.value)
  const isAdminUser = computed(() => checkIsAdmin(userInfo.value))

  // 登录
  const doLogin = async (userProfile = {}) => {
    try {
      const data = await login(userProfile)
      userInfo.value = data
      // 存储到本地
      uni.setStorageSync('userInfo', data)
      return data
    } catch (err) {
      console.error('登录失败:', err)
      throw err
    }
  }

  // 获取用户信息
  const fetchProfile = async () => {
    try {
      const data = await getUserProfile()
      userInfo.value = data
      // 存储到本地
      uni.setStorageSync('userInfo', data)
      return data
    } catch (err) {
      console.error('获取用户信息失败:', err)
      throw err
    }
  }

  // 清除用户信息
  const clearUser = () => {
    userInfo.value = null
    // 清除本地存储
    uni.removeStorageSync('userInfo')
  }

  return {
    userInfo,
    isLoggedIn,
    isAdminUser,
    doLogin,
    fetchProfile,
    clearUser
  }
})
