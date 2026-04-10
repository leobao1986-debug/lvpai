# 朵兰摄影管理后台 - 部署指南

## 一、本地开发

### 启动开发服务器
```powershell
npm run dev
```
访问 http://localhost:5173

测试账号：admin / admin123

## 二、构建生产版本

```powershell
npm run build
```
构建产物在 `dist/` 目录

## 三、微信云开发静态网站托管部署

### 1. 开通静态网站托管

1. 打开微信开发者工具
2. 点击"云开发"控制台
3. 左侧菜单选择"静态网站"
4. 点击"开通静态网站"

### 2. 上传文件

#### 方式一：控制台手动上传
- 在静态网站页面点击"上传文件"
- 将 `dist/` 目录下所有文件上传

#### 方式二：使用 CloudBase CLI

```powershell
# 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 部署到静态网站托管
cloudbase hosting deploy dist/ -e 你的云环境ID
```

### 3. 访问地址

上传后会获得一个访问地址，格式如：
```
https://你的云环境ID.tcloudbaseapp.com
```

## 四、云函数 HTTP 触发器配置

### 为什么需要 HTTP 触发器？

网页端无法直接使用 `wx.cloud.callFunction`，需要通过 HTTP 方式调用云函数。

### 配置步骤

1. 打开微信开发者工具 → 云开发控制台
2. 左侧菜单选择"云函数"
3. 对每个云函数点击详情：

#### user 云函数
- 点击"云函数配置"
- 找到"HTTP 触发"区域
- 点击"启用"
- 记录触发路径（如：`https://你的云环境ID.service.tcloudbase.com/user`）

重复上述步骤为以下云函数开启 HTTP 触发：
- `user` - 用户管理
- `package` - 套餐管理
- `gallery` - 作品集管理
- `booking` - 预约管理
- `payment` - 支付相关
- `stats` - 数据统计
- `notify` - 消息通知

### 4. CORS 跨域配置

在云函数代码中添加 CORS 头，参考 `docs/cloud-cors-example.js` 中的示例代码。

### 5. 配置环境变量

在管理后台项目根目录创建 `.env.production`：
```
VITE_CLOUD_BASE_URL=https://你的云环境ID.service.tcloudbase.com
```

## 五、注意事项

- 静态网站托管免费额度：1GB 存储 + 5GB/月 流量
- 云函数 HTTP 触发有调用频率限制，详见微信官方文档
- 建议开启 HTTPS
- 首次部署后，记得在云开发控制台配置域名（如有需要）
