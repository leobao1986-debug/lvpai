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

/**
 * 订阅消息模板ID
 * 
 * 使用说明：
 * 1. 登录微信公众平台 -> 订阅消息 -> 公共模板库
 * 2. 搜索并选用以下模板：
 *    - 新订单通知：包含「客户姓名」「预约套餐」「预约日期」「预约时段」「定金金额」字段
 *    - 预约状态变更通知：包含「套餐名称」「预约状态」「预约日期」「备注说明」字段
 * 3. 复制模板ID填入下方对应位置
 * 4. 注意：模板ID上线前必须替换为真实的ID，否则订阅消息无法发送
 */
export const SUBSCRIBE_TEMPLATE = {
  // 新订单通知模板（通知管理员）
  // 模板示例：客户姓名、预约套餐、预约日期、预约时段、定金金额
  NEW_ORDER: {
    templateId: '', // 需要在微信公众平台申请后填入
    // 模板字段映射说明（根据实际申请的模板调整）：
    // thing1 - 客户姓名
    // thing2 - 预约套餐
    // date3 - 预约日期
    // thing4 - 预约时段
    // amount5 - 定金金额
  },
  // 预约状态变更通知（通知用户）
  // 模板示例：套餐名称、预约状态、预约日期、备注说明
  BOOKING_STATUS_CHANGE: {
    templateId: '', // 需要在微信公众平台申请后填入
    // 模板字段映射说明（根据实际申请的模板调整）：
    // thing1 - 套餐名称
    // phrase2 - 预约状态
    // date3 - 预约日期
    // thing4 - 备注说明
  }
}
