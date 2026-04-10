const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 管理员权限校验
async function checkAdmin(openid) {
  try {
    const { data } = await db.collection('users').where({
      _openid: openid
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

exports.main = async (event, context) => {
  const { action, data = {} } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
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
        return await updatePackageStatus(data, openid)
      
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (err) {
    console.error('云函数执行错误:', err)
    return { code: -1, message: err.message || '服务器内部错误' }
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
    whereCondition.status = 'on'
  }
  
  const { data: list } = await db.collection('packages')
    .where(whereCondition)
    .orderBy('sortOrder', 'asc')
    .get()
  
  return {
    code: 0,
    message: 'success',
    data: { list }
  }
}

// 获取套餐详情
async function getPackageDetail(data) {
  const { id } = data
  
  if (!id) {
    return { code: -1, message: '套餐ID不能为空' }
  }
  
  const { data: packageData } = await db.collection('packages').doc(id).get()
  
  if (!packageData) {
    return { code: -1, message: '套餐不存在' }
  }
  
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
  
  const { id } = data
  
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
  
  const { id, status } = data
  
  if (!id) {
    return { code: -1, message: '套餐ID不能为空' }
  }
  
  if (!['on', 'off'].includes(status)) {
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
