import { getMockData } from '../utils/mockData'

const BASE_URL = import.meta.env.VITE_CLOUD_BASE_URL || ''

/**
 * 调用云函数
 * 生产环境通过 HTTP 触发器调用
 * 开发环境使用 Mock 数据
 */
export const callFunction = async (name, data = {}) => {
  // 如果有云环境 URL，走 HTTP 调用
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (result.code === 0) return result
      throw new Error(result.message || '请求失败')
    } catch (err) {
      console.warn(`云函数 ${name} 调用失败，使用 Mock:`, err)
    }
  }
  
  // Mock 兜底
  const mockResult = getMockData(name, data)
  if (mockResult) {
    console.log(`[Mock] ${name}.${data?.action}`)
    return mockResult
  }
  throw new Error(`无法处理请求: ${name}.${data?.action}`)
}
