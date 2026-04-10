const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

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

exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const OPENID = wxContext.OPENID
  
  try {
    switch (action) {
      case 'overview':
        return await getOverview(data, OPENID)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (err) {
    console.error('云函数执行错误:', err)
    return { code: -1, message: err.message || '服务器内部错误' }
  }
}

/**
 * 获取数据概览（管理员）
 */
async function getOverview(data, OPENID) {
  // 管理员权限校验
  const isAdminRole = await checkAdmin(OPENID)
  if (!isAdminRole) {
    return { code: -1, message: '无权限查看统计数据' }
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
    
    // 获取各状态预约数量统计
    const statusStats = await getBookingStatusStats()
    
    // 获取最近7天预约趋势
    const weeklyTrend = await getWeeklyBookingTrend()
    
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
        
        // 附加统计
        statusStats,
        weeklyTrend,
        
        // 统计时间
        statsTime: new Date()
      }
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
    return { code: -1, message: '获取统计数据失败: ' + err.message }
  }
}

/**
 * 获取各状态预约数量统计
 */
async function getBookingStatusStats() {
  const stats = {
    pending: 0,
    confirmed: 0,
    shooting: 0,
    retouching: 0,
    completed: 0,
    cancelled: 0
  }
  
  try {
    // 由于云开发聚合能力有限，分别查询各状态数量
    const statuses = ['pending', 'confirmed', 'shooting', 'retouching', 'completed', 'cancelled']
    
    for (const status of statuses) {
      const { total } = await db.collection('bookings')
        .where({ status })
        .count()
      stats[status] = total
    }
  } catch (err) {
    console.error('获取状态统计失败:', err)
  }
  
  return stats
}

/**
 * 获取最近7天预约趋势
 */
async function getWeeklyBookingTrend() {
  const trend = []
  const today = new Date()
  
  try {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      const { total } = await db.collection('bookings')
        .where({
          date: dateStr,
          status: _.neq('cancelled')
        })
        .count()
      
      trend.push({
        date: dateStr,
        count: total
      })
    }
  } catch (err) {
    console.error('获取趋势数据失败:', err)
  }
  
  return trend
}
