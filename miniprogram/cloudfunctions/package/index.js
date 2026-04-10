const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 云存储CDN基础URL（公开可读）
const CLOUD_STORAGE_BASE = 'https://636c-cloud1-3g56hllb4a005c0e-1419657853.tcb.qcloud.la'

// 转换图片路径为完整CDN URL
function convertImageUrl(path) {
  if (!path) return path
  if (path.startsWith('http') || path.startsWith('cloud://')) return path
  return `${CLOUD_STORAGE_BASE}/${path}`
}

function convertItemImages(item) {
  if (!item) return item
  if (item.coverImage) item.coverImage = convertImageUrl(item.coverImage)
  if (item.images && Array.isArray(item.images)) {
    item.images = item.images.map(convertImageUrl)
  }
  if (item.avatar) item.avatar = convertImageUrl(item.avatar)
  return item
}

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
      case 'list':
        return await listPackages(data)
      
      case 'detail':
        return await getPackageDetail(data)
      
      case 'create':
        return await createPackage(data, openid)
      
      case 'update':
        return await updatePackage(data, openid)
      
      case 'delete':
        return await deletePackage(data, openid)
      
      case 'updateStatus':
      case 'toggleStatus':
        return await updatePackageStatus(data, openid)
      
      default:
        return { code: -1, message: `未知操作: ${action}` }
    }
  } catch (err) {
    console.error('云函数执行错误:', err)
    return { code: -1, message: err.message || '服务器内部错误' }
  }
}

// 管理员权限校验
async function checkAdmin(openid) {
  try {
    const { data } = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (data.length === 0) {
      return false
    }
    
    const user = data[0]
    return user.role === 'admin' || user.role === 'superAdmin'
  } catch (err) {
    console.error('校验管理员权限失败:', err)
    return false
  }
}

// 获取套餐列表
async function listPackages(data) {
  const { category, isAdmin } = data
  
  let whereCondition = {}
  
  // 分类筛选
  if (category) {
    whereCondition.category = category
  }
  
  // 用户端只返回上架的套餐
  if (!isAdmin) {
    whereCondition.status = 'active'
  }
  
  const { data: list } = await db.collection('packages')
    .where(whereCondition)
    .orderBy('sortOrder', 'asc')
    .get()
  
  // 转换图片路径为CDN URL
  const convertedList = list.map(convertItemImages)
  
  return {
    code: 0,
    message: 'success',
    data: { list: convertedList }
  }
}

// 获取套餐详情
async function getPackageDetail(data) {
  // 支持 id 和 _id 两种参数名
  const id = data.id || data._id
  
  if (!id) {
    return { code: -1, message: '套餐ID不能为空' }
  }
  
  const { data: packageData } = await db.collection('packages').doc(id).get()
  
  if (!packageData) {
    return { code: -1, message: '套餐不存在' }
  }
  
  // 转换图片路径为CDN URL
  convertItemImages(packageData)
  
  return {
    code: 0,
    message: 'success',
    data: packageData
  }
}

// 创建套餐（管理员）
async function createPackage(data, openid) {
  // 校验管理员权限
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return { code: -1, message: '无权限操作' }
  }
  
  const now = db.serverDate()
  
  const packageData = {
    ...data,
    status: data.status || 'active',
    createTime: now,
    updateTime: now
  }
  
  const { _id } = await db.collection('packages').add({
    data: packageData
  })
  
  return {
    code: 0,
    message: 'success',
    data: { _id, ...packageData }
  }
}

// 更新套餐（管理员）
async function updatePackage(data, openid) {
  // 校验管理员权限
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return { code: -1, message: '无权限操作' }
  }
  
  const { id, ...updateData } = data
  
  if (!id) {
    return { code: -1, message: '套餐ID不能为空' }
  }
  
  const now = db.serverDate()
  
  await db.collection('packages').doc(id).update({
    data: {
      ...updateData,
      updateTime: now
    }
  })
  
  return {
    code: 0,
    message: 'success',
    data: { id }
  }
}

// 删除套餐（管理员）
async function deletePackage(data, openid) {
  // 校验管理员权限
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return { code: -1, message: '无权限操作' }
  }

  // 支持 id 和 _id 两种参数名
  const id = data.id || data._id
  
  if (!id) {
    return { code: -1, message: '套餐ID不能为空' }
  }
  
  await db.collection('packages').doc(id).remove()
  
  return {
    code: 0,
    message: 'success',
    data: { id }
  }
}

// 更新套餐状态（上下架）
async function updatePackageStatus(data, openid) {
  // 校验管理员权限
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return { code: -1, message: '无权限操作' }
  }

  // 支持 id 和 _id 两种参数名
  const id = data.id || data._id
  const { status } = data
  
  if (!id) {
    return { code: -1, message: '套餐ID不能为空' }
  }
  
  if (!['active', 'inactive'].includes(status)) {
    return { code: -1, message: '状态值无效' }
  }
  
  const now = db.serverDate()
  
  await db.collection('packages').doc(id).update({
    data: {
      status,
      updateTime: now
    }
  })
  
  return {
    code: 0,
    message: 'success',
    data: { id, status }
  }
}
