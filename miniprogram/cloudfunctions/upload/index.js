const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * upload 云函数 - 接收 base64 文件并上传到 CloudBase 存储
 * 供网页后台调用，避免前端直接操作存储
 */
exports.main = async (event, context) => {
  // HTTP 触发器处理
  if (event.httpMethod) {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
  return await handleRequest(event, context)
}

async function handleRequest(event, context) {
  const { action, data = {} } = event

  try {
    switch (action) {
      case 'uploadBase64':
        return await uploadBase64(data)
      default:
        return { code: -1, message: `未知操作: ${action}` }
    }
  } catch (err) {
    console.error('upload 云函数执行错误:', err)
    return { code: -1, message: err.message || '服务器内部错误' }
  }
}

/**
 * 接收 base64 图片并上传到 CloudBase 存储
 * @param {object} data - { base64: '...', fileName: 'xxx.jpg', folder: 'packages' }
 * @returns {{ code: number, data: { fileID: string, url: string } }}
 */
async function uploadBase64(data) {
  const { base64, fileName, folder = 'uploads' } = data

  if (!base64) {
    return { code: -1, message: '文件内容不能为空' }
  }
  if (!fileName) {
    return { code: -1, message: '文件名不能为空' }
  }

  // 解析 base64（支持带 data:image/xxx;base64, 前缀的格式）
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  // 生成唯一文件路径
  const ext = fileName.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const cloudPath = `${folder}/${timestamp}_${random}.${ext}`

  // 上传到 CloudBase 存储
  const uploadResult = await cloud.uploadFile({
    cloudPath: cloudPath,
    fileContent: buffer
  })

  if (!uploadResult.fileID) {
    return { code: -1, message: '上传失败' }
  }

  // 获取文件访问 URL
  const { fileList } = await cloud.getTempFileURL({
    fileList: [uploadResult.fileID]
  })

  const url = fileList[0]?.tempFileURL || ''

  return {
    code: 0,
    message: 'success',
    data: {
      fileID: uploadResult.fileID,
      url: url,
      cloudPath: cloudPath
    }
  }
}
