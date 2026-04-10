import cloudbase from '@cloudbase/js-sdk'
import { getMockData } from '../utils/mockData'

// 初始化 CloudBase
let app = null

function getApp() {
  if (!app) {
    app = cloudbase.init({
      env: 'cloud1-3g56hllb4a005c0e'
    })
  }
  return app
}

/**
 * 调用云函数
 * 使用 CloudBase JS SDK 直接调用（未登录模式）
 * 调用失败时降级到 Mock 数据
 */
export const callFunction = async (name, data = {}) => {
  try {
    const cbApp = getApp()
    const result = await cbApp.callFunction({
      name,
      data
    })

    if (result && result.result) {
      const res = result.result
      // 检查业务错误
      if (res.code !== undefined && res.code !== 0) {
        throw new Error(res.message || '业务错误')
      }
      return res
    }
    return result
  } catch (err) {
    console.warn(`云函数 ${name} 调用失败，降级到Mock:`, err.message || err)
    // 降级到 Mock 数据
    const mockResult = getMockData(name, data)
    if (mockResult) return mockResult
    throw new Error(`无法处理请求: ${name}`)
  }
}
