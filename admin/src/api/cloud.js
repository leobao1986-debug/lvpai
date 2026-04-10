import { getMockData } from '../utils/mockData'

// CloudBase HTTP 访问服务基础 URL
const BASE_URL = 'https://cloud1-3g56hllb4a005c0e-1419657853.ap-shanghai.app.tcloudbase.com'

/**
 * 调用云函数
 * 通过 CloudBase HTTP 访问服务调用
 * 调用失败时降级到 Mock 数据
 */
export const callFunction = async (name, data = {}) => {
  try {
    const response = await fetch(`${BASE_URL}/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    // 云函数通过 HTTP 访问服务返回时，结果可能在不同层级
    // 检查是否有嵌套的 result
    const res = result.result || result
    
    if (res.code !== undefined && res.code !== 0) {
      throw new Error(res.message || '业务错误')
    }
    return res
  } catch (err) {
    console.warn(`云函数 ${name} 调用失败，降级到Mock:`, err.message || err)
    const mockResult = getMockData(name, data)
    if (mockResult) return mockResult
    throw new Error(`无法处理请求: ${name}`)
  }
}
