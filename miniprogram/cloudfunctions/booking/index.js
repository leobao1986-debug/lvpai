const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 时段配置 - 按小时划分
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00'
]
const MAX_BOOKINGS_PER_SLOT = 1 // 每个时段最多接1组拍摄

/**
 * 生成订单编号
 * 格式: LP + 年月日时分秒 + 4位随机数
 * 例如: LP202604081234560001
 */
function generateOrderNo() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  
  return `LP${year}${month}${day}${hours}${minutes}${seconds}${random}`
}

/**
 * 检查是否为管理员
 */
async function checkAdmin(openid) {
  try {
    const { data } = await db.collection('users')
      .where({ _openid: openid })
      .limit(1)
      .get()
    
    if (data.length === 0) return false
    const role = data[0].role
    return role === 'admin' || role === 'superAdmin'
  } catch (err) {
    console.error('检查管理员权限失败:', err)
    return false
  }
}

/**
 * 检查时段是否已满
 */
async function checkSlotAvailability(date, timeSlot) {
  const { total } = await db.collection('bookings')
    .where({
      date: date,
      timeSlot: timeSlot,
      status: _.neq('cancelled')
    })
    .count()
  
  return {
    booked: total,
    available: Math.max(0, MAX_BOOKINGS_PER_SLOT - total),
    isFull: total >= MAX_BOOKINGS_PER_SLOT
  }
}

exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const OPENID = wxContext.OPENID
  
  try {
    switch (action) {
      case 'create':
        return await createBooking(data, OPENID)
      case 'list':
        return await listBookings(data, OPENID)
      case 'detail':
        return await getBookingDetail(data, OPENID)
      case 'cancel':
        return await cancelBooking(data, OPENID)
      case 'updateStatus':
        return await updateBookingStatus(data, OPENID)
      case 'availableSlots':
        return await getAvailableSlots(data)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (err) {
    console.error('云函数执行错误:', err)
    return { code: -1, message: err.message || '服务器内部错误' }
  }
}

/**
 * 创建预约
 */
async function createBooking(data, OPENID) {
  const { packageId, date, timeSlot, contactName, contactPhone, persons, remark = '' } = data
  
  // 校验必填项
  if (!packageId) return { code: -1, message: '请选择套餐' }
  if (!date) return { code: -1, message: '请选择预约日期' }
  if (!timeSlot) return { code: -1, message: '请选择预约时段' }
  if (!contactName) return { code: -1, message: '请填写联系人姓名' }
  if (!contactPhone) return { code: -1, message: '请填写联系人电话' }
  if (!persons || persons < 1) return { code: -1, message: '请填写拍摄人数' }
  
  // 校验时段有效性
  if (!TIME_SLOTS.includes(timeSlot)) {
    return { code: -1, message: '无效的预约时段' }
  }
  
  // 校验该日期+时段是否已满
  const slotStatus = await checkSlotAvailability(date, timeSlot)
  if (slotStatus.isFull) {
    return { code: -1, message: '该时段预约已满，请选择其他时段' }
  }
  
  // 查询套餐信息
  const { data: packages } = await db.collection('packages')
    .where({ _id: packageId })
    .limit(1)
    .get()
  
  if (packages.length === 0) {
    return { code: -1, message: '套餐不存在' }
  }
  
  const packageInfo = packages[0]
  const now = new Date()
  
  // 创建预约记录
  const bookingData = {
    userId: OPENID,
    packageId: packageId,
    packageName: packageInfo.name,
    packagePrice: packageInfo.price,
    date: date,
    timeSlot: timeSlot,
    contactName: contactName,
    contactPhone: contactPhone,
    persons: persons,
    status: 'pending',
    remark: remark,
    createTime: now,
    updateTime: now
  }
  
  // 使用事务确保数据一致性
  const transaction = await db.startTransaction()
  
  try {
    // 再次检查时段是否已满（防止并发）
    const { total } = await transaction.collection('bookings')
      .where({
        date: date,
        timeSlot: timeSlot,
        status: _.neq('cancelled')
      })
      .count()
    
    if (total >= MAX_BOOKINGS_PER_SLOT) {
      await transaction.rollback()
      return { code: -1, message: '该时段预约已满，请选择其他时段' }
    }
    
    // 创建预约
    const bookingRes = await transaction.collection('bookings').add({
      data: bookingData
    })
    
    // 创建订单
    const orderData = {
      bookingId: bookingRes._id,
      userId: OPENID,
      packageId: packageId,
      packageName: packageInfo.name,
      totalPrice: packageInfo.price,
      depositAmount: packageInfo.deposit || packageInfo.price,
      payStatus: 'unpaid',
      orderNo: generateOrderNo(),
      payTime: null,
      refundTime: null,
      createTime: now
    }
    
    const orderRes = await transaction.collection('orders').add({
      data: orderData
    })
    
    await transaction.commit()
    
    return {
      code: 0,
      message: 'success',
      data: {
        booking: { _id: bookingRes._id, ...bookingData },
        order: { _id: orderRes._id, ...orderData }
      }
    }
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

/**
 * 查询预约列表
 */
async function listBookings(data, OPENID) {
  const { isAdmin, status, date, page = 1, pageSize = 10 } = data
  
  // 构建查询条件
  let where = {}
  
  // 非管理员只能查看自己的预约
  if (!isAdmin) {
    where.userId = OPENID
  } else {
    // 管理员权限校验
    const isAdminRole = await checkAdmin(OPENID)
    if (!isAdminRole) {
      return { code: -1, message: '无权限查看全部预约' }
    }
  }
  
  // 状态筛选
  if (status) {
    where.status = status
  }
  
  // 日期筛选
  if (date) {
    where.date = date
  }
  
  // 查询总数
  const { total } = await db.collection('bookings').where(where).count()
  
  // 查询列表
  const { data: list } = await db.collection('bookings')
    .where(where)
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  return {
    code: 0,
    message: 'success',
    data: {
      list,
      total,
      page,
      pageSize
    }
  }
}

/**
 * 获取预约详情
 */
async function getBookingDetail(data, OPENID) {
  const { id } = data
  
  if (!id) {
    return { code: -1, message: '预约ID不能为空' }
  }
  
  // 查询预约详情
  const { data: bookings } = await db.collection('bookings')
    .where({ _id: id })
    .limit(1)
    .get()
  
  if (bookings.length === 0) {
    return { code: -1, message: '预约不存在' }
  }
  
  const booking = bookings[0]
  
  // 权限校验：非管理员只能查看自己的预约
  const isAdminRole = await checkAdmin(OPENID)
  if (!isAdminRole && booking.userId !== OPENID) {
    return { code: -1, message: '无权限查看此预约' }
  }
  
  // 查询关联的订单信息
  const { data: orders } = await db.collection('orders')
    .where({ bookingId: id })
    .limit(1)
    .get()
  
  return {
    code: 0,
    message: 'success',
    data: {
      booking,
      order: orders.length > 0 ? orders[0] : null
    }
  }
}

/**
 * 取消预约
 */
async function cancelBooking(data, OPENID) {
  const { id } = data
  
  if (!id) {
    return { code: -1, message: '预约ID不能为空' }
  }
  
  // 查询预约
  const { data: bookings } = await db.collection('bookings')
    .where({ _id: id })
    .limit(1)
    .get()
  
  if (bookings.length === 0) {
    return { code: -1, message: '预约不存在' }
  }
  
  const booking = bookings[0]
  
  // 权限校验
  const isAdminRole = await checkAdmin(OPENID)
  if (!isAdminRole && booking.userId !== OPENID) {
    return { code: -1, message: '无权限取消此预约' }
  }
  
  // 已完成的预约不能取消
  if (booking.status === 'completed') {
    return { code: -1, message: '已完成的预约无法取消' }
  }
  
  // 已取消的预约不能重复取消
  if (booking.status === 'cancelled') {
    return { code: -1, message: '预约已取消' }
  }
  
  const now = new Date()
  
  // 查询关联订单
  const { data: orders } = await db.collection('orders')
    .where({ bookingId: id })
    .limit(1)
    .get()
  
  const order = orders.length > 0 ? orders[0] : null
  const needRefund = order && order.payStatus === 'paid'
  
  // 更新预约状态
  await db.collection('bookings').doc(id).update({
    data: {
      status: 'cancelled',
      updateTime: now,
      cancelTime: now,
      cancelBy: isAdminRole ? 'admin' : 'user'
    }
  })
  
  // 如果订单已支付，标记需退款
  if (needRefund) {
    await db.collection('orders').doc(order._id).update({
      data: {
        payStatus: 'refunding',
        refundTime: now,
        updateTime: now
      }
    })
  }
  
  return {
    code: 0,
    message: 'success',
    data: {
      bookingId: id,
      cancelled: true,
      needRefund: needRefund,
      refundMessage: needRefund ? '请联系客服处理退款' : null
    }
  }
}

/**
 * 更新预约状态（管理员）
 */
async function updateBookingStatus(data, OPENID) {
  const { id, status } = data
  
  // 管理员权限校验
  const isAdminRole = await checkAdmin(OPENID)
  if (!isAdminRole) {
    return { code: -1, message: '无权限执行此操作' }
  }
  
  if (!id) {
    return { code: -1, message: '预约ID不能为空' }
  }
  
  // 校验状态有效性
  const validStatuses = ['pending', 'confirmed', 'shooting', 'retouching', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    return { code: -1, message: '无效的预约状态' }
  }
  
  // 查询预约
  const { data: bookings } = await db.collection('bookings')
    .where({ _id: id })
    .limit(1)
    .get()
  
  if (bookings.length === 0) {
    return { code: -1, message: '预约不存在' }
  }
  
  const now = new Date()
  
  // 更新预约状态
  await db.collection('bookings').doc(id).update({
    data: {
      status: status,
      updateTime: now
    }
  })
  
  return {
    code: 0,
    message: 'success',
    data: {
      bookingId: id,
      status: status,
      updateTime: now
    }
  }
}

/**
 * 获取可用时段
 */
async function getAvailableSlots(data) {
  const { date } = data
  
  if (!date) {
    return { code: -1, message: '日期不能为空' }
  }
  
  // 查询该日期所有已确认的预约
  const { data: bookings } = await db.collection('bookings')
    .where({ 
      date,
      status: _.in(['pending', 'confirmed', 'shooting'])
    })
    .get()
  
  // 统计每个时段的预约
  const bookedSlots = bookings.map(b => b.timeSlot)
  
  return {
    code: 0,
    message: 'success',
    data: {
      date,
      bookedSlots  // 返回已预约的时段值列表
    }
  }
}
