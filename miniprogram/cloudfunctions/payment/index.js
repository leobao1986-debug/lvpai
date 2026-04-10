const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

/**
 * 订阅消息模板ID配置
 * 注意：需要在微信公众平台申请订阅消息模板后，将模板ID填入此处
 * 模板申请路径：微信公众平台 -> 订阅消息 -> 公共模板库
 */
const SUBSCRIBE_TEMPLATES = {
  // 新订单通知模板ID（通知管理员）
  // 需要包含字段：客户姓名、预约套餐、预约日期、预约时段、定金金额
  NEW_ORDER: '' // 上线前需替换为真实模板ID
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

exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const OPENID = wxContext.OPENID
  
  try {
    switch (action) {
      case 'createOrder':
        return await createPayment(data, OPENID)
      case 'paySuccess':
        return await paySuccess(data, OPENID)
      case 'callback':
        return await paymentCallback(data)
      case 'refund':
        return await refundOrder(data, OPENID)
      case 'getOrder':
        return await getOrder(data, OPENID)
      case 'myOrders':
        return await myOrders(data, OPENID)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (err) {
    console.error('云函数执行错误:', err)
    return { code: -1, message: err.message || '服务器内部错误' }
  }
}

/**
 * 创建支付订单
 * 
 * 注意：由于微信云开发支付需要商户号配置，这里先实现模拟支付逻辑
 * 真实接入方式：
 * 1. 在小程序后台配置微信支付商户号
 * 2. 使用 cloud.cloudPay.unifiedOrder 调用统一下单接口
 * 3. 获取 prepay_id 后生成支付参数返回给前端
 * 
 * 参考文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/open/pay/Cloud.CloudPay.unifiedOrder.html
 */
async function createPayment(data, OPENID) {
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
  
  // 权限校验：只能支付自己的订单
  if (order.userId !== OPENID) {
    return { code: -1, message: '无权限支付此订单' }
  }
  
  // 校验订单状态
  if (order.payStatus !== 'unpaid') {
    return { code: -1, message: '订单状态异常，无法支付' }
  }
  
  // ==========================================
  // 模拟支付逻辑（开发测试用）
  // ==========================================
  
  // 模拟支付参数
  const mockPaymentParams = {
    timeStamp: String(Date.now()),
    nonceStr: Math.random().toString(36).substr(2, 15),
    package: `prepay_id=mock_${orderId}_${Date.now()}`,
    signType: 'RSA',
    paySign: 'mock_sign_' + Math.random().toString(36).substr(2, 10)
  }
  
  // ==========================================
  // 真实支付接入代码（需要配置商户号后使用）
  // ==========================================
  /*
  try {
    const res = await cloud.cloudPay.unifiedOrder({
      body: `旅拍套餐 - ${order.packageName}`,
      outTradeNo: order.orderNo,
      spbillCreateIp: '127.0.0.1',
      subMchId: '你的子商户号',
      totalFee: order.depositAmount * 100, // 单位为分
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'payment', // 支付回调云函数名
    })
    
    if (res.returnCode === 'SUCCESS' && res.resultCode === 'SUCCESS') {
      // 获取 prepay_id 后生成支付参数
      const paymentParams = {
        timeStamp: String(Date.now()),
        nonceStr: res.nonceStr,
        package: `prepay_id=${res.prepayId}`,
        signType: 'RSA',
        paySign: res.paySign
      }
      
      return {
        code: 0,
        message: 'success',
        data: {
          orderId: orderId,
          orderNo: order.orderNo,
          paymentParams: paymentParams,
          totalPrice: order.totalPrice,
          depositAmount: order.depositAmount
        }
      }
    } else {
      return { code: -1, message: res.returnMsg || '创建支付订单失败' }
    }
  } catch (err) {
    console.error('创建支付订单失败:', err)
    return { code: -1, message: '创建支付订单失败' }
  }
  */
  
  // 返回模拟支付参数
  return {
    code: 0,
    message: 'success',
    data: {
      orderId: orderId,
      orderNo: order.orderNo,
      paymentParams: mockPaymentParams,
      totalPrice: order.totalPrice,
      depositAmount: order.depositAmount,
      isMock: true, // 标记为模拟支付
      mockMessage: '当前为模拟支付模式，真实支付需要配置微信支付商户号'
    }
  }
}

/**
 * 支付成功回调处理
 * 用于前端调用支付成功后更新订单状态
 */
async function paySuccess(data, OPENID) {
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
  if (order.userId !== OPENID) {
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
    
    // ==========================================
    // 发送新订单通知给管理员
    // 失败不影响主流程，仅记录日志
    // ==========================================
    try {
      // 获取预约信息
      const { data: bookings } = await db.collection('bookings')
        .where({ _id: order.bookingId })
        .limit(1)
        .get()
      
      if (bookings.length > 0 && SUBSCRIBE_TEMPLATES.NEW_ORDER) {
        const booking = bookings[0]
        
        // 调用 notify 云函数发送通知
        await cloud.callFunction({
          name: 'notify',
          data: {
            action: 'sendNewOrderNotify',
            data: {
              contactName: booking.contactName || order.contactName || '客户',
              packageName: order.packageName || '未知套餐',
              date: booking.date || '',
              timeSlot: booking.timeSlot || '',
              depositAmount: order.depositAmount || 0,
              orderId: orderId,
              templateId: SUBSCRIBE_TEMPLATES.NEW_ORDER
            }
          }
        })
        console.log('新订单通知发送成功')
      }
    } catch (notifyErr) {
      // 通知发送失败不影响支付成功的主流程
      console.error('发送新订单通知失败:', notifyErr)
    }
    
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
 * 微信支付回调处理
 * 
 * 注意：这是微信支付服务器主动推送的回调，需要在云函数中处理
 * 
 * 真实接入方式：
 * 1. 在 cloud.cloudPay.unifiedOrder 中设置 functionName 为当前云函数名
 * 2. 微信服务器会在支付成功后自动调用此云函数
 * 3. 解析回调数据，验证签名，更新订单状态
 * 
 * 回调数据格式参考：https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=9_7&index=8
 */
async function paymentCallback(data) {
  // ==========================================
  // 真实支付回调处理代码（需要配置商户号后使用）
  // ==========================================
  /*
  const { returnCode, resultCode, outTradeNo, transactionId, timeEnd } = data
  
  // 校验返回状态
  if (returnCode !== 'SUCCESS') {
    console.error('支付回调返回失败:', data)
    return { code: 'FAIL', message: '返回状态失败' }
  }
  
  // 校验业务结果
  if (resultCode !== 'SUCCESS') {
    console.error('支付回调业务失败:', data)
    return { code: 'FAIL', message: '业务结果失败' }
  }
  
  try {
    // 查询订单
    const { data: orders } = await db.collection('orders')
      .where({ orderNo: outTradeNo })
      .limit(1)
      .get()
    
    if (orders.length === 0) {
      console.error('支付回调：订单不存在', outTradeNo)
      return { code: 'FAIL', message: '订单不存在' }
    }
    
    const order = orders[0]
    
    // 如果订单已支付，直接返回成功
    if (order.payStatus === 'paid') {
      return { code: 'SUCCESS', message: 'OK' }
    }
    
    const now = new Date()
    
    // 更新订单状态
    await db.collection('orders').doc(order._id).update({
      data: {
        payStatus: 'paid',
        payTime: now,
        transactionId: transactionId,
        updateTime: now
      }
    })
    
    // 更新关联预约状态
    await db.collection('bookings').doc(order.bookingId).update({
      data: {
        status: 'confirmed',
        updateTime: now
      }
    })
    
    return { code: 'SUCCESS', message: 'OK' }
  } catch (err) {
    console.error('支付回调处理失败:', err)
    return { code: 'FAIL', message: '处理失败' }
  }
  */
  
  // 当前为模拟模式，直接返回
  return {
    code: 0,
    message: 'success',
    data: {
      message: '当前为模拟支付模式，无需处理真实回调',
      receivedData: data
    }
  }
}

/**
 * 退款处理（管理员）
 * 
 * 真实接入方式：
 * 1. 使用 cloud.cloudPay.refund 调用退款接口
 * 2. 需要证书配置
 * 
 * 参考文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/open/pay/Cloud.CloudPay.refund.html
 */
async function refundOrder(data, OPENID) {
  const { orderId } = data
  
  // 管理员权限校验
  const isAdminRole = await checkAdmin(OPENID)
  if (!isAdminRole) {
    return { code: -1, message: '无权限执行此操作' }
  }
  
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
  
  // 校验订单状态
  if (order.payStatus !== 'paid') {
    return { code: -1, message: '订单未支付，无法退款' }
  }
  
  const now = new Date()
  
  // ==========================================
  // 真实退款接入代码（需要配置商户号后使用）
  // ==========================================
  /*
  try {
    const res = await cloud.cloudPay.refund({
      outTradeNo: order.orderNo,
      outRefundNo: `REFUND_${order.orderNo}_${Date.now()}`,
      subMchId: '你的子商户号',
      totalFee: order.depositAmount * 100, // 单位为分
      refundFee: order.depositAmount * 100, // 单位为分
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'payment', // 退款回调云函数名
    })
    
    if (res.returnCode === 'SUCCESS' && res.resultCode === 'SUCCESS') {
      // 更新订单状态
      await db.collection('orders').doc(orderId).update({
        data: {
          payStatus: 'refunded',
          refundTime: now,
          updateTime: now
        }
      })
      
      // 更新关联预约状态为 cancelled
      await db.collection('bookings').doc(order.bookingId).update({
        data: {
          status: 'cancelled',
          updateTime: now
        }
      })
      
      return {
        code: 0,
        message: 'success',
        data: {
          orderId: orderId,
          refundStatus: 'refunded',
          refundTime: now
        }
      }
    } else {
      return { code: -1, message: res.returnMsg || '退款失败' }
    }
  } catch (err) {
    console.error('退款失败:', err)
    return { code: -1, message: '退款失败' }
  }
  */
  
  // 模拟退款处理
  // 更新订单状态
  await db.collection('orders').doc(orderId).update({
    data: {
      payStatus: 'refunded',
      refundTime: now,
      updateTime: now
    }
  })
  
  // 更新关联预约状态为 cancelled
  await db.collection('bookings').doc(order.bookingId).update({
    data: {
      status: 'cancelled',
      updateTime: now
    }
  })
  
  return {
    code: 0,
    message: 'success',
    data: {
      orderId: orderId,
      refundStatus: 'refunded',
      refundTime: now,
      isMock: true,
      mockMessage: '当前为模拟退款模式，真实退款需要配置微信支付商户号'
    }
  }
}

/**
 * 获取订单详情
 */
async function getOrder(data, OPENID) {
  const { orderId, orderNo } = data
  
  if (!orderId && !orderNo) {
    return { code: -1, message: '订单ID或订单编号不能为空' }
  }
  
  let where = {}
  if (orderId) {
    where._id = orderId
  } else {
    where.orderNo = orderNo
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
  const isAdminRole = await checkAdmin(OPENID)
  if (!isAdminRole && order.userId !== OPENID) {
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
async function myOrders(data, OPENID) {
  const { payStatus, page = 1, pageSize = 10 } = data
  
  // 构建查询条件
  let where = {
    userId: OPENID
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
