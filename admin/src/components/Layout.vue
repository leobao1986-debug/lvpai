<template>
  <el-container style="height: 100vh;">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-sidebar">
      <div class="logo-section">
        <h2 v-if="!isCollapse">朵兰摄影</h2>
        <h2 v-else>朵</h2>
      </div>
      <el-menu
        :default-active="currentRoute"
        :collapse="isCollapse"
        background-color="#0a4a43"
        text-color="#b8e5e0"
        active-text-color="#f5c842"
        router
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="'/' + item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <!-- 顶栏 -->
      <el-header class="admin-header">
        <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
        <div class="header-title">朵兰摄影 · 管理后台</div>
        <div class="header-right">
          <span class="admin-name">管理员</span>
          <el-button type="primary" text @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      
      <!-- 内容区 -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)

const currentRoute = computed(() => route.path)

const menuItems = [
  { path: 'dashboard', title: '仪表板', icon: 'Odometer' },
  { path: 'orders', title: '订单管理', icon: 'List' },
  { path: 'packages', title: '套餐管理', icon: 'Gift' },
  { path: 'gallery', title: '客片管理', icon: 'Picture' },
  { path: 'settings', title: '店铺设置', icon: 'Setting' }
]

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.admin-sidebar {
  background-color: #0a4a43;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-section {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(245, 200, 66, 0.3);
}

.logo-section h2 {
  color: #f5c842;
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
}

.admin-header {
  background-color: #f8fffe;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 2px solid #f5c842;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #0d5c54;
  margin-right: 20px;
}

.collapse-btn:hover {
  color: #1a9b8c;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #0a4a43;
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-name {
  color: #0d5c54;
  font-size: 14px;
}

.admin-main {
  background-color: #f0f8f7;
  padding: 20px;
  overflow-y: auto;
}

/* 菜单样式 */
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(245, 200, 66, 0.1) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(26, 155, 140, 0.3) !important;
  border-right: 3px solid #f5c842;
}
</style>
