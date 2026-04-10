const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const results = { packages: null, gallery: null, settings: null }
  
  try {
    // 1. 初始化 packages 集合
    // 先清空
    const existingPkgs = await db.collection('packages').get()
    for (const item of existingPkgs.data) {
      await db.collection('packages').doc(item._id).remove()
    }
    
    // 插入5个套餐（对齐海报内容）
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
        features: ['1服1造 全套定制妆造（含专业妆容+头饰造型）','精修6张 高清大片直出','原图20张以上 全部免费送','成吉思汗陵专属地标机位拍摄'],
        coverImage: 'gallery/mausoleum/mausoleum_01.jpg',
        images: ['gallery/mausoleum/mausoleum_01.jpg','gallery/mausoleum/mausoleum_02.jpg'],
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
        features: ['体验式拍摄1组（不含化妆）','精修2张 快速出片','原图10张以上 全部免费送'],
        coverImage: 'gallery/grassland/grassland_01.jpg',
        images: ['gallery/grassland/grassland_01.jpg'],
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
        features: ['1服简妆 基础造型','精修4张 高清出片','原图20张以上 全部免费送'],
        coverImage: 'gallery/grassland/grassland_02.jpg',
        images: ['gallery/grassland/grassland_02.jpg'],
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
        features: ['2人1服1造 全套定制妆','专业摄影师全程跟拍+景区定制浪漫路线','精修6张 氛围感大片直出','原图20张以上 全部免费送'],
        coverImage: 'gallery/couple/couple_01.jpg',
        images: ['gallery/couple/couple_01.jpg','gallery/couple/couple_02.jpg'],
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
        features: ['4人以内1服1造 全套定制妆造','长辈/儿童专属民族服饰搭配','精修6张 全家福大片直出','原图20张以上 全部免费送','4人以内无额外加价，加1人仅收200元拍摄费'],
        coverImage: 'gallery/children/children_01.jpg',
        images: ['gallery/children/children_01.jpg','gallery/children/children_02.jpg'],
        tag: '家庭首选',
        sortOrder: 5,
        status: 'active',
        createTime: new Date(),
        updateTime: new Date()
      }
    ]
    
    for (const pkg of packages) {
      await db.collection('packages').add({ data: pkg })
    }
    results.packages = `成功插入 ${packages.length} 个套餐`

    // 2. 初始化 gallery 集合 - 16条客片
    const existingGallery = await db.collection('gallery').get()
    for (const item of existingGallery.data) {
      await db.collection('gallery').doc(item._id).remove()
    }
    
    const galleryItems = [
      { title: '陵前盛装·蒙古公主', category: 'mausoleum', tags: ['个人写真','陵前'], coverImage: 'gallery/mausoleum/mausoleum_01.jpg', images: ['gallery/mausoleum/mausoleum_01.jpg'], copyText: '成吉思汗陵前的蒙古公主', likes: 128, status: 'published', createTime: '2026-03-15' },
      { title: '陵前回眸·岁月如歌', category: 'mausoleum', tags: ['个人写真','回眸'], coverImage: 'gallery/mausoleum/mausoleum_02.jpg', images: ['gallery/mausoleum/mausoleum_02.jpg'], copyText: '陵前一回眸，岁月皆温柔', likes: 95, status: 'published', createTime: '2026-03-10' },
      { title: '陵前守望·草原之心', category: 'mausoleum', tags: ['个人写真','守望'], coverImage: 'gallery/mausoleum/mausoleum_03.jpg', images: ['gallery/mausoleum/mausoleum_03.jpg'], copyText: '守望草原的心', likes: 86, status: 'published', createTime: '2026-03-05' },
      { title: '陵前晨光·金色年华', category: 'mausoleum', tags: ['个人写真','晨光'], coverImage: 'gallery/mausoleum/mausoleum_04.jpg', images: ['gallery/mausoleum/mausoleum_04.jpg'], copyText: '晨光中的金色年华', likes: 72, status: 'published', createTime: '2026-03-01' },
      { title: '草原深处·自由之风', category: 'grassland', tags: ['草原','自由'], coverImage: 'gallery/grassland/grassland_01.jpg', images: ['gallery/grassland/grassland_01.jpg'], copyText: '草原深处的自由之风', likes: 156, status: 'published', createTime: '2026-03-14' },
      { title: '草原日落·金色时光', category: 'grassland', tags: ['草原','日落'], coverImage: 'gallery/grassland/grassland_02.jpg', images: ['gallery/grassland/grassland_02.jpg'], copyText: '金色的草原日落', likes: 134, status: 'published', createTime: '2026-03-12' },
      { title: '草原晨露·清新世界', category: 'grassland', tags: ['草原','晨露'], coverImage: 'gallery/grassland/grassland_03.jpg', images: ['gallery/grassland/grassland_03.jpg'], copyText: '晨露中的清新世界', likes: 98, status: 'published', createTime: '2026-03-08' },
      { title: '草原牧歌·悠然自得', category: 'grassland', tags: ['草原','牧歌'], coverImage: 'gallery/grassland/grassland_04.jpg', images: ['gallery/grassland/grassland_04.jpg'], copyText: '悠然自得的草原牧歌', likes: 88, status: 'published', createTime: '2026-03-03' },
      { title: '草原之恋·双人行', category: 'couple', tags: ['情侣','草原'], coverImage: 'gallery/couple/couple_01.jpg', images: ['gallery/couple/couple_01.jpg'], copyText: '草原上的双人行', likes: 178, status: 'published', createTime: '2026-03-13' },
      { title: '草原相依·温暖时刻', category: 'couple', tags: ['情侣','相依'], coverImage: 'gallery/couple/couple_02.jpg', images: ['gallery/couple/couple_02.jpg'], copyText: '相依的温暖时刻', likes: 145, status: 'published', createTime: '2026-03-11' },
      { title: '草原约定·永恒之约', category: 'couple', tags: ['情侣','约定'], coverImage: 'gallery/couple/couple_03.jpg', images: ['gallery/couple/couple_03.jpg'], copyText: '草原上的永恒之约', likes: 112, status: 'published', createTime: '2026-03-07' },
      { title: '草原誓言·执子之手', category: 'couple', tags: ['情侣','誓言'], coverImage: 'gallery/couple/couple_04.jpg', images: ['gallery/couple/couple_04.jpg'], copyText: '执子之手的草原誓言', likes: 99, status: 'published', createTime: '2026-03-02' },
      { title: '草原小勇士·童年记忆', category: 'children', tags: ['儿童','勇士'], coverImage: 'gallery/children/children_01.jpg', images: ['gallery/children/children_01.jpg'], copyText: '童年的小勇士', likes: 167, status: 'published', createTime: '2026-03-09' },
      { title: '草原小骑手·马背少年', category: 'children', tags: ['儿童','骑手'], coverImage: 'gallery/children/children_02.jpg', images: ['gallery/children/children_02.jpg'], copyText: '马背上的少年', likes: 143, status: 'published', createTime: '2026-03-06' },
      { title: '草原小公主·天真烂漫', category: 'children', tags: ['儿童','公主'], coverImage: 'gallery/children/children_03.jpg', images: ['gallery/children/children_03.jpg'], copyText: '天真烂漫的小公主', likes: 121, status: 'published', createTime: '2026-03-04' },
      { title: '草原小天使·纯真笑容', category: 'children', tags: ['儿童','天使'], coverImage: 'gallery/children/children_04.jpg', images: ['gallery/children/children_04.jpg'], copyText: '纯真笑容的小天使', likes: 108, status: 'published', createTime: '2026-02-28' }
    ]
    
    for (const item of galleryItems) {
      await db.collection('gallery').add({ data: item })
    }
    results.gallery = `成功插入 ${galleryItems.length} 条客片`

    // 3. 初始化 settings 集合
    const existingSettings = await db.collection('settings').get()
    for (const item of existingSettings.data) {
      await db.collection('settings').doc(item._id).remove()
    }
    
    await db.collection('settings').add({
      data: {
        shopName: '朵兰摄影·静安雨霞',
        phone: '15647755403',
        phone2: '15247725403',
        address: '内蒙古鄂尔多斯市伊金霍洛旗成吉思汗陵旅游区',
        longitude: 109.8023,
        latitude: 39.5883,
        businessHours: { start: '09:00', end: '20:00' },
        restDays: [],
        announcement: '春季特惠活动进行中！预约即享9折优惠',
        createTime: new Date(),
        updateTime: new Date()
      }
    })
    results.settings = '成功初始化店铺设置'

    return { code: 0, message: '数据库初始化完成', data: results }
  } catch (err) {
    return { code: -1, message: err.message, data: results }
  }
}
