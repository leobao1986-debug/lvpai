import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../components/Layout.vue'),
    redirect: '/dashboard',
    children: [
      { 
        path: 'dashboard', 
        name: 'Dashboard', 
        component: () => import('../views/dashboard/index.vue'), 
        meta: { title: '仪表板', icon: 'Odometer' } 
      },
      { 
        path: 'orders', 
        name: 'Orders', 
        component: () => import('../views/orders/index.vue'), 
        meta: { title: '订单管理', icon: 'List' } 
      },
      { 
        path: 'packages', 
        name: 'Packages', 
        component: () => import('../views/packages/index.vue'), 
        meta: { title: '套餐管理', icon: 'Gift' } 
      },
      { 
        path: 'gallery', 
        name: 'Gallery', 
        component: () => import('../views/gallery/index.vue'), 
        meta: { title: '客片管理', icon: 'Picture' } 
      },
      { 
        path: 'settings', 
        name: 'Settings', 
        component: () => import('../views/settings/index.vue'), 
        meta: { title: '店铺设置', icon: 'Setting' } 
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
