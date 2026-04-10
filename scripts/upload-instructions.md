# 照片上传到微信云存储指南

## 一、压缩照片

### 1. 运行压缩脚本

```powershell
cd d:\lvpai\scripts
node upload-photos.js
```

### 2. 检查输出

脚本会在 `D:\lvpai\cloud-upload\` 目录下生成：

```
cloud-upload/
├── gallery/
│   ├── couple/          # 情侣写真 4张
│   │   ├── couple_01.jpg
│   │   ├── couple_02.jpg
│   │   ├── couple_03.jpg
│   │   └── couple_04.jpg
│   ├── children/        # 儿童写真 4张
│   │   ├── children_01.jpg
│   │   ├── children_02.jpg
│   │   ├── children_03.jpg
│   │   └── children_04.jpg
│   ├── mausoleum/       # 陵前写真 4张
│   │   ├── mausoleum_01.jpg
│   │   ├── mausoleum_02.jpg
│   │   ├── mausoleum_03.jpg
│   │   └── mausoleum_04.jpg
│   └── grassland/       # 草原旅拍 4张
│       ├── grassland_01.jpg
│       ├── grassland_02.jpg
│       ├── grassland_03.jpg
│       └── grassland_04.jpg
└── manifest.json        # 文件清单
```

## 二、上传到云存储

### 方法：通过微信开发者工具手动上传

#### 步骤 1：打开云开发控制台

1. 打开微信开发者工具
2. 点击顶部菜单栏的「云开发」按钮
3. 进入「存储」标签页

#### 步骤 2：创建文件夹

在存储根目录下创建以下文件夹结构：

```
/
└── gallery/
    ├── couple/
    ├── children/
    ├── mausoleum/
    └── grassland/
```

#### 步骤 3：上传文件

1. 进入 `gallery/couple/` 文件夹
2. 点击「上传文件」按钮
3. 选择 `cloud-upload/gallery/couple/` 下的所有文件
4. 重复上述步骤，依次上传其他分类的照片

#### 步骤 4：获取文件路径

上传完成后，每个文件会获得一个 `cloud://` 格式的路径：

```
cloud://<环境ID>.<存储区域>/gallery/couple/couple_01.jpg
cloud://<环境ID>.<存储区域>/gallery/couple/couple_02.jpg
...
```

## 三、更新数据库图片地址

### 方法 1：通过云函数初始化（推荐）

1. 在微信开发者工具中创建临时云函数 `init-data`
2. 将 `scripts/init-cloud-data.js` 内容复制到云函数的 `index.js`
3. **修改 gallery 数组中的图片路径**，将 `cloud://prod-xxx/` 替换为实际的路径前缀
4. 部署并运行该云函数

### 方法 2：通过控制台手动导入

1. 进入「云开发」->「数据库」
2. 创建 `gallery` 集合
3. 点击「添加记录」，逐个添加客片数据
4. 图片字段填写对应的 `cloud://` 路径

### 图片路径示例

假设你的环境ID是 `prod-xxx`，存储区域是 `125`，则路径格式为：

```javascript
// 情侣写真
couple_01.jpg -> cloud://prod-xxx.125/gallery/couple/couple_01.jpg
couple_02.jpg -> cloud://prod-xxx.125/gallery/couple/couple_02.jpg
couple_03.jpg -> cloud://prod-xxx.125/gallery/couple/couple_03.jpg
couple_04.jpg -> cloud://prod-xxx.125/gallery/couple/couple_04.jpg

// 儿童写真
children_01.jpg -> cloud://prod-xxx.125/gallery/children/children_01.jpg
...

// 陵前写真
mausoleum_01.jpg -> cloud://prod-xxx.125/gallery/mausoleum/mausoleum_01.jpg
...

// 草原旅拍
grassland_01.jpg -> cloud://prod-xxx.125/gallery/grassland/grassland_01.jpg
...
```

## 四、验证上传

### 1. 检查云存储

- 确认所有 16 张照片都已上传到正确的文件夹
- 确认文件大小正常（压缩后约 100-300KB）

### 2. 检查数据库

- 确认 `gallery` 集合有 16 条记录
- 确认每条记录的 `images` 字段包含正确的 `cloud://` 路径

### 3. 小程序端验证

- 重新编译小程序
- 进入「客片欣赏」页面
- 确认图片能正常显示

## 五、常见问题

### Q1: 上传后图片显示不出来？

- 检查 `cloud://` 路径是否正确
- 检查小程序 appid 是否与云环境绑定
- 检查云存储的安全规则是否允许读取

### Q2: 如何获取正确的 cloud:// 路径？

在云开发控制台 -> 存储中，点击文件右侧的「详情」按钮，复制「文件 ID」即为 `cloud://` 路径。

### Q3: 可以批量修改数据库中的图片路径吗？

可以。在云开发控制台 -> 数据库中，使用「高级操作」->「聚合」或导出 JSON 修改后重新导入。

## 六、文件映射参考

| 原文件名 | 分类 | 新文件名 |
|---------|------|---------|
| 3.jpg | couple | couple_01.jpg |
| 4.jpg | children | children_01.jpg |
| 5.jpg | mausoleum | mausoleum_01.jpg |
| 6.jpg | grassland | grassland_01.jpg |
| 8.jpg | children | children_02.jpg |
| 10.jpg | grassland | grassland_02.jpg |
| 11.jpg | couple | couple_02.jpg |
| 12.jpg | children | children_03.jpg |
| 13.jpg | mausoleum | mausoleum_02.jpg |
| 14.jpg | grassland | grassland_03.jpg |
| 15.jpg | couple | couple_03.jpg |
| 16.jpg | children | children_04.jpg |
| 17.jpg | mausoleum | mausoleum_03.jpg |
| 18.jpg | mausoleum | mausoleum_04.jpg |
| 微信图片_20260409113908.jpg | grassland | grassland_04.jpg |
| 微信图片_20260409113938.jpg | couple | couple_04.jpg |
