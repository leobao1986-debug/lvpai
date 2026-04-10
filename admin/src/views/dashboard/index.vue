<template>
  <div class="dashboard">
    <h2>数据概览</h2>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" :color="card.color"><component :is="card.icon" /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-title">{{ card.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最近订单 -->
    <el-card class="recent-orders" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>最近订单</span>
          <el-button text type="primary" @click="$router.push('/orders')">查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentOrders" stripe v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="packageName" label="套餐" />
        <el-table-column prop="contactName" label="客户" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Calendar, Bell, Money, Picture } from '@element-plus/icons-vue'
import { callFunction } from '../../api/cloud'
import { BOOKING_STATUS } from '../../utils/constants'

const loading = ref(false)
const stats = ref({
  todayBookings: 0,
  pendingOrders: 0,
  monthIncome: 0,
  totalGallery: 0
})
const recentOrders = ref([])

const statCards = ref([
  { title: '今日预约数', icon: Calendar, color: '#1a9b8c', value: 0 },
  { title: '待处理订单', icon: Bell, color: '#e8b730', value: 0 },
  { title: '本月收入', icon: Money, color: '#2ab5a8', value: 0 },
  { title: '总客片数', icon: Picture, color: '#0d5c54', value: 0 }
])

// 获取状态标签
const getStatusLabel = (status) => {
  return BOOKING_STATUS[status]?.label || status
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    confirmed: 'primary',
    shooting: 'info',
    retouching: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await callFunction('stats', { action: 'overview' })
    if (res.code === 0) {
      stats.value = res.data
      // 更新统计卡片
      statCards.value[0].value = res.data.todayBookings
      statCards.value[1].value = res.data.pendingOrders
      statCards.value[2].value = '¥' + res.data.monthIncome.toLocaleString()
      statCards.value[3].value = res.data.totalGallery
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
  }
}

// 获取最近订单
const fetchRecentOrders = async () => {
  loading.value = true
  try {
    const res = await callFunction('booking', { action: 'list' })
    if (res.code === 0) {
      // 取最近5条订单，并生成订单号
      recentOrders.value = res.data.list.slice(0, 5).map(item => ({
        ...item,
        orderNo: 'LP' + item.createTime.replace(/[-:T]/g, '').slice(0, 14)
      }))
    }
  } catch (err) {
    console.error('获取订单数据失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
  fetchRecentOrders()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard h2 {
  color: #0a4a43;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #c8e8e4;
  position: relative;
}

.dashboard h2::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: #f5c842;
}

.stat-card {
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #0a4a43;
  line-height: 1.2;
}

.stat-title {
  font-size: 14px;
  color: #0d5c54;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-orders :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #daf0ed;
  background-color: #edf7f6;
}

.recent-orders :deep(.el-card__header span) {
  color: #0a4a43;
  font-weight: 600;
}
</style>
