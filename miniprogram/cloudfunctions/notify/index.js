const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

/**
 * 订阅消息通知云函数
 * 
 * 功能：
 * 1. subscribe - 管理员订阅新订单通知
 * 2. sendNewOrderNotify - 发送新订单通知给管理员
 * 3. sendStatusNotify - 发送预约状态变更通知给用户
 * 4. getSubscribeStatus - 查询当前管理员的订阅状态
 */
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const OPENID = wxContext.OPENID
  
  try {
    switch (action) {
      case 'subscribe':
        return await subscribe(data, OPENID)
      case 'sendNewOrderNotify':
        return await sendNewOrderNotify(data)
      case 'sendStatusNotify':
        return await sendStatusNotify(data)
      case 'getSubscribeStatus':
        return await getSubscribeStatus(data, OPENID)
      default:
        return { code: -1, message: '未知操作' }
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
 * 获取所有管理员的 openid 列表
 */
async function getAdminOpenids() {
  try {
    const { data } = await db.collection('users')
      .where({
        role: _.in(['admin', 'superAdmin'])
      })
      .field({ _openid: true })
      .get()
    
    return data.map(user => user._openid)
  } catch (err) {
    console.error('获取管理员列表失败:', err)
    return []
  }
}

/**
 * 管理员订阅新订单通知
 * 记录订阅信息到数据库
 */
async function subscribe(data, OPENID) {
  const { templateId } = data
  
  if (!templateId) {
    return { code: -1, message: '模板ID不能为空' }
  }
  
  // 检查是否为管理员
  const isAdmin = await checkAdmin(OPENID)
  if (!isAdmin) {
    return { code: -1, message: '只有管理员可以订阅此通知' }
  }
  
  const now = new Date()
  
  try {
    // 查询是否已存在订阅记录
    const { data: existing } = await db.collection('subscriptions')
      .where({
        _openid: OPENID,
        templateId: templateId
      })
      .limit(1)
      .get()
    
    if (existing.length > 0) {
      // 更新订阅记录，增加剩余次数
      await db.collection('subscriptions').doc(existing[0]._id).update({
        data: {
          subscribeTime: now,
          status: 'active',
          remainCount: _.inc(1) // 每次订阅增加一次可发送次数
        }
      })
      
      return {
        code: 0,
        message: 'success',
        data: {
          isSubscribed: true,
          remainCount: (existing[0].remainCount || 0) + 1
        }
      }
    } else {
      // 创建新的订阅记录
      await db.collection('subscriptions').add({
        data: {
          _openid: OPENID,
          templateId: templateId,
          subscribeTime: now,
          status: 'active',
          remainCount: 1, // 初始订阅次数为1
          createTime: now
        }
      })
      
      return {
        code: 0,
        message: 'success',
        data: {
          isSubscribed: true,
          remainCount: 1
        }
      }
    }
  } catch (err) {
    console.error('订阅失败:', err)
    return { code: -1, message: '订阅失败' }
  }
}

/**
 * 发送新订单通知给所有已订阅的管理员
 * 
 * @param {Object} data - 订单信息
 * @param {string} data.contactName - 客户姓名
 * @param {string} data.packageName - 预约套餐
 * @param {string} data.date - 预约日期
 * @param {string} data.timeSlot - 预约时段 (morning/afternoon/golden)
 * @param {number} data.depositAmount - 定金金额
 * @param {string} data.orderId - 订单ID
 * @param {string} data.templateId - 订阅消息模板ID
 */
async function sendNewOrderNotify(data) {
  const { contactName, packageName, date, timeSlot, depositAmount, orderId, templateId } = data
  
  if (!templateId) {
    console.log('模板ID未配置，跳过发送通知')
    return { code: 0, message: '模板ID未配置，跳过发送' }
  }
  
  if (!orderId || !contactName || !packageName || !date) {
    return { code: -1, message: '订单信息不完整' }
  }
  
  // 时段映射为中文标签
  const timeSlotMap = {
    'morning': '上午 8:00-12:00',
    'afternoon': '下午 13:00-17:00',
    'golden': '黄金时段 17:00-20:00'
  }
  const timeSlotLabel = timeSlotMap[timeSlot] || timeSlot || '未指定'
  
  try {
    // 1. 获取所有管理员 openid
    const adminOpenids = await getAdminOpenids()
    
    if (adminOpenids.length === 0) {
      console.log('没有管理员用户，跳过发送通知')
      return { code: 0, message: '没有管理员用户' }
    }
    
    // 2. 查询已订阅且状态有效的管理员
    const { data: subscriptions } = await db.collection('subscriptions')
      .where({
        templateId: templateId,
        status: 'active',
        remainCount: _.gt(0),
        _openid: _.in(adminOpenids) // 只查询管理员的订阅
      })
      .get()
    
    if (subscriptions.length === 0) {
      console.log('没有已订阅的管理员，跳过发送通知')
      return { code: 0, message: '没有已订阅的管理员' }
    }
    
    // 3. 依次发送通知
    const results = []
    for (const sub of subscriptions) {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: sub._openid,
          templateId: templateId,
          page: `pages-admin/orders/detail?id=${orderId}`, // 点击跳转到订单详情
          data: {
            thing1: { value: truncateString(contactName, 20) },      // 客户姓名
            thing2: { value: truncateString(packageName, 20) },       // 预约套餐
            date3: { value: date },                                    // 预约日期
            thing4: { value: truncateString(timeSlotLabel, 20) },     // 预约时段
            amount5: { value: `${depositAmount}元` }                   // 定金金额
          }
        })
        
        // 发送成功，更新剩余次数
        const newRemainCount = (sub.remainCount || 1) - 1
        await db.collection('subscriptions').doc(sub._id).update({
          data: {
            remainCount: newRemainCount,
            status: newRemainCount > 0 ? 'active' : 'expired',
            lastSendTime: new Date()
          }
        })
        
        results.push({ openid: sub._openid, success: true })
        console.log(`通知发送成功: ${sub._openid}`)
      } catch (err) {
        // 发送失败，记录日志但不影响其他发送
        console.error(`通知发送失败: ${sub._openid}`, err)
        results.push({ openid: sub._openid, success: false, error: err.message })
      }
    }
    
    return {
      code: 0,
      message: 'success',
      data: {
        total: subscriptions.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    }
  } catch (err) {
    console.error('发送新订单通知失败:', err)
    return { code: -1, message: err.message || '发送失败' }
  }
}

/**
 * 发送预约状态变更通知给用户
 * 
 * @param {Object} data - 通知数据
 * @param {string} data.userId - 用户 openid
 * @param {string} data.packageName - 套餐名称
 * @param {string} data.status - 预约状态
 * @param {string} data.date - 预约日期
 * @param {string} data.remark - 备注说明
 * @param {string} data.templateId - 订阅消息模板ID
 */
async function sendStatusNotify(data) {
  const { userId, packageName, status, date, remark, templateId } = data
  
  if (!templateId) {
    console.log('模板ID未配置，跳过发送通知')
    return { code: 0, message: '模板ID未配置，跳过发送' }
  }
  
  if (!userId) {
    return { code: -1, message: '用户ID不能为空' }
  }
  
  // 状态映射为中文
  const statusMap = {
    'pending': '待确认',
    'confirmed': '已确认',
    'shooting': '拍摄中',
    'retouching': '修片中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  const statusLabel = statusMap[status] || status
  
  try {
    // 查询用户的订阅记录
    const { data: subscriptions } = await db.collection('subscriptions')
      .where({
        _openid: userId,
        templateId: templateId,
        status: 'active',
        remainCount: _.gt(0)
      })
      .limit(1)
      .get()
    
    if (subscriptions.length === 0) {
      console.log('用户未订阅此通知，跳过发送')
      return { code: 0, message: '用户未订阅此通知' }
    }
    
    const sub = subscriptions[0]
    
    // 发送通知
    await cloud.openapi.subscribeMessage.send({
      touser: userId,
      templateId: templateId,
      page: 'pages/order/list', // 点击跳转到订单列表
      data: {
        thing1: { value: truncateString(packageName, 20) },   // 套餐名称
        phrase2: { value: statusLabel },                       // 预约状态
        date3: { value: date || '未指定' },                    // 预约日期
        thing4: { value: truncateString(remark || '无', 20) } // 备注说明
      }
    })
    
    // 更新剩余次数
    const newRemainCount = (sub.remainCount || 1) - 1
    await db.collection('subscriptions').doc(sub._id).update({
      data: {
        remainCount: newRemainCount,
        status: newRemainCount > 0 ? 'active' : 'expired',
        lastSendTime: new Date()
      }
    })
    
    return { code: 0, message: 'success' }
  } catch (err) {
    console.error('发送状态变更通知失败:', err)
    return { code: -1, message: err.message || '发送失败' }
  }
}

/**
 * 查询当前管理员的订阅状态
 */
async function getSubscribeStatus(data, OPENID) {
  const { templateId } = data
  
  if (!templateId) {
    return { code: -1, message: '模板ID不能为空' }
  }
  
  try {
    // 检查是否为管理员
    const isAdmin = await checkAdmin(OPENID)
    if (!isAdmin) {
      return { code: -1, message: '只有管理员可以查询订阅状态' }
    }
    
    // 查询订阅记录
    const { data: subscriptions } = await db.collection('subscriptions')
      .where({
        _openid: OPENID,
        templateId: templateId
      })
      .limit(1)
      .get()
    
    if (subscriptions.length === 0) {
      return {
        code: 0,
        message: 'success',
        data: {
          isSubscribed: false,
          remainCount: 0
        }
      }
    }
    
    const sub = subscriptions[0]
    const isActive = sub.status === 'active' && sub.remainCount > 0
    
    return {
      code: 0,
      message: 'success',
      data: {
        isSubscribed: isActive,
        remainCount: sub.remainCount || 0,
        subscribeTime: sub.subscribeTime
      }
    }
  } catch (err) {
    console.error('查询订阅状态失败:', err)
    return { code: -1, message: '查询失败' }
  }
}

/**
 * 截断字符串（订阅消息字段有长度限制）
 * @param {string} str - 原字符串
 * @param {number} maxLength - 最大长度
 */
function truncateString(str, maxLength) {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}
