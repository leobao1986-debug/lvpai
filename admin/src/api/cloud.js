import { getMockData } from '../utils/mockData'

const BASE_URL = import.meta.env.VITE_CLOUD_BASE_URL || ''

/**
 * 调用云函数
 * 生产环境通过 HTTP 触发器调用
 * 开发环境使用 Mock 数据
 */
export const callFunction = async (name, data = {}) => {
  // 1. 如果有 BASE_URL，通过 HTTP 调用云函数
  if (BASE_URL) {
    try {
      const token = localStorage.getItem('adminToken') || ''
      const response = await fetch(`${BASE_URL}/${name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      if (result.code !== 0) {
        throw new Error(result.message || '请求失败')
      }
      return result
    } catch (err) {
      console.warn(`云函数 ${name} HTTP调用失败，降级到Mock:`, err.message)
      // 降级到 Mock
    }
  }

  // 2. Mock 降级
  const mockResult = getMockData(name, data)
  if (mockResult) return mockResult
  throw new Error(`无法处理请求: ${name}`)
}
