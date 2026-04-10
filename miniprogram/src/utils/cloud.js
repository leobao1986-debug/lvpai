/**
 * 云开发 API 封装
 * 本地开发环境自动使用 Mock 数据兜底
 */

import { 
  MOCK_PACKAGES, 
  MOCK_GALLERY, 
  MOCK_BOOKINGS, 
  MOCK_ORDERS, 
  MOCK_AVAILABLE_SLOTS, 
  MOCK_STATS, 
  MOCK_USERS,
  MOCK_BANNERS,
  MOCK_SCENES
} from './mockData'

// 根据云函数名称和动作返回对应的 Mock 数据
const getMockData = (name, data) => {
  const action = data?.action || ''
  
  switch (name) {
    case 'user':
      if (action === 'login') {
        // 支持传入用户资料的登录
        const profileData = data?.data || {}
        const mockUser = {
          _id: 'u' + Date.now().toString(36).slice(-6), // 短ID
          ...MOCK_USERS.user,
          nickname: profileData.nickname || '微信用户',
          avatar: profileData.avatar || MOCK_USERS.user.avatar,
          lastLoginTime: new Date().toISOString()
        }
        return { code: 0, message: 'success', data: mockUser }
      }
      if (action === 'getProfile') {
        return { code: 0, message: 'success', data: MOCK_USERS.user }
      }
      if (action === 'updateProfile') {
        return { code: 0, message: 'success', data: { ...MOCK_USERS.user, ...data?.data } }
      }
      break
    
    case 'package':
      if (action === 'list') {
        let list = [...MOCK_PACKAGES]
        if (data?.data?.category) {
          list = list.filter(p => p.category === data.data.category)
        }
        return { code: 0, message: 'success', data: { list } }
      }
      if (action === 'detail') {
        const pkg = MOCK_PACKAGES.find(p => p._id === data?.data?.id) || MOCK_PACKAGES[0]
        return { code: 0, message: 'success', data: pkg }
      }
      break
    
    case 'gallery':
      if (action === 'list') {
        let list = [...MOCK_GALLERY]
        const category = data?.data?.category
        if (category) {
          list = list.filter(g => g.category === category)
        }
        const page = data?.data?.page || 1
        const pageSize = data?.data?.pageSize || 10
        const start = (page - 1) * pageSize
        const paged = list.slice(start, start + pageSize)
        return { code: 0, message: 'success', data: { list: paged, total: list.length } }
      }
      if (action === 'detail') {
        const item = MOCK_GALLERY.find(g => g._id === data?.data?.id) || MOCK_GALLERY[0]
        return { code: 0, message: 'success', data: item }
      }
      break
    
    case 'booking':
      if (action === 'create') {
        const newBooking = { 
          _id: 'booking_new_' + Date.now(), 
          ...data?.data, 
          status: 'pending', 
          createTime: new Date().toISOString() 
        }
        const newOrder = { 
          _id: 'order_new_' + Date.now(), 
          bookingId: newBooking._id, 
          orderNo: 'LP' + Date.now(), 
          depositAmount: newBooking.depositAmount || 99, 
          payStatus: 'unpaid', 
          totalPrice: newBooking.totalPrice || 299, 
          createTime: new Date().toISOString() 
        }
        return { code: 0, message: 'success', data: { booking: newBooking, order: newOrder } }
      }
      if (action === 'list') {
        return { code: 0, message: 'success', data: { list: MOCK_BOOKINGS, total: MOCK_BOOKINGS.length } }
      }
      if (action === 'detail') {
        const booking = MOCK_BOOKINGS.find(b => b._id === data?.data?.id) || MOCK_BOOKINGS[0]
        return { code: 0, message: 'success', data: booking }
      }
      if (action === 'availableSlots') {
        // 返回已预约的时段列表
        return { code: 0, message: 'success', data: { bookedSlots: MOCK_AVAILABLE_SLOTS.bookedSlots } }
      }
      if (action === 'cancel') {
        return { code: 0, message: 'success', data: {} }
      }
      break
    
    case 'payment':
      if (action === 'createOrder') {
        return { 
          code: 0, 
          message: 'success', 
          data: { 
            orderId: 'order_mock_' + Date.now(),
            orderNo: 'LP' + Date.now()
          } 
        }
      }
      if (action === 'paySuccess') {
        return { code: 0, message: 'success', data: { payStatus: 'paid' } }
      }
      if (action === 'getOrder') {
        const order = MOCK_ORDERS.find(o => o._id === data?.data?.orderId) || MOCK_ORDERS[0]
        return { code: 0, message: 'success', data: order }
      }
      if (action === 'myOrders') {
        return { code: 0, message: 'success', data: { list: MOCK_ORDERS, total: MOCK_ORDERS.length } }
      }
      break
    
    case 'stats':
      if (action === 'overview') {
        return { code: 0, message: 'success', data: MOCK_STATS }
      }
      break
      
    case 'notify':
      if (action === 'getSubscribeStatus') {
        return { code: 0, message: 'success', data: { isSubscribed: false, remainCount: 0 } }
      }
      if (action === 'subscribe') {
        return { code: 0, message: 'success', data: { isSubscribed: true } }
      }
      return { code: 0, message: 'success', data: {} }
    
    case 'banner':
      return { code: 0, message: 'success', data: { list: MOCK_BANNERS } }
    
    case 'scene':
      return { code: 0, message: 'success', data: { list: MOCK_SCENES } }
  }
  
  return null
}

// 调用云函数
export const callFunction = (name, data = {}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        if (res.result && res.result.code === 0) {
          resolve(res.result)
        } else if (res.result) {
          reject(res.result)
        } else {
          resolve(res)
        }
      },
      fail: (err) => {
        console.warn(`云函数 ${name} 调用失败，尝试使用Mock数据:`, err.errMsg || err)
        // Mock 兜底 - 本地开发环境使用
        const mockResult = getMockData(name, data)
        if (mockResult) {
          console.log(`[Mock] ${name}.${data?.action || 'default'} 返回模拟数据`)
          resolve(mockResult)
        } else {
          reject(err)
        }
      }
    })
  })
}

// 上传文件到云存储
export const uploadFile = (filePath, cloudPath) => {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      filePath,
      cloudPath,
      success: (res) => resolve(res.fileID),
      fail: (err) => reject(err)
    })
  })
}

// 获取临时文件链接
export const getTempFileURL = (fileList) => {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList,
      success: (res) => resolve(res.fileList),
      fail: (err) => reject(err)
    })
  })
}

// 删除云文件
export const deleteFile = (fileList) => {
  return new Promise((resolve, reject) => {
    wx.cloud.deleteFile({
      fileList,
      success: (res) => resolve(res.fileList),
      fail: (err) => reject(err)
    })
  })
}

// 获取数据库引用 (小程序端直接操作，仅用于简单读取)
export const getDB = () => {
  return wx.cloud.database()
}
