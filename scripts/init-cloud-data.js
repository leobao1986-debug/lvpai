/**
 * 云数据库初始化脚本
 * 使用方式：将此文件内容复制到一个临时云函数中执行
 * 或通过微信开发者工具的云开发控制台直接导入 JSON 数据
 */

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 套餐数据
const packages = [
  {
    name: '圣地爆款·尊享款',
    category: 'personal',
    price: 399,
    originalPrice: 599,
    deposit: 99,
    duration: 45,
    clothCount: 1,
    photoCount: 6,
    description: '1服1造 全套定制妆造，成吉思汗陵专属地标机位',
    features: [
      '1服1造 全套定制妆造（含专业妆容+头饰造型）',
      '精修6张 高清大片直出',
      '原图20张以上 全部免费送',
      '成吉思汗陵专属地标机位拍摄'
    ],
    tag: 'HOT',
    sortOrder: 1,
    status: 'active',
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    name: '尝鲜体验款',
    category: 'personal',
    price: 199,
    originalPrice: 299,
    deposit: 50,
    duration: 20,
    clothCount: 0,
    photoCount: 2,
    description: '体验式拍摄1组，快速出片',
    features: [
      '体验式拍摄1组（不含化妆）',
      '精修2张 快速出片',
      '原图10张以上 全部免费送'
    ],
    tag: '',
    sortOrder: 2,
    status: 'active',
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    name: '省心入门款',
    category: 'personal',
    price: 299,
    originalPrice: 399,
    deposit: 80,
    duration: 30,
    clothCount: 1,
    photoCount: 4,
    description: '1服简妆 基础造型，高清出片',
    features: [
      '1服简妆 基础造型',
      '精修4张 高清出片',
      '原图20张以上 全部免费送'
    ],
    tag: '',
    sortOrder: 3,
    status: 'active',
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    name: '草原盟约款',
    category: 'couple',
    price: 699,
    originalPrice: 999,
    deposit: 200,
    duration: 60,
    clothCount: 1,
    photoCount: 6,
    description: '2人1服1造 全套定制妆，景区定制浪漫路线',
    features: [
      '2人1服1造 全套定制妆',
      '专业摄影师全程跟拍+景区定制浪漫路线',
      '精修6张 氛围感大片直出',
      '原图20张以上 全部免费送'
    ],
    tag: '情侣首选',
    sortOrder: 4,
    status: 'active',
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    name: '阖家盛景款',
    category: 'family',
    price: 699,
    originalPrice: 999,
    deposit: 200,
    duration: 60,
    clothCount: 1,
    photoCount: 6,
    description: '4人以内全套定制妆造，全家福大片',
    features: [
      '4人以内1服1造 全套定制妆造',
      '长辈/儿童专属民族服饰搭配',
      '精修6张 全家福大片直出',
      '原图20张以上 全部免费送',
      '4人以内无额外加价，加1人仅收200元拍摄费'
    ],
    tag: '家庭首选',
    sortOrder: 5,
    status: 'active',
    createTime: new Date(),
    updateTime: new Date()
  }
]

// 客片数据（16条，从 mockData.js 提取并调整格式）
const gallery = [
  // mausoleum(陵前写真) - 4张
  {
    title: '陵前盛装·蒙古公主',
    category: 'mausoleum',
    tags: ['陵前写真', '蒙古袍', '民族风'],
    images: ['cloud://prod-xxx/gallery/mausoleum/mausoleum_01.jpg'],
    copyText: '在成吉思汗陵前，穿一身盛装，做一回草原公主 🏛️✨ #成吉思汗陵旅拍 #蒙古袍写真',
    likes: 128,
    status: 'published',
    createTime: new Date('2026-04-08'),
    updateTime: new Date()
  },
  {
    title: '陵前回眸·岁月如歌',
    category: 'mausoleum',
    tags: ['陵前写真', '蒙古袍', '经典'],
    images: ['cloud://prod-xxx/gallery/mausoleum/mausoleum_02.jpg'],
    copyText: '陵前一回眸，穿越千年的时光。这是属于草原儿女的骄傲与荣光 🏛️ #成吉思汗陵 #蒙古文化',
    likes: 156,
    status: 'published',
    createTime: new Date('2026-04-07'),
    updateTime: new Date()
  },
  {
    title: '陵前倩影·初识草原',
    category: 'mausoleum',
    tags: ['陵前写真', '蒙古袍', '小清新'],
    images: ['cloud://prod-xxx/gallery/mausoleum/mausoleum_03.jpg'],
    copyText: '第一次穿上蒙古袍，站在成吉思汗陵前，感受草原文化的厚重与美丽 🌿 #旅拍 #蒙古袍',
    likes: 89,
    status: 'published',
    createTime: new Date('2026-04-06'),
    updateTime: new Date()
  },
  {
    title: '陵前守望·传承',
    category: 'mausoleum',
    tags: ['陵前写真', '蒙古袍', '传统'],
    images: ['cloud://prod-xxx/gallery/mausoleum/mausoleum_04.jpg'],
    copyText: '守望这片草原，传承这份文化。每一张照片都是一段故事 📸 #成吉思汗陵旅拍',
    likes: 201,
    status: 'published',
    createTime: new Date('2026-04-05'),
    updateTime: new Date()
  },
  // grassland(草原旅拍) - 4张
  {
    title: '草原深处·自由之风',
    category: 'grassland',
    tags: ['草原旅拍', '蒙古袍', '自由'],
    images: ['cloud://prod-xxx/gallery/grassland/grassland_01.jpg'],
    copyText: '草原的风，吹动我的衣袂。在这片辽阔的土地上，感受自由的呼吸 🌾 #草原旅拍 #蒙古袍',
    likes: 245,
    status: 'published',
    createTime: new Date('2026-04-08'),
    updateTime: new Date()
  },
  {
    title: '草原日落·金色时光',
    category: 'grassland',
    tags: ['草原旅拍', '日落', '金色'],
    images: ['cloud://prod-xxx/gallery/grassland/grassland_02.jpg'],
    copyText: '草原的日落，是大自然最美的馈赠。金色的光芒洒满大地，这一刻定格永恒 🌅 #草原日落',
    likes: 312,
    status: 'published',
    createTime: new Date('2026-04-07'),
    updateTime: new Date()
  },
  {
    title: '草原牧歌·诗意栖居',
    category: 'grassland',
    tags: ['草原旅拍', '蒙古袍', '诗意'],
    images: ['cloud://prod-xxx/gallery/grassland/grassland_03.jpg'],
    copyText: '天苍苍，野茫茫，风吹草低见牛羊。这就是草原的诗意生活 🐑 #草原风情 #旅拍',
    likes: 178,
    status: 'published',
    createTime: new Date('2026-04-06'),
    updateTime: new Date()
  },
  {
    title: '草原晨露·清新时光',
    category: 'grassland',
    tags: ['草原旅拍', '清晨', '自然'],
    images: ['cloud://prod-xxx/gallery/grassland/grassland_04.jpg'],
    copyText: '清晨的草原，露珠还未散去。空气里都是青草和泥土的芬芳 🌿 #草原旅拍 #清晨',
    likes: 134,
    status: 'published',
    createTime: new Date('2026-04-05'),
    updateTime: new Date()
  },
  // couple(情侣私奔) - 4张
  {
    title: '草原之恋·双人行',
    category: 'couple',
    tags: ['情侣写真', '蒙古袍', '浪漫'],
    images: ['cloud://prod-xxx/gallery/couple/couple_01.jpg'],
    copyText: '和你一起，在草原上留下最美的回忆。这是我们的私奔之旅 💕 #情侣写真 #草原旅拍',
    likes: 423,
    status: 'published',
    createTime: new Date('2026-04-08'),
    updateTime: new Date()
  },
  {
    title: '草原誓言·执子之手',
    category: 'couple',
    tags: ['情侣写真', '蒙古袍', '誓言'],
    images: ['cloud://prod-xxx/gallery/couple/couple_02.jpg'],
    copyText: '在这片草原上，许下我们的誓言。执子之手，与子偕老 💑 #情侣旅拍 #草原爱情',
    likes: 567,
    status: 'published',
    createTime: new Date('2026-04-07'),
    updateTime: new Date()
  },
  {
    title: '草原相依·甜蜜时光',
    category: 'couple',
    tags: ['情侣写真', '蒙古袍', '甜蜜'],
    images: ['cloud://prod-xxx/gallery/couple/couple_03.jpg'],
    copyText: '相依相偎，在草原的怀抱里。这一刻，世界只有我们 💕 #情侣旅拍 #甜蜜',
    likes: 389,
    status: 'published',
    createTime: new Date('2026-04-06'),
    updateTime: new Date()
  },
  {
    title: '草原约定·一生一世',
    category: 'couple',
    tags: ['情侣写真', '蒙古袍', '约定'],
    images: ['cloud://prod-xxx/gallery/couple/couple_04.jpg'],
    copyText: '草原为证，天地为鉴。我们的约定，一生一世 💍 #情侣写真 #草原约定',
    likes: 445,
    status: 'published',
    createTime: new Date('2026-04-05'),
    updateTime: new Date()
  },
  // children(儿童成长) - 4张
  {
    title: '草原小勇士·童年记忆',
    category: 'children',
    tags: ['儿童写真', '蒙古袍', '童年'],
    images: ['cloud://prod-xxx/gallery/children/children_01.jpg'],
    copyText: '小小蒙古勇士，大大的梦想。记录孩子最纯真的笑容 👶 #儿童写真 #蒙古袍',
    likes: 298,
    status: 'published',
    createTime: new Date('2026-04-08'),
    updateTime: new Date()
  },
  {
    title: '草原小公主·天真烂漫',
    category: 'children',
    tags: ['儿童写真', '蒙古袍', '公主'],
    images: ['cloud://prod-xxx/gallery/children/children_02.jpg'],
    copyText: '穿上蒙古袍的小公主，天真烂漫的笑容治愈一切。这是最美的童年记忆 👧 #儿童旅拍',
    likes: 356,
    status: 'published',
    createTime: new Date('2026-04-07'),
    updateTime: new Date()
  },
  {
    title: '草原小骑手·勇敢前行',
    category: 'children',
    tags: ['儿童写真', '蒙古袍', '勇敢'],
    images: ['cloud://prod-xxx/gallery/children/children_03.jpg'],
    copyText: '草原上的小骑手，勇敢又可爱。愿你在人生的道路上，永远这么勇敢 🐎 #儿童写真',
    likes: 412,
    status: 'published',
    createTime: new Date('2026-04-06'),
    updateTime: new Date()
  },
  {
    title: '草原小天使·纯真年代',
    category: 'children',
    tags: ['儿童写真', '蒙古袍', '纯真'],
    images: ['cloud://prod-xxx/gallery/children/children_04.jpg'],
    copyText: '草原上的小天使，纯真的眼神里藏着星辰大海。记录成长的每一个瞬间 ✨ #儿童旅拍',
    likes: 334,
    status: 'published',
    createTime: new Date('2026-04-05'),
    updateTime: new Date()
  }
]

// 店铺设置数据
const settings = {
  shopName: '朵兰摄影·静安雨霞',
  phone: '15647755403',
  address: '内蒙古鄂尔多斯市伊金霍洛旗成吉思汗陵旅游区',
  longitude: 109.8023,
  latitude: 39.5883,
  businessHours: { start: '09:00', end: '20:00' },
  restDays: [],
  announcement: '春季特惠活动进行中！预约即享9折优惠',
  createTime: new Date(),
  updateTime: new Date()
}

// 清空集合并批量添加数据
async function initCollection(collectionName, data) {
  const collection = db.collection(collectionName)
  
  console.log(`\n【${collectionName}】初始化开始...`)
  
  try {
    // 1. 获取所有文档并删除
    const { data: existingDocs } = await collection.limit(100).get()
    
    if (existingDocs.length > 0) {
      console.log(`  发现 ${existingDocs.length} 条现有数据，正在清空...`)
      const batch = db.batch()
      
      for (const doc of existingDocs) {
        batch.remove(collection.doc(doc._id))
      }
      
      await batch.commit()
      console.log(`  ✓ 已清空现有数据`)
    }
    
    // 2. 批量添加新数据
    if (Array.isArray(data)) {
      // 数组数据 - 批量添加
      const batch = db.batch()
      
      for (const item of data) {
        batch.add({ data: item })
      }
      
      await batch.commit()
      console.log(`  ✓ 成功添加 ${data.length} 条数据`)
    } else {
      // 单条数据
      await collection.add({ data })
      console.log(`  ✓ 成功添加设置数据`)
    }
    
    return { success: true, count: Array.isArray(data) ? data.length : 1 }
  } catch (err) {
    console.error(`  ✗ 初始化失败: ${err.message}`)
    return { success: false, error: err.message }
  }
}

// 主函数
exports.main = async (event, context) => {
  console.log('=== 云数据库初始化开始 ===\n')
  
  const results = {
    packages: await initCollection('packages', packages),
    gallery: await initCollection('gallery', gallery),
    settings: await initCollection('settings', settings)
  }
  
  console.log('\n=== 初始化完成 ===')
  console.log('结果:', JSON.stringify(results, null, 2))
  
  return {
    success: true,
    message: '数据库初始化完成',
    results
  }
}

// 本地测试支持（直接运行 node init-cloud-data.js）
if (require.main === module) {
  console.log('提示：此脚本需要在微信云开发环境中运行')
  console.log('使用方法：')
  console.log('1. 在微信开发者工具中创建一个临时云函数（如 init-data）')
  console.log('2. 将此文件内容复制到云函数的 index.js 中')
  console.log('3. 部署并运行该云函数')
  console.log('')
  console.log('或者通过云开发控制台手动导入数据：')
  console.log('- packages 集合:', JSON.stringify(packages, null, 2))
  console.log('- gallery 集合:', JSON.stringify(gallery, null, 2))
  console.log('- settings 集合:', JSON.stringify(settings, null, 2))
}
