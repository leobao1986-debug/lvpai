const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// HTTP 触发器入口
exports.main = async (event, context) => {
  // HTTP 触发器处理
  if (event.httpMethod) {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CloudBase-Authorization',
        },
        body: ''
      }
    }
    const parsedBody = JSON.parse(event.body || '{}')
    console.log('[payment] HTTP调用, body:', event.body, 'parsed:', parsedBody)
    
    // 兼容两种参数格式：
    // 1. { action: 'xxx', data: { id: 'xxx' } } - 小程序格式
    // 2. { action: 'xxx', id: 'xxx' } - HTTP前端格式
    const body = parsedBody.data 
      ? parsedBody 
      : { action: parsedBody.action, data: { ...parsedBody, action: undefined } }
    delete body.data.action
    
    console.log('[payment] 处理后参数:', body)
    const result = await handleRequest(body, context)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    }
  }
  // 小程序直接调用
  return await handleRequest(event, context)
}

async function handleRequest(event, context) {
  const { action, data = {} } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID || event.openid || ''
  
  try {
    switch (action) {
      case 'createOrder':
        return await createOrder(data, openid)
      case 'paySuccess':
        return await paySuccess(data, openid)
      case 'myOrders':
        return await myOrders(data, openid)
      case 'getOrder':
        return await getOrder(data, openid)
      default:
        return { code: -1, message: `未知操作: ${action}` }
    }
  } catch (err) {
    console.error('云函数执行错误:', err)
    return { code: -1, message: err.message || '服务器内部错误' }
  }
}

/**
 * 检查是否为管理员
 */
async function checkAdmin(openid) {
  try {
    const { data } = await db.collection('users')
      .where({ openid: openid })
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
 * 生成订单编号
 * 格式: LP + Date.now() + 随机4位
 */
function generateOrderNo() {
  const timestamp = Date.now()
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `LP${timestamp}${random}`
}

/**
 * 创建支付订单
 */
async function createOrder(data, openid) {
  const { bookingId } = data
  
  if (!bookingId) {
    return { code: -1, message: '预约ID不能为空' }
  }
  
  // 查询预约
  const { data: bookings } = await db.collection('bookings')
    .where({ _id: bookingId })
    .limit(1)
    .get()
  
  if (bookings.length === 0) {
    return { code: -1, message: '预约不存在' }
  }
  
  const booking = bookings[0]
  
  // 权限校验：只能为自己的预约创建订单
  if (booking.userId !== openid) {
    return { code: -1, message: '无权限操作此预约' }
  }
  
  // 检查是否已有订单
  const { data: existingOrders } = await db.collection('orders')
    .where({ bookingId: bookingId })
    .limit(1)
    .get()
  
  if (existingOrders.length > 0) {
    return { code: -1, message: '该预约已存在订单' }
  }
  
  const now = new Date()
  
  // 创建订单
  const orderData = {
    bookingId: bookingId,
    userId: openid,
    packageId: booking.packageId,
    packageName: booking.packageName,
    totalPrice: booking.packagePrice,
    depositAmount: booking.packagePrice, // 定金为套餐价格
    payStatus: 'unpaid',
    orderNo: generateOrderNo(),
    payTime: null,
    refundTime: null,
    createTime: now
  }
  
  const { _id } = await db.collection('orders').add({
    data: orderData
  })
  
  return {
    code: 0,
    message: 'success',
    data: {
      orderId: _id,
      ...orderData
    }
  }
}

/**
 * 支付成功处理
 */
async function paySuccess(data, openid) {
  const { orderId } = data
  
  if (!orderId) {
    return { code: -1, message: '订单ID不能为空' }
  }
  
  // 查询订单
  const { data: orders } = await db.collection('orders')
    .where({ _id: orderId })
    .limit(1)
    .get()
  
  if (orders.length === 0) {
    return { code: -1, message: '订单不存在' }
  }
  
  const order = orders[0]
  
  // 权限校验
  if (order.userId !== openid) {
    return { code: -1, message: '无权限操作此订单' }
  }
  
  // 校验订单状态
  if (order.payStatus !== 'unpaid') {
    return { code: -1, message: '订单状态异常' }
  }
  
  const now = new Date()
  
  // 使用事务更新订单和预约状态
  const transaction = await db.startTransaction()
  
  try {
    // 更新订单状态
    await transaction.collection('orders').doc(orderId).update({
      data: {
        payStatus: 'paid',
        payTime: now,
        updateTime: now
      }
    })
    
    // 更新关联预约状态为 confirmed
    await transaction.collection('bookings').doc(order.bookingId).update({
      data: {
        status: 'confirmed',
        updateTime: now
      }
    })
    
    await transaction.commit()
    
    return {
      code: 0,
      message: 'success',
      data: {
        orderId: orderId,
        payStatus: 'paid',
        payTime: now
      }
    }
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

/**
 * 获取订单详情
 */
async function getOrder(data, openid) {
  const { orderId, bookingId } = data
  
  if (!orderId && !bookingId) {
    return { code: -1, message: '订单ID或预约ID不能为空' }
  }
  
  let where = {}
  if (orderId) {
    where._id = orderId
  } else {
    where.bookingId = bookingId
  }
  
  // 查询订单
  const { data: orders } = await db.collection('orders')
    .where(where)
    .limit(1)
    .get()
  
  if (orders.length === 0) {
    return { code: -1, message: '订单不存在' }
  }
  
  const order = orders[0]
  
  // 权限校验：非管理员只能查看自己的订单
  const isAdminRole = await checkAdmin(openid)
  if (!isAdminRole && order.userId !== openid) {
    return { code: -1, message: '无权限查看此订单' }
  }
  
  return {
    code: 0,
    message: 'success',
    data: order
  }
}

/**
 * 获取我的订单列表
 */
async function myOrders(data, openid) {
  const { payStatus, page = 1, pageSize = 10 } = data
  
  // 构建查询条件
  let where = {
    userId: openid
  }
  
  // 支付状态筛选
  if (payStatus) {
    where.payStatus = payStatus
  }
  
  // 查询总数
  const { total } = await db.collection('orders').where(where).count()
  
  // 查询列表
  const { data: list } = await db.collection('orders')
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
