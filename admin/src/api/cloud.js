import cloudbase from '@cloudbase/js-sdk'
import { getMockData } from '../utils/mockData'

// 初始化 CloudBase
let app = null
let authReady = false

function getApp() {
  if (!app) {
    app = cloudbase.init({
      env: 'cloud1-3g56hllb4a005c0e'
    })
  }
  return app
}

// 确保匿名登录完成
async function ensureAuth() {
  if (authReady) return
  try {
    const cbApp = getApp()
    const auth = cbApp.auth({
      persistence: 'local'
    })
    // 检查是否已有登录态
    const loginState = await auth.getLoginState()
    if (!loginState) {
      // 使用匿名登录
      await auth.signInAnonymously()
    }
    authReady = true
  } catch (err) {
    console.warn('CloudBase 认证失败:', err.message || err)
    throw err
  }
}

/**
 * 调用云函数
 * 使用 CloudBase JS SDK（匿名登录模式）
 * 调用失败时降级到 Mock 数据
 */
export const callFunction = async (name, data = {}) => {
  try {
    await ensureAuth()
    const cbApp = getApp()
    const result = await cbApp.callFunction({
      name,
      data
    })

    if (result && result.result) {
      const res = result.result
      if (res.code !== undefined && res.code !== 0) {
        throw new Error(res.message || '业务错误')
      }
      return res
    }
    return result
  } catch (err) {
    console.warn(`云函数 ${name} 调用失败，降级到Mock:`, err.message || err)
    const mockResult = getMockData(name, data)
    if (mockResult) return mockResult
    throw new Error(`无法处理请求: ${name}`)
  }
}
