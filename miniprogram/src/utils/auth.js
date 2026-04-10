/**
 * 权限管理工具
 */
import { callFunction } from './cloud'

// 登录
export const login = async (userProfile = {}) => {
  try {
    const res = await callFunction('user', {
      action: 'login',
      data: {
        nickname: userProfile.nickname || '',
        avatar: userProfile.avatar || '',
        phone: userProfile.phone || ''
      }
    })
    return res.data
  } catch (err) {
    console.error('登录失败:', err)
    throw err
  }
}

// 获取用户信息
export const getUserProfile = async () => {
  try {
    const res = await callFunction('user', { action: 'getProfile' })
    return res.data
  } catch (err) {
    console.error('获取用户信息失败:', err)
    throw err
  }
}

// 判断是否管理员
export const isAdmin = (user) => {
  return user && (user.role === 'admin' || user.role === 'superAdmin')
}

// 判断是否超级管理员
export const isSuperAdmin = (user) => {
  return user && user.role === 'superAdmin'
}

// 检查登录状态
export const checkAuth = () => {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}
