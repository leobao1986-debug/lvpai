/**
 * 常量定义
 */

// 套餐分类
export const PACKAGE_CATEGORIES = [
  { value: 'basic', label: '陵前印记', icon: '🏛️' },
  { value: 'advanced', label: '草原征途', icon: '🌾' },
  { value: 'family', label: '家族传承', icon: '👨‍👩‍👧‍👦' },
  { value: 'vip', label: '定制旅拍', icon: '👑' }
]

// 客片分类
export const GALLERY_CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'mausoleum', label: '陵前写真' },
  { value: 'grassland', label: '草原旅拍' },
  { value: 'couple', label: '情侣私奔' },
  { value: 'children', label: '儿童成长' }
]

// 预约时段 - 按小时划分
export const TIME_SLOTS = [
  { value: '08:00', label: '08:00-09:00', period: 'morning' },
  { value: '09:00', label: '09:00-10:00', period: 'morning' },
  { value: '10:00', label: '10:00-11:00', period: 'morning' },
  { value: '11:00', label: '11:00-12:00', period: 'morning' },
  { value: '13:00', label: '13:00-14:00', period: 'afternoon' },
  { value: '14:00', label: '14:00-15:00', period: 'afternoon' },
  { value: '15:00', label: '15:00-16:00', period: 'afternoon' },
  { value: '16:00', label: '16:00-17:00', period: 'afternoon' },
  { value: '17:00', label: '17:00-18:00', period: 'golden' },
  { value: '18:00', label: '18:00-19:00', period: 'golden' },
  { value: '19:00', label: '19:00-20:00', period: 'golden' }
]

// 根据时段值获取标签
export const getTimeSlotLabel = (value) => {
  const slot = TIME_SLOTS.find(s => s.value === value)
  return slot ? slot.label : value
}

// 预约状态
export const BOOKING_STATUS = {
  pending: { label: '待确认', color: '#ff976a' },
  confirmed: { label: '已确认', color: '#07c160' },
  shooting: { label: '拍摄中', color: '#ff976a' },
  retouching: { label: '修片中', color: '#ff976a' },
  completed: { label: '已完成', color: '#999999' },
  cancelled: { label: '已取消', color: '#ee0a24' }
}

// 支付状态
export const PAY_STATUS = {
  unpaid: { label: '待支付', color: '#ff976a' },
  paid: { label: '已支付', color: '#07c160' },
  refunded: { label: '已退款', color: '#999999' }
}

// 订单状态
export const ORDER_STATUS = {
  pending: { label: '待支付', color: '#ff976a' },
  paid: { label: '已支付定金', color: '#1989fa' },
  confirmed: { label: '已确认', color: '#07c160' },
  shooting: { label: '拍摄中', color: '#ff976a' },
  retouching: { label: '修片中', color: '#ff976a' },
  completed: { label: '已完成', color: '#07c160' },
  cancelled: { label: '已取消', color: '#999999' },
  refunded: { label: '已退款', color: '#ee0a24' }
}

// 店铺信息
export const STORE_INFO = {
  name: '朵兰摄影·静安雨霞',
  address: '内蒙古鄂尔多斯市伊金霍洛旗成吉思汗陵旅游区',
  phone: '',
  latitude: 39.5883,
  longitude: 109.8023,
  businessHours: {
    peak: '旺季 8:00-20:00',
    offPeak: '淡季 9:00-18:00'
  }
}

// Slogan
export const SLOGAN = '在成吉思汗陵，穿一身盛装，定格草原传奇。'
