/**
 * Mock 数据 - 管理后台使用
 * 图片路径使用占位图或网络图片
 */

// Mock 用户数据
export const MOCK_USERS = {
  user: {
    _id: 'mock_user_001',
    openid: 'mock_openid_user',
    nickname: '草原游客',
    avatar: 'https://picsum.photos/200?random=9',
    phone: '13800138000',
    role: 'user',
    createTime: '2026-04-01T10:00:00'
  },
  admin: {
    _id: 'mock_admin_001',
    openid: 'mock_openid_admin',
    nickname: '朵兰摄影',
    avatar: 'https://picsum.photos/200?random=1',
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
    coverImage: 'https://picsum.photos/400/300?random=pkg1',
    images: ['https://picsum.photos/400/300?random=pkg1', 'https://picsum.photos/400/300?random=1', 'https://picsum.photos/400/300?random=2'],
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
    coverImage: 'https://picsum.photos/400/300?random=pkg2',
    images: ['https://picsum.photos/400/300?random=pkg2', 'https://picsum.photos/400/300?random=3'],
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
    coverImage: 'https://picsum.photos/400/300?random=pkg3',
    images: ['https://picsum.photos/400/300?random=pkg3', 'https://picsum.photos/400/300?random=5'],
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
    coverImage: 'https://picsum.photos/400/300?random=pkg4',
    images: ['https://picsum.photos/400/300?random=pkg4', 'https://picsum.photos/400/300?random=7', 'https://picsum.photos/400/300?random=11'],
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
    coverImage: 'https://picsum.photos/400/300?random=pkg5',
    images: ['https://picsum.photos/400/300?random=pkg5', 'https://picsum.photos/400/300?random=4', 'https://picsum.photos/400/300?random=8'],
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

// Mock 客片数据
export const MOCK_GALLERY = [
  {
    _id: 'gallery_001',
    title: '陵前盛装·蒙古公主',
    category: 'mausoleum',
    tags: ['陵前写真', '蒙古袍', '民族风'],
    coverImage: 'https://picsum.photos/400/300?random=1',
    images: ['https://picsum.photos/400/300?random=1'],
    copyText: '在成吉思汗陵前，穿一身盛装，做一回草原公主 🏛️✨ #成吉思汗陵旅拍 #蒙古袍写真',
    likes: 128,
    status: 'published',
    createTime: '2026-04-08'
  },
  {
    _id: 'gallery_002',
    title: '草原深处·自由之风',
    category: 'grassland',
    tags: ['草原旅拍', '蒙古袍', '自由'],
    coverImage: 'https://picsum.photos/400/300?random=2',
    images: ['https://picsum.photos/400/300?random=2'],
    copyText: '草原的风，吹动我的衣袂。在这片辽阔的土地上，感受自由的呼吸 🌾 #草原旅拍 #蒙古袍',
    likes: 245,
    status: 'published',
    createTime: '2026-04-08'
  },
  {
    _id: 'gallery_003',
    title: '草原之恋·双人行',
    category: 'couple',
    tags: ['情侣写真', '蒙古袍', '浪漫'],
    coverImage: 'https://picsum.photos/400/300?random=3',
    images: ['https://picsum.photos/400/300?random=3'],
    copyText: '和你一起，在草原上留下最美的回忆。这是我们的私奔之旅 💕 #情侣写真 #草原旅拍',
    likes: 423,
    status: 'published',
    createTime: '2026-04-08'
  },
  {
    _id: 'gallery_004',
    title: '草原小勇士·童年记忆',
    category: 'children',
    tags: ['儿童写真', '蒙古袍', '童年'],
    coverImage: 'https://picsum.photos/400/300?random=4',
    images: ['https://picsum.photos/400/300?random=4'],
    copyText: '小小蒙古勇士，大大的梦想。记录孩子最纯真的笑容 👶 #儿童写真 #蒙古袍',
    likes: 298,
    status: 'published',
    createTime: '2026-04-08'
  },
  {
    _id: 'gallery_005',
    title: '陵前回眸·岁月如歌',
    category: 'mausoleum',
    tags: ['陵前写真', '蒙古袍', '经典'],
    coverImage: 'https://picsum.photos/400/300?random=5',
    images: ['https://picsum.photos/400/300?random=5'],
    copyText: '陵前一回眸，穿越千年的时光。这是属于草原儿女的骄傲与荣光 🏛️ #成吉思汗陵 #蒙古文化',
    likes: 156,
    status: 'published',
    createTime: '2026-04-07'
  },
  {
    _id: 'gallery_006',
    title: '草原日落·金色时光',
    category: 'grassland',
    tags: ['草原旅拍', '日落', '金色'],
    coverImage: 'https://picsum.photos/400/300?random=6',
    images: ['https://picsum.photos/400/300?random=6'],
    copyText: '草原的日落，是大自然最美的馈赠。金色的光芒洒满大地，这一刻定格永恒 🌅 #草原日落',
    likes: 312,
    status: 'published',
    createTime: '2026-04-07'
  },
  {
    _id: 'gallery_007',
    title: '草原誓言·执子之手',
    category: 'couple',
    tags: ['情侣写真', '蒙古袍', '誓言'],
    coverImage: 'https://picsum.photos/400/300?random=7',
    images: ['https://picsum.photos/400/300?random=7'],
    copyText: '在这片草原上，许下我们的誓言。执子之手，与子偕老 💑 #情侣旅拍 #草原爱情',
    likes: 567,
    status: 'published',
    createTime: '2026-04-07'
  },
  {
    _id: 'gallery_008',
    title: '草原小公主·天真烂漫',
    category: 'children',
    tags: ['儿童写真', '蒙古袍', '公主'],
    coverImage: 'https://picsum.photos/400/300?random=8',
    images: ['https://picsum.photos/400/300?random=8'],
    copyText: '穿上蒙古袍的小公主，天真烂漫的笑容治愈一切。这是最美的童年记忆 👧 #儿童旅拍',
    likes: 356,
    status: 'published',
    createTime: '2026-04-07'
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
  },
  {
    _id: 'booking_003',
    userId: 'mock_openid_user',
    packageId: 'pkg_003',
    packageName: '【家族传承】全家福套餐',
    packagePrice: 1599,
    date: '2026-04-22',
    timeSlot: '10:00',
    contactName: '王大伟',
    contactPhone: '13800138003',
    persons: 5,
    status: 'shooting',
    remark: '家里有老人，需要休息时间',
    createTime: '2026-04-10T14:00:00'
  },
  {
    _id: 'booking_004',
    userId: 'mock_openid_user',
    packageId: 'pkg_001',
    packageName: '【陵前印记】基础套餐',
    packagePrice: 299,
    date: '2026-04-12',
    timeSlot: '14:00',
    contactName: '赵小芳',
    contactPhone: '13800138004',
    persons: 1,
    status: 'completed',
    remark: '',
    createTime: '2026-04-05T11:00:00'
  },
  {
    _id: 'booking_005',
    userId: 'mock_openid_user',
    packageId: 'pkg_004',
    packageName: '【定制旅拍】VIP尊享套餐',
    packagePrice: 3999,
    date: '2026-04-25',
    timeSlot: '08:00',
    contactName: '刘总',
    contactPhone: '13800138005',
    persons: 2,
    status: 'retouching',
    remark: '需要精修50张',
    createTime: '2026-04-11T09:30:00'
  },
  {
    _id: 'booking_006',
    userId: 'mock_openid_user',
    packageId: 'pkg_002',
    packageName: '【草原征途】进阶套餐',
    packagePrice: 899,
    date: '2026-04-18',
    timeSlot: '15:00',
    contactName: '陈小姐',
    contactPhone: '13800138006',
    persons: 2,
    status: 'cancelled',
    remark: '临时有事取消',
    createTime: '2026-04-09T16:00:00'
  },
  {
    _id: 'booking_007',
    userId: 'mock_openid_user',
    packageId: 'pkg_003',
    packageName: '【家族传承】全家福套餐',
    packagePrice: 1599,
    date: '2026-04-28',
    timeSlot: '11:00',
    contactName: '周先生',
    contactPhone: '13800138007',
    persons: 6,
    status: 'pending',
    remark: '需要儿童服装',
    createTime: '2026-04-12T10:00:00'
  },
  {
    _id: 'booking_008',
    userId: 'mock_openid_user',
    packageId: 'pkg_001',
    packageName: '【陵前印记】基础套餐',
    packagePrice: 299,
    date: '2026-04-16',
    timeSlot: '16:00',
    contactName: '吴小姐',
    contactPhone: '13800138008',
    persons: 1,
    status: 'pending',
    remark: '',
    createTime: '2026-04-12T14:00:00'
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
  },
  {
    _id: 'order_003',
    bookingId: 'booking_003',
    userId: 'mock_openid_user',
    packageId: 'pkg_003',
    packageName: '【家族传承】全家福套餐',
    totalPrice: 1599,
    depositAmount: 399,
    payStatus: 'paid',
    orderNo: 'LP20260410140000001',
    payTime: '2026-04-10T14:05:00',
    refundTime: null,
    createTime: '2026-04-10T14:00:00'
  }
]

// Mock 统计数据（管理端）
export const MOCK_STATS = {
  todayBookings: 5,
  pendingOrders: 3,
  monthIncome: 8960,
  totalGallery: 16,
  totalBookings: 128,
  totalUsers: 356
}

// 获取 Mock 数据的统一入口
export const getMockData = (functionName, data) => {
  const action = data?.action
  
  switch (functionName) {
    case 'user':
      if (action === 'login') {
        return {
          code: 0,
          data: { token: 'mock_admin_token_12345', userInfo: MOCK_USERS.admin }
        }
      }
      break
      
    case 'stats':
      return { code: 0, data: MOCK_STATS }
      
    case 'package':
      if (action === 'list') {
        return { code: 0, data: { list: MOCK_PACKAGES, total: MOCK_PACKAGES.length } }
      }
      if (action === 'detail') {
        const pkg = MOCK_PACKAGES.find(p => p._id === data.id)
        return { code: 0, data: pkg }
      }
      if (action === 'create') {
        const newPkg = {
          _id: 'pkg_' + Date.now(),
          ...data,
          createTime: new Date().toISOString().split('T')[0]
        }
        MOCK_PACKAGES.push(newPkg)
        return { code: 0, data: newPkg }
      }
      if (action === 'update') {
        const index = MOCK_PACKAGES.findIndex(p => p._id === data.id)
        if (index > -1) {
          MOCK_PACKAGES[index] = { ...MOCK_PACKAGES[index], ...data }
          return { code: 0, data: MOCK_PACKAGES[index] }
        }
        return { code: -1, message: '套餐不存在' }
      }
      if (action === 'delete') {
        const index = MOCK_PACKAGES.findIndex(p => p._id === data.id)
        if (index > -1) {
          MOCK_PACKAGES.splice(index, 1)
          return { code: 0, data: { success: true } }
        }
        return { code: -1, message: '套餐不存在' }
      }
      if (action === 'toggleStatus') {
        const index = MOCK_PACKAGES.findIndex(p => p._id === data.id)
        if (index > -1) {
          MOCK_PACKAGES[index].status = data.status
          return { code: 0, data: MOCK_PACKAGES[index] }
        }
        return { code: -1, message: '套餐不存在' }
      }
      break
      
    case 'gallery':
      if (action === 'list') {
        let list = [...MOCK_GALLERY]
        if (data?.category && data.category !== 'all') {
          list = list.filter(g => g.category === data.category)
        }
        if (data?.status) {
          list = list.filter(g => g.status === data.status)
        }
        return { code: 0, data: { list, total: list.length } }
      }
      if (action === 'create') {
        const newItem = {
          _id: `gallery_${Date.now()}`,
          ...data,
          likes: 0,
          createTime: new Date().toISOString().split('T')[0]
        }
        MOCK_GALLERY.unshift(newItem)
        return { code: 0, data: newItem }
      }
      if (action === 'update') {
        const index = MOCK_GALLERY.findIndex(g => g._id === data._id)
        if (index > -1) {
          MOCK_GALLERY[index] = { ...MOCK_GALLERY[index], ...data }
          return { code: 0, data: MOCK_GALLERY[index] }
        }
        return { code: -1, message: '客片不存在' }
      }
      if (action === 'delete') {
        const index = MOCK_GALLERY.findIndex(g => g._id === data._id)
        if (index > -1) {
          MOCK_GALLERY.splice(index, 1)
          return { code: 0, message: '删除成功' }
        }
        return { code: -1, message: '客片不存在' }
      }
      break
      
    case 'booking':
      if (action === 'list') {
        return { code: 0, data: { list: MOCK_BOOKINGS, total: MOCK_BOOKINGS.length } }
      }
      if (action === 'updateStatus') {
        const booking = MOCK_BOOKINGS.find(b => b._id === data.data?.id)
        if (booking) {
          booking.status = data.data?.status
          return { code: 0, data: booking }
        }
        return { code: -1, message: '订单不存在' }
      }
      break
      
    case 'order':
      if (action === 'list') {
        return { code: 0, data: { list: MOCK_ORDERS, total: MOCK_ORDERS.length } }
      }
      break
  }
  
  return { code: -1, message: '未实现的 Mock 接口' }
}
