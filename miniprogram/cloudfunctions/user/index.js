const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    switch (action) {
      case 'login':
        return await handleLogin(openid, data)
      case 'getProfile':
        return await handleGetProfile(openid)
      case 'updatePhone':
        return await handleUpdatePhone(openid, data)
      case 'updateProfile':
        return await handleUpdateProfile(openid, data)
      case 'setAdmin':
        return await handleSetAdmin(openid, data)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (error) {
    console.error('云函数执行错误:', error)
    return { code: -1, message: error.message || '服务器错误' }
  }
}

// 登录处理
async function handleLogin(openid, profileData = {}) {
  if (!openid) {
    return { code: -1, message: '获取用户openid失败' }
  }

  // 查询用户是否存在
  const { data } = await usersCollection.where({ openid }).get()

  // 构建更新数据
  const updateData = {
    lastLoginTime: db.serverDate()
  }
  if (profileData.nickname) updateData.nickname = profileData.nickname
  if (profileData.avatar) updateData.avatar = profileData.avatar
  if (profileData.phone) updateData.phone = profileData.phone

  if (data.length > 0) {
    // 用户已存在，更新信息
    await usersCollection.doc(data[0]._id).update({ data: updateData })
    return { code: 0, message: 'success', data: { ...data[0], ...updateData } }
  }

  // 用户不存在，创建新用户
  const newUser = {
    openid,
    nickname: profileData.nickname || '微信用户',
    avatar: profileData.avatar || '',
    phone: profileData.phone || '',
    role: 'user',
    createTime: db.serverDate(),
    ...updateData
  }

  const result = await usersCollection.add({ data: newUser })
  
  return {
    code: 0,
    message: 'success',
    data: {
      _id: result._id,
      ...newUser
    }
  }
}

// 获取用户信息
async function handleGetProfile(openid) {
  if (!openid) {
    return { code: -1, message: '获取用户openid失败' }
  }

  const { data } = await usersCollection.where({ openid }).get()

  if (data.length === 0) {
    return { code: -1, message: '用户不存在' }
  }

  return { code: 0, message: 'success', data: data[0] }
}

// 更新手机号
async function handleUpdatePhone(openid, data) {
  if (!openid) {
    return { code: -1, message: '获取用户openid失败' }
  }

  if (!data || !data.phone) {
    return { code: -1, message: '手机号不能为空' }
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(data.phone)) {
    return { code: -1, message: '手机号格式不正确' }
  }

  // 查询用户是否存在
  const { data: userData } = await usersCollection.where({ openid }).get()

  if (userData.length === 0) {
    return { code: -1, message: '用户不存在' }
  }

  // 更新手机号
  await usersCollection.where({ openid }).update({
    data: { phone: data.phone }
  })

  // 返回更新后的用户信息
  const { data: updatedData } = await usersCollection.where({ openid }).get()
  return { code: 0, message: 'success', data: updatedData[0] }
}

// 更新用户资料
async function handleUpdateProfile(openid, data) {
  if (!openid) {
    return { code: -1, message: '获取用户openid失败' }
  }

  if (!data) {
    return { code: -1, message: '更新数据不能为空' }
  }

  // 查询用户是否存在
  const { data: userData } = await usersCollection.where({ openid }).get()

  if (userData.length === 0) {
    return { code: -1, message: '用户不存在' }
  }

  // 构建更新数据
  const updateData = {}
  if (data.nickname !== undefined) {
    updateData.nickname = data.nickname
  }
  if (data.avatar !== undefined) {
    updateData.avatar = data.avatar
  }

  // 如果没有要更新的字段
  if (Object.keys(updateData).length === 0) {
    return { code: -1, message: '没有要更新的字段' }
  }

  // 更新用户资料
  await usersCollection.where({ openid }).update({ data: updateData })

  // 返回更新后的用户信息
  const { data: updatedData } = await usersCollection.where({ openid }).get()
  return { code: 0, message: 'success', data: updatedData[0] }
}

// 设置管理员角色
async function handleSetAdmin(openid, data) {
  if (!openid) {
    return { code: -1, message: '获取用户openid失败' }
  }

  if (!data || !data.targetOpenid) {
    return { code: -1, message: '目标用户openid不能为空' }
  }

  if (!data.role || !['user', 'admin', 'superAdmin'].includes(data.role)) {
    return { code: -1, message: '角色值无效，可选值：user, admin, superAdmin' }
  }

  // 查询当前用户是否为 superAdmin
  const { data: currentUserData } = await usersCollection.where({ openid }).get()

  if (currentUserData.length === 0) {
    return { code: -1, message: '当前用户不存在' }
  }

  if (currentUserData[0].role !== 'superAdmin') {
    return { code: -1, message: '权限不足，仅superAdmin可执行此操作' }
  }

  // 查询目标用户是否存在
  const { data: targetUserData } = await usersCollection.where({ 
    openid: data.targetOpenid 
  }).get()

  if (targetUserData.length === 0) {
    return { code: -1, message: '目标用户不存在' }
  }

  // 更新目标用户角色
  await usersCollection.where({ openid: data.targetOpenid }).update({
    data: { role: data.role }
  })

  // 返回更新后的目标用户信息
  const { data: updatedData } = await usersCollection.where({ 
    openid: data.targetOpenid 
  }).get()

  return { 
    code: 0, 
    message: 'success', 
    data: updatedData[0] 
  }
}
