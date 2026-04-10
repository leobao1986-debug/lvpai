/**
 * Mock 数据 - 本地开发环境使用
 * 模拟真实业务数据，云函数部署后可移除
 */

// Mock 用户数据
export const MOCK_USERS = {
  user: {
    _id: 'mock_user_001',
    openid: 'mock_openid_user',
    nickname: '草原游客',
    avatar: '/static/images/gallery/9.jpg',
    phone: '13800138000',
    role: 'user',
    createTime: '2026-04-01T10:00:00'
  },
  admin: {
    _id: 'mock_admin_001',
    openid: 'mock_openid_admin',
    nickname: '朵兰摄影',
    avatar: '/static/images/gallery/1.jpg',
    phone: '13900139000',
    role: 'admin',
    createTime: '2026-01-01T10:00:00'
  }
}

// Mock 套餐数据
export const MOCK_PACKAGES = [
  // 个人旅拍套系
  {
    _id: 'pkg_001',
    name: '圣地爆款·尊享款',
    category: 'personal',
    price: 399,
    originalPrice: 599,
    deposit: 100,
    duration: 45,
    clothCount: 1,
    photoCount: 6,
    description: '1服1造 全套定制妆造，成吉思汗陵专属地标机位拍摄',
    coverImage: '/static/images/packages/pkg1.jpg',
    images: ['/static/images/packages/pkg1.jpg', '/static/images/gallery/1.jpg', '/static/images/gallery/2.jpg'],
    features: [
      '1服1造 全套定制妆造（含专业妆容+头饰造型）',
      '精修6张 高清大片直出',
      '原图20张以上 全部免费送',
      '成吉思汗陵专属地标机位拍摄'
    ],
    tag: 'HOT',
    sortOrder: 1,
    status: 'on',
    createTime: '2026-04-01'
  },
  {
    _id: 'pkg_002',
    name: '尝鲜体验款',
    category: 'personal',
    price: 199,
    deposit: 50,
    duration: 20,
    clothCount: 1,
    photoCount: 2,
    description: '体验式拍摄，快速出片，适合初次尝试旅拍的游客',
    coverImage: '/static/images/packages/pkg2.jpg',
    images: ['/static/images/packages/pkg2.jpg', '/static/images/gallery/3.jpg'],
    features: [
      '体验式拍摄1组（不含化妆）',
      '精修2张 快速出片',
      '原图10张以上 全部免费送'
    ],
    sortOrder: 2,
    status: 'on',
    createTime: '2026-04-01'
  },
  {
    _id: 'pkg_003',
    name: '省心入门款',
    category: 'personal',
    price: 299,
    deposit: 80,
    duration: 30,
    clothCount: 1,
    photoCount: 4,
    description: '1服简妆 基础造型，性价比之选',
    coverImage: '/static/images/packages/pkg3.jpg',
    images: ['/static/images/packages/pkg3.jpg', '/static/images/gallery/5.jpg'],
    features: [
      '1服简妆 基础造型',
      '精修4张 高清出片',
      '原图20张以上 全部免费送'
    ],
    sortOrder: 3,
    status: 'on',
    createTime: '2026-04-01'
  },
  // 情侣旅拍套系
  {
    _id: 'pkg_004',
    name: '草原盟约款',
    category: 'couple',
    price: 699,
    deposit: 200,
    duration: 60,
    clothCount: 1,
    photoCount: 6,
    description: '2人1服1造 全套定制妆，专业摄影师全程跟拍+景区定制浪漫路线',
    coverImage: '/static/images/packages/pkg4.jpg',
    images: ['/static/images/packages/pkg4.jpg', '/static/images/gallery/7.jpg', '/static/images/gallery/11.jpg'],
    features: [
      '2人1服1造 全套定制妆',
      '专业摄影师全程跟拍+景区定制浪漫路线',
      '精修6张 氛围感大片直出',
      '原图20张以上 全部免费送'
    ],
    tag: '情侣首选',
    sortOrder: 4,
    status: 'on',
    createTime: '2026-04-01'
  },
  // 亲子旅拍套系
  {
    _id: 'pkg_005',
    name: '阖家盛景款',
    category: 'family',
    price: 699,
    deposit: 200,
    duration: 60,
    clothCount: 1,
    photoCount: 6,
    description: '4人以内1服1造 全套定制妆造，长辈/儿童专属民族服饰搭配',
    coverImage: '/static/images/packages/pkg5.jpg',
    images: ['/static/images/packages/pkg5.jpg', '/static/images/gallery/4.jpg', '/static/images/gallery/8.jpg'],
    features: [
      '4人以内1服1造 全套定制妆造',
      '长辈/儿童专属民族服饰搭配',
      '精修6张 全家福大片直出',
      '原图20张以上 全部免费送',
      '4人以内无额外加价，加1人仅收200元拍摄费'
    ],
    tag: '家庭首选',
    sortOrder: 5,
    status: 'on',
    createTime: '2026-04-01'
  }
]

// Mock 客片数据 - 16张图片分配到4个分类
export const MOCK_GALLERY = [
  // mausoleum(陵前写真) - 4张
  {
    _id: 'gallery_001',
    title: '陵前盛装·蒙古公主',
    category: 'mausoleum',
    tags: ['陵前写真', '蒙古袍', '民族风'],
    coverImage: '/static/images/gallery/1.jpg',
    images: ['/static/images/gallery/1.jpg'],
    copyText: '在成吉思汗陵前，穿一身盛装，做一回草原公主 🏛️✨ #成吉思汗陵旅拍 #蒙古袍写真',
    likes: 128,
    status: 'published',
    createTime: '2026-04-08'
  },
  {
    _id: 'gallery_005',
    title: '陵前回眸·岁月如歌',
    category: 'mausoleum',
    tags: ['陵前写真', '蒙古袍', '经典'],
    coverImage: '/static/images/gallery/5.jpg',
    images: ['/static/images/gallery/5.jpg'],
    copyText: '陵前一回眸，穿越千年的时光。这是属于草原儿女的骄傲与荣光 🏛️ #成吉思汗陵 #蒙古文化',
    likes: 156,
    status: 'published',
    createTime: '2026-04-07'
  },
  {
    _id: 'gallery_009',
    title: '陵前倩影·初识草原',
    category: 'mausoleum',
    tags: ['陵前写真', '蒙古袍', '小清新'],
    coverImage: '/static/images/gallery/9.jpg',
    images: ['/static/images/gallery/9.jpg'],
    copyText: '第一次穿上蒙古袍，站在成吉思汗陵前，感受草原文化的厚重与美丽 🌿 #旅拍 #蒙古袍',
    likes: 89,
    status: 'published',
    createTime: '2026-04-06'
  },
  {
    _id: 'gallery_013',
    title: '陵前守望·传承',
    category: 'mausoleum',
    tags: ['陵前写真', '蒙古袍', '传统'],
    coverImage: '/static/images/gallery/13.jpg',
    images: ['/static/images/gallery/13.jpg'],
    copyText: '守望这片草原，传承这份文化。每一张照片都是一段故事 📸 #成吉思汗陵旅拍',
    likes: 201,
    status: 'published',
    createTime: '2026-04-05'
  },
  // grassland(草原旅拍) - 4张
  {
    _id: 'gallery_002',
    title: '草原深处·自由之风',
    category: 'grassland',
    tags: ['草原旅拍', '蒙古袍', '自由'],
    coverImage: '/static/images/gallery/2.jpg',
    images: ['/static/images/gallery/2.jpg'],
    copyText: '草原的风，吹动我的衣袂。在这片辽阔的土地上，感受自由的呼吸 🌾 #草原旅拍 #蒙古袍',
    likes: 245,
    status: 'published',
    createTime: '2026-04-08'
  },
  {
    _id: 'gallery_006',
    title: '草原日落·金色时光',
    category: 'grassland',
    tags: ['草原旅拍', '日落', '金色'],
    coverImage: '/static/images/gallery/6.jpg',
    images: ['/static/images/gallery/6.jpg'],
    coverImage: '/static/images/gallery/6.jpg',
    copyText: '草原的日落，是大自然最美的馈赠。金色的光芒洒满大地，这一刻定格永恒 🌅 #草原日落',
    likes: 312,
    status: 'published',
    createTime: '2026-04-07'
  },
  {
    _id: 'gallery_010',
    title: '草原牧歌·诗意栖居',
    category: 'grassland',
    tags: ['草原旅拍', '蒙古袍', '诗意'],
    coverImage: '/static/images/gallery/10.jpg',
    images: ['/static/images/gallery/10.jpg'],
    copyText: '天苍苍，野茫茫，风吹草低见牛羊。这就是草原的诗意生活 🐑 #草原风情 #旅拍',
    likes: 178,
    status: 'published',
    createTime: '2026-04-06'
  },
  {
    _id: 'gallery_014',
    title: '草原晨露·清新时光',
    category: 'grassland',
    tags: ['草原旅拍', '清晨', '自然'],
    coverImage: '/static/images/gallery/14.jpg',
    images: ['/static/images/gallery/14.jpg'],
    copyText: '清晨的草原，露珠还未散去。空气里都是青草和泥土的芬芳 🌿 #草原旅拍 #清晨',
    likes: 134,
    status: 'published',
    createTime: '2026-04-05'
  },
  // couple(情侣私奔) - 4张
  {
    _id: 'gallery_003',
    title: '草原之恋·双人行',
    category: 'couple',
    tags: ['情侣写真', '蒙古袍', '浪漫'],
    coverImage: '/static/images/gallery/3.jpg',
    images: ['/static/images/gallery/3.jpg'],
    copyText: '和你一起，在草原上留下最美的回忆。这是我们的私奔之旅 💕 #情侣写真 #草原旅拍',
    likes: 423,
    status: 'published',
    createTime: '2026-04-08'
  },
  {
    _id: 'gallery_007',
    title: '草原誓言·执子之手',
    category: 'couple',
    tags: ['情侣写真', '蒙古袍', '誓言'],
    coverImage: '/static/images/gallery/7.jpg',
    images: ['/static/images/gallery/7.jpg'],
    copyText: '在这片草原上，许下我们的誓言。执子之手，与子偕老 💑 #情侣旅拍 #草原爱情',
    likes: 567,
    status: 'published',
    createTime: '2026-04-07'
  },
  {
    _id: 'gallery_011',
    title: '草原相依·甜蜜时光',
    category: 'couple',
    tags: ['情侣写真', '蒙古袍', '甜蜜'],
    coverImage: '/static/images/gallery/11.jpg',
    images: ['/static/images/gallery/11.jpg'],
    copyText: '相依相偎，在草原的怀抱里。这一刻，世界只有我们 💕 #情侣旅拍 #甜蜜',
    likes: 389,
    status: 'published',
    createTime: '2026-04-06'
  },
  {
    _id: 'gallery_015',
    title: '草原约定·一生一世',
    category: 'couple',
    tags: ['情侣写真', '蒙古袍', '约定'],
    coverImage: '/static/images/gallery/15.jpg',
    images: ['/static/images/gallery/15.jpg'],
    copyText: '草原为证，天地为鉴。我们的约定，一生一世 💍 #情侣写真 #草原约定',
    likes: 445,
    status: 'published',
    createTime: '2026-04-05'
  },
  // children(儿童成长) - 4张
  {
    _id: 'gallery_004',
    title: '草原小勇士·童年记忆',
    category: 'children',
    tags: ['儿童写真', '蒙古袍', '童年'],
    coverImage: '/static/images/gallery/4.jpg',
    images: ['/static/images/gallery/4.jpg'],
    copyText: '小小蒙古勇士，大大的梦想。记录孩子最纯真的笑容 👶 #儿童写真 #蒙古袍',
    likes: 298,
    status: 'published',
    createTime: '2026-04-08'
  },
  {
    _id: 'gallery_008',
    title: '草原小公主·天真烂漫',
    category: 'children',
    tags: ['儿童写真', '蒙古袍', '公主'],
    coverImage: '/static/images/gallery/8.jpg',
    images: ['/static/images/gallery/8.jpg'],
    copyText: '穿上蒙古袍的小公主，天真烂漫的笑容治愈一切。这是最美的童年记忆 👧 #儿童旅拍',
    likes: 356,
    status: 'published',
    createTime: '2026-04-07'
  },
  {
    _id: 'gallery_012',
    title: '草原小骑手·勇敢前行',
    category: 'children',
    tags: ['儿童写真', '蒙古袍', '勇敢'],
    coverImage: '/static/images/gallery/12.jpg',
    images: ['/static/images/gallery/12.jpg'],
    copyText: '草原上的小骑手，勇敢又可爱。愿你在人生的道路上，永远这么勇敢 🐎 #儿童写真',
    likes: 412,
    status: 'published',
    createTime: '2026-04-06'
  },
  {
    _id: 'gallery_016',
    title: '草原小天使·纯真年代',
    category: 'children',
    tags: ['儿童写真', '蒙古袍', '纯真'],
    coverImage: '/static/images/gallery/16.jpg',
    images: ['/static/images/gallery/16.jpg'],
    copyText: '草原上的小天使，纯真的眼神里藏着星辰大海。记录成长的每一个瞬间 ✨ #儿童旅拍',
    likes: 334,
    status: 'published',
    createTime: '2026-04-05'
  }
]

// Mock 预约数据
export const MOCK_BOOKINGS = [
  {
    _id: 'booking_001',
    userId: 'mock_openid_user',
    packageId: 'pkg_001',
    packageName: '【陵前印记】基础套餐',
    packagePrice: 299,
    date: '2026-04-15',
    timeSlot: '09:00',
    contactName: '张小明',
    contactPhone: '13800138001',
    persons: 2,
    status: 'confirmed',
    remark: '希望多拍一些合影',
    createTime: '2026-04-08T10:30:00'
  },
  {
    _id: 'booking_002',
    userId: 'mock_openid_user',
    packageId: 'pkg_002',
    packageName: '【草原征途】进阶套餐',
    packagePrice: 899,
    date: '2026-04-20',
    timeSlot: '17:00',
    contactName: '李小红',
    contactPhone: '13800138002',
    persons: 1,
    status: 'pending',
    remark: '',
    createTime: '2026-04-09T09:00:00'
  }
]

// Mock 订单数据
export const MOCK_ORDERS = [
  {
    _id: 'order_001',
    bookingId: 'booking_001',
    userId: 'mock_openid_user',
    packageId: 'pkg_001',
    packageName: '【陵前印记】基础套餐',
    totalPrice: 299,
    depositAmount: 99,
    payStatus: 'paid',
    orderNo: 'LP20260408103000001',
    payTime: '2026-04-08T10:35:00',
    refundTime: null,
    createTime: '2026-04-08T10:30:00'
  },
  {
    _id: 'order_002',
    bookingId: 'booking_002',
    userId: 'mock_openid_user',
    packageId: 'pkg_002',
    packageName: '【草原征途】进阶套餐',
    totalPrice: 899,
    depositAmount: 199,
    payStatus: 'unpaid',
    orderNo: 'LP20260409090000001',
    payTime: null,
    refundTime: null,
    createTime: '2026-04-09T09:00:00'
  }
]

// Mock 可用时段 - 返回已预约的时段列表
export const MOCK_AVAILABLE_SLOTS = {
  date: '2026-04-15',
  bookedSlots: ['09:00', '14:00', '17:00']  // 已被预约的时段
}

// Mock 统计数据（管理端）
export const MOCK_STATS = {
  todayBookings: 5,
  pendingOrders: 3,
  monthIncome: 8960,
  totalGallery: 16,
  totalBookings: 128,
  totalUsers: 356
}

// Mock 首页 Banner 数据
export const MOCK_BANNERS = [
  {
    _id: 'banner_001',
    image: '/static/images/banner/banner1.jpg',
    title: '成吉思汗陵旅拍',
    subtitle: '穿上蒙古袍，做一回草原儿女',
    link: '/pages/packages/list'
  },
  {
    _id: 'banner_002',
    image: '/static/images/banner/banner2.jpg',
    title: '草原深度旅拍',
    subtitle: '专业团队 · 定制路线 · 航拍服务',
    link: '/pages/packages/detail?id=pkg_002'
  },
  {
    _id: 'banner_003',
    image: '/static/images/banner/banner3.jpg',
    title: '全家福套餐',
    subtitle: '记录家族的草原传奇时刻',
    link: '/pages/packages/detail?id=pkg_003'
  }
]

// Mock 必拍场景
export const MOCK_SCENES = [
  {
    _id: 'scene_001',
    name: '陵前广场',
    description: '成吉思汗陵前，感受草原文化的庄严与神圣',
    image: '/static/images/scenes/scene1.jpg'
  },
  {
    _id: 'scene_002',
    name: '草原日落',
    description: '金色的阳光洒满草原，最美的光影时刻',
    image: '/static/images/scenes/scene2.jpg'
  },
  {
    _id: 'scene_003',
    name: '蒙古包群',
    description: '传统蒙古包背景，体验最纯正的草原风情',
    image: '/static/images/scenes/scene3.jpg'
  }
]
