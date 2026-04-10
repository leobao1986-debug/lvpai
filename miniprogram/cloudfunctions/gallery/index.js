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
    const parsedBody = JSON.parse(event.body || '{}')
    console.log('[gallery] HTTP调用, body:', event.body, 'parsed:', parsedBody)
    
    // 兼容两种参数格式：
    // 1. { action: 'xxx', data: { id: 'xxx' } } - 小程序格式
    // 2. { action: 'xxx', id: 'xxx' } - HTTP前端格式
    const body = parsedBody.data 
      ? parsedBody 
      : { action: parsedBody.action, data: { ...parsedBody, action: undefined } }
    delete body.data.action
    
    console.log('[gallery] 处理后参数:', body)
    const result = await handleRequest(body, context, true)  // HTTP调用标记为true
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
  console.log('[gallery] handleRequest called with action:', action)
  console.log('[gallery] data:', JSON.stringify(data))
  
  // 确保 action 是字符串
  if (typeof action === 'string') {
    action = action.trim()
  }
  
  try {
    switch (action) {
      case 'list':
        return await listGallery(data)
      
      case 'detail':
        return await getGalleryDetail(data)
      
      case 'create':
        return await createGallery(data, openid, isHttpCall)
      
      case 'update':
        return await updateGallery(data, openid, isHttpCall)
      
      case 'delete':
        return await deleteGallery(data, openid, isHttpCall)
      
      case 'favorite':
        return await toggleFavorite(data, openid)
      
      case 'myFavorites':
        return await getMyFavorites(data, openid)
      
      case 'checkFavorite':
        return await checkFavorite(data, openid)
      
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

// 获取客片列表
async function listGallery(data) {
  const { category, page = 1, pageSize = 10, isAdmin } = data
  
  let whereCondition = {}
  
  // 分类筛选
  if (category) {
    whereCondition.category = category
  }
  
  // 用户端只返回已发布的客片
  if (!isAdmin) {
    whereCondition.status = 'published'
  }
  
  // 获取总数
  const { total } = await db.collection('gallery').where(whereCondition).count()
  
  // 获取列表
  const { data: list } = await db.collection('gallery')
    .where(whereCondition)
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  // 转换图片路径为CDN URL
  const convertedList = list.map(convertItemImages)
  
  return {
    code: 0,
    message: 'success',
    data: {
      list: convertedList,
      total,
      page,
      pageSize
    }
  }
}

// 获取客片详情
async function getGalleryDetail(data) {
  // 支持 id 和 _id 两种参数名
  const id = data.id || data._id
  
  if (!id) {
    return { code: -1, message: '客片ID不能为空' }
  }
  
  const { data: galleryData } = await db.collection('gallery').doc(id).get()
  
  if (!galleryData) {
    return { code: -1, message: '客片不存在' }
  }
  
  // 转换图片路径为CDN URL
  convertItemImages(galleryData)
  
  return {
    code: 0,
    message: 'success',
    data: galleryData
  }
}

// 创建客片（管理员）
async function createGallery(data, openid, isHttpCall = false) {
  // 校验管理员权限（HTTP调用来自管理后台，已有登录保护，跳过检查）
  if (!isHttpCall) {
    const isAdmin = await checkAdmin(openid)
    if (!isAdmin) {
      return { code: -1, message: '无权限操作' }
    }
  }
  
  const now = db.serverDate()
  
  const galleryData = {
    ...data,
    likes: 0,
    status: data.status || 'published',
    createTime: now,
    updateTime: now
  }
  
  const { _id } = await db.collection('gallery').add({
    data: galleryData
  })
  
  return {
    code: 0,
    message: 'success',
    data: { _id, ...galleryData }
  }
}

// 更新客片（管理员）
async function updateGallery(data, openid, isHttpCall = false) {
  // 校验管理员权限（HTTP调用来自管理后台，已有登录保护，跳过检查）
  if (!isHttpCall) {
    const isAdmin = await checkAdmin(openid)
    if (!isAdmin) {
      return { code: -1, message: '无权限操作' }
    }
  }

  // 支持 id 和 _id 两种参数名
  const id = data.id || data._id
  const updateData = { ...data }
  delete updateData.id
  delete updateData._id
  
  if (!id) {
    return { code: -1, message: '客片ID不能为空' }
  }
  
  const now = db.serverDate()
  
  await db.collection('gallery').doc(id).update({
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

// 删除客片（管理员）
async function deleteGallery(data, openid, isHttpCall = false) {
  // 校验管理员权限（HTTP调用来自管理后台，已有登录保护，跳过检查）
  if (!isHttpCall) {
    const isAdmin = await checkAdmin(openid)
    if (!isAdmin) {
      return { code: -1, message: '无权限操作' }
    }
  }

  // 支持 id 和 _id 两种参数名
  const id = data.id || data._id
  
  if (!id) {
    return { code: -1, message: '客片ID不能为空' }
  }
  
  // 开启事务
  const transaction = await db.startTransaction()
  
  try {
    // 删除客片
    await transaction.collection('gallery').doc(id).remove()
    
    // 删除相关收藏记录
    const { data: favorites } = await transaction.collection('favorites').where({
      galleryId: id
    }).get()
    
    for (const fav of favorites) {
      await transaction.collection('favorites').doc(fav._id).remove()
    }
    
    await transaction.commit()
    
    return {
      code: 0,
      message: 'success',
      data: { id }
    }
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

// 切换收藏状态
async function toggleFavorite(data, openid) {
  const { galleryId } = data
  
  if (!galleryId) {
    return { code: -1, message: '客片ID不能为空' }
  }
  
  // 查询是否已收藏
  const { data: existingFav } = await db.collection('favorites').where({
    userId: openid,
    galleryId: galleryId
  }).get()
  
  const isFavorited = existingFav.length > 0
  
  if (isFavorited) {
    // 取消收藏
    await db.collection('favorites').doc(existingFav[0]._id).remove()
    
    // 减少点赞数
    await db.collection('gallery').doc(galleryId).update({
      data: {
        likes: _.inc(-1)
      }
    })
    
    return {
      code: 0,
      message: 'success',
      data: { isFavorited: false }
    }
  } else {
    // 添加收藏
    const now = db.serverDate()
    await db.collection('favorites').add({
      data: {
        userId: openid,
        galleryId: galleryId,
        createTime: now
      }
    })
    
    // 增加点赞数
    await db.collection('gallery').doc(galleryId).update({
      data: {
        likes: _.inc(1)
      }
    })
    
    return {
      code: 0,
      message: 'success',
      data: { isFavorited: true }
    }
  }
}

// 获取我的收藏列表
async function getMyFavorites(data, openid) {
  const { page = 1, pageSize = 10 } = data
  
  // 获取收藏记录
  const { data: favorites } = await db.collection('favorites')
    .where({
      userId: openid
    })
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  // 获取总数
  const { total } = await db.collection('favorites').where({
    userId: openid
  }).count()
  
  // 联查 gallery 信息
  const galleryIds = favorites.map(fav => fav.galleryId)
  
  let galleryList = []
  if (galleryIds.length > 0) {
    const { data: galleries } = await db.collection('gallery')
      .where({
        _id: _.in(galleryIds),
        status: 'published'
      })
      .get()
    
    // 构建 galleryId -> gallery 的映射
    const galleryMap = {}
    galleries.forEach(g => {
      galleryMap[g._id] = g
    })
    
    // 组装结果
    galleryList = favorites.map(fav => ({
      ...fav,
      gallery: galleryMap[fav.galleryId] || null
    })).filter(item => item.gallery !== null)
    
    // 转换图片路径为CDN URL
    galleryList.forEach(item => {
      if (item.gallery) {
        convertItemImages(item.gallery)
      }
    })
  }
  
  return {
    code: 0,
    message: 'success',
    data: {
      list: galleryList,
      total,
      page,
      pageSize
    }
  }
}

// 检查是否已收藏
async function checkFavorite(data, openid) {
  const { galleryId } = data
  
  if (!galleryId) {
    return { code: -1, message: '客片ID不能为空' }
  }
  
  const { data: existingFav } = await db.collection('favorites').where({
    userId: openid,
    galleryId: galleryId
  }).get()
  
  return {
    code: 0,
    message: 'success',
    data: { isFavorited: existingFav.length > 0 }
  }
}
