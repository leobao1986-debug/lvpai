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
    const body = JSON.parse(event.body || '{}')
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
      case 'subscribe':
        return await subscribe(data, openid)
      case 'sendNewOrderNotify':
        return await sendNewOrderNotify(data)
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
 * 获取所有管理员的 openid 列表
 */
async function getAdminOpenids() {
  try {
    const { data } = await db.collection('users')
      .where({
        role: _.in(['admin', 'superAdmin'])
      })
      .field({ openid: true })
      .get()
    
    return data.map(user => user.openid)
  } catch (err) {
    console.error('获取管理员列表失败:', err)
    return []
  }
}

/**
 * 管理员订阅新订单通知
 * 记录订阅信息到数据库
 */
async function subscribe(data, openid) {
  const { templateId } = data
  
  if (!templateId) {
    return { code: -1, message: '模板ID不能为空' }
  }
  
  // 检查是否为管理员
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return { code: -1, message: '只有管理员可以订阅此通知' }
  }
  
  const now = new Date()
  
  try {
    // 查询是否已存在订阅记录
    const { data: existing } = await db.collection('subscriptions')
      .where({
        openid: openid,
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
          openid: openid,
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
 * @param {string} data.timeSlot - 预约时段
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
  const timeSlotLabel = timeSlot || '未指定'
  
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
        openid: _.in(adminOpenids) // 只查询管理员的订阅
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
          touser: sub.openid,
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
        
        results.push({ openid: sub.openid, success: true })
        console.log(`通知发送成功: ${sub.openid}`)
      } catch (err) {
        // 发送失败，记录日志但不影响其他发送
        console.error(`通知发送失败: ${sub.openid}`, err)
        results.push({ openid: sub.openid, success: false, error: err.message })
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
 * 截断字符串（订阅消息字段有长度限制）
 * @param {string} str - 原字符串
 * @param {number} maxLength - 最大长度
 */
function truncateString(str, maxLength) {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}
