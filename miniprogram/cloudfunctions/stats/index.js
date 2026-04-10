const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// HTTP 触发器入口
exports.main = async (event, context) => {
  // 添加详细日志
  console.log('[stats] ========== 云函数开始执行 ==========')
  console.log('[stats] 原始event:', JSON.stringify(event))
  console.log('[stats] event.body:', event.body)
  console.log('[stats] event.httpMethod:', event.httpMethod)
  
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
    
    let parsedBody = {}
    try {
      parsedBody = JSON.parse(event.body || '{}')
    } catch (e) {
      console.error('[stats] JSON解析失败:', e)
      parsedBody = {}
    }
    
    console.log('[stats] HTTP调用, 解析后的body:', JSON.stringify(parsedBody))
    console.log('[stats] parsedBody.action:', parsedBody.action)
    console.log('[stats] parsedBody.data:', parsedBody.data)
    
    // 构建标准格式的参数
    let body = {}
    if (parsedBody.data) {
      // 格式1: { action: 'xxx', data: { ... } }
      body = { action: parsedBody.action, data: parsedBody.data }
    } else {
      // 格式2: { action: 'xxx', id: 'xxx', ... }
      const { action, ...otherParams } = parsedBody
      body = { action: action, data: otherParams }
    }
    
    console.log('[stats] 处理后参数:', JSON.stringify(body))
    console.log('[stats] 传入handleRequest的action:', body.action)
    
    const result = await handleRequest(body, context, true)  // HTTP调用标记为true
    console.log('[stats] handleRequest返回:', JSON.stringify(result))
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
  console.log('[stats] 小程序直接调用')
  return await handleRequest(event, context, false)  // 小程序调用标记为false
}

async function handleRequest(event, context, isHttpCall = false) {
  // 支持两种参数格式：
  // 1. { action: 'xxx', data: { ... } } - 标准格式
  // 2. { action: 'xxx', id: 'xxx', ... } - 扁平格式（HTTP调用）
  let { action, data = {} } = event
  
  // 如果 data 为空但 event 中有其他参数，合并到 data
  if (Object.keys(data).length === 0) {
    const { action: _, data: __, ...otherParams } = event
    if (Object.keys(otherParams).length > 0) {
      data = { ...data, ...otherParams }
    }
  }
  
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID || event.openid || ''
  
  // 调试日志
  console.log('handleRequest called with event:', JSON.stringify(event))
  console.log('action:', action, 'type:', typeof action)
  console.log('data:', JSON.stringify(data))
  console.log('isHttpCall:', isHttpCall)
  
  // 确保 action 是字符串
  if (typeof action !== 'string') {
    console.error('action is not a string:', action)
    return { code: -1, message: '操作类型无效' }
  }
  
  // 去除可能的空白字符
  action = action.trim()
  
  try {
    switch (action) {
      case 'overview':
        return await getOverview(data, openid, isHttpCall)
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
 * 获取今日日期字符串 (YYYY-MM-DD)
 */
function getTodayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取本月起始日期
 */
function getMonthRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  const startDate = new Date(year, month, 1, 0, 0, 0)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)
  
  return { startDate, endDate }
}

/**
 * 获取数据概览（管理员）
 */
async function getOverview(data, openid, isHttpCall = false) {
  // 管理员权限校验（HTTP调用来自管理后台，已有登录保护，跳过检查）
  if (!isHttpCall) {
    const isAdminRole = await checkAdmin(openid)
    if (!isAdminRole) {
      return { code: -1, message: '无权限查看统计数据' }
    }
  }
  
  const today = getTodayString()
  const { startDate, endDate } = getMonthRange()
  
  try {
    // 1. 今日预约数
    const { total: todayBookings } = await db.collection('bookings')
      .where({
        date: today,
        status: _.neq('cancelled')
      })
      .count()
    
    // 2. 待处理订单数（已支付但未完成的预约）
    const { total: pendingOrders } = await db.collection('bookings')
      .where({
        status: 'confirmed'
      })
      .count()
    
    // 3. 本月收入（已支付订单的 depositAmount 总和）
    let monthIncome = 0
    try {
      const { list: incomeResult } = await db.collection('orders')
        .aggregate()
        .match({
          payStatus: 'paid',
          payTime: _.gte(startDate).lte(endDate)
        })
        .group({
          _id: null,
          totalIncome: $.sum('$depositAmount')
        })
        .end()
      
      if (incomeResult.length > 0) {
        monthIncome = incomeResult[0].totalIncome
      }
    } catch (err) {
      console.error('统计本月收入失败:', err)
      // 聚合失败时返回0
      monthIncome = 0
    }
    
    // 4. 客片总数
    const { total: totalGallery } = await db.collection('gallery').count()
    
    // 5. 总预约数
    const { total: totalBookings } = await db.collection('bookings').count()
    
    // 6. 总用户数
    const { total: totalUsers } = await db.collection('users').count()
    
    return {
      code: 0,
      message: 'success',
      data: {
        // 核心统计数据
        todayBookings,
        pendingOrders,
        monthIncome,
        totalGallery,
        totalBookings,
        totalUsers,
        
        // 统计时间
        statsTime: new Date()
      }
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
    return { code: -1, message: '获取统计数据失败: ' + err.message }
  }
}
