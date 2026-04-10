/**
 * 云函数 CORS 跨域配置示例
 * 
 * 在每个云函数的 index.js 入口添加以下代码，以支持 HTTP 触发器跨域访问
 */

// 云函数入口函数示例
exports.main = async (event, context) => {
  // 如果是 HTTP 触发，添加 CORS 头
  if (event.httpMethod) {
    // OPTIONS 预检请求
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
    
    // 解析 HTTP 请求体
    const body = JSON.parse(event.body || '{}')
    
    // 执行业务逻辑
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
  
  // 小程序直接调用（非 HTTP 触发）
  return await handleRequest(event, context)
}

// 业务逻辑处理函数
async function handleRequest(params, context) {
  // 在这里编写你的业务逻辑
  // 例如：查询数据库、处理数据等
  
  return {
    code: 0,
    message: 'success',
    data: {}
  }
}

/**
 * 使用说明：
 * 
 * 1. 将上述代码复制到你的云函数 index.js 中
 * 2. 修改 handleRequest 函数，添加你的业务逻辑
 * 3. 部署云函数到云开发环境
 * 4. 在微信开发者工具云开发控制台开启 HTTP 触发器
 * 
 * 注意事项：
 * - Access-Control-Allow-Origin: '*' 允许所有域名访问，生产环境建议指定具体域名
 * - 如需携带 Cookie，需设置 Access-Control-Allow-Credentials: true 并指定具体 Origin
 */
