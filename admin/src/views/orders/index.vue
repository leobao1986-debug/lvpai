<template>
  <div class="orders-page">
    <h2>订单管理</h2>
    
    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form inline>
        <el-form-item label="状态">
          <el-select v-model="filterStatus" placeholder="全部" clearable>
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="searchKeyword" placeholder="订单号/客户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchOrders">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 订单表格 -->
    <el-card style="margin-top: 16px;">
      <el-table :data="filteredOrders" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="packageName" label="套餐名称" />
        <el-table-column prop="contactName" label="联系人" width="100" />
        <el-table-column prop="contactPhone" label="电话" width="130" />
        <el-table-column prop="date" label="预约日期" width="120" />
        <el-table-column prop="timeSlot" label="时段" width="120">
          <template #default="{ row }">
            {{ getTimeSlotLabel(row.timeSlot) }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">¥{{ row.totalPrice || row.depositAmount || row.packagePrice }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" text type="success" @click="confirmOrder(row)">确认</el-button>
            <el-button v-if="canAdvance(row.status)" text type="warning" @click="advanceStatus(row)">推进</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">{{ getStatusLabel(currentOrder.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="套餐">{{ currentOrder.packageName }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentOrder.totalPrice || currentOrder.packagePrice }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentOrder.contactName }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ currentOrder.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="预约日期">{{ currentOrder.date }}</el-descriptions-item>
        <el-descriptions-item label="时段">{{ getTimeSlotLabel(currentOrder.timeSlot) }}</el-descriptions-item>
        <el-descriptions-item label="人数">{{ currentOrder.persons }}人</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentOrder.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="currentOrder?.status === 'pending'" type="success" @click="confirmOrder(currentOrder)">确认预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { callFunction } from '../../api/cloud'
import { BOOKING_STATUS, TIME_SLOTS } from '../../utils/constants'

const loading = ref(false)
const orders = ref([])
const filterStatus = ref('')
const searchKeyword = ref('')
const detailVisible = ref(false)
const currentOrder = ref(null)

// 状态选项
const statusOptions = [
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'shooting', label: '拍摄中' },
  { value: 'retouching', label: '修片中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

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

// 获取时段标签
const getTimeSlotLabel = (value) => {
  const slot = TIME_SLOTS.find(s => s.value === value)
  return slot ? slot.label : value
}

// 过滤后的订单
const filteredOrders = computed(() => {
  let result = orders.value
  
  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(order => order.status === filterStatus.value)
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(order => 
      order.orderNo?.toLowerCase().includes(keyword) ||
      order.contactName?.toLowerCase().includes(keyword) ||
      order.contactPhone?.includes(keyword)
    )
  }
  
  return result
})

// 判断是否可以推进状态
const canAdvance = (status) => {
  return ['confirmed', 'shooting', 'retouching'].includes(status)
}

// 获取下一个状态
const getNextStatus = (currentStatus) => {
  const statusFlow = {
    confirmed: 'shooting',
    shooting: 'retouching',
    retouching: 'completed'
  }
  return statusFlow[currentStatus]
}

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await callFunction('booking', { action: 'list' })
    if (res.code === 0) {
      // 生成订单号并排序（按创建时间倒序）
      orders.value = res.data.list
        .map(item => ({
          ...item,
          orderNo: 'LP' + item.createTime.replace(/[-:T]/g, '').slice(0, 14)
        }))
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    }
  } catch (err) {
    console.error('获取订单失败:', err)
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetFilter = () => {
  filterStatus.value = ''
  searchKeyword.value = ''
  fetchOrders()
}

// 查看详情
const viewDetail = (row) => {
  currentOrder.value = row
  detailVisible.value = true
}

// 确认订单
const confirmOrder = async (row) => {
  try {
    await ElMessageBox.confirm('确认该预约订单？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await callFunction('booking', {
      action: 'updateStatus',
      data: { id: row._id, status: 'confirmed' }
    })
    
    if (res.code === 0) {
      ElMessage.success('订单已确认')
      // 更新本地数据
      const index = orders.value.findIndex(o => o._id === row._id)
      if (index !== -1) {
        orders.value[index].status = 'confirmed'
      }
      if (currentOrder.value?._id === row._id) {
        currentOrder.value.status = 'confirmed'
      }
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('确认订单失败:', err)
      ElMessage.error('操作失败')
    }
  }
}

// 推进状态
const advanceStatus = async (row) => {
  const nextStatus = getNextStatus(row.status)
  const statusLabels = {
    shooting: '拍摄中',
    retouching: '修片中',
    completed: '已完成'
  }
  
  try {
    await ElMessageBox.confirm(`将订单状态推进至"${statusLabels[nextStatus]}"？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    const res = await callFunction('booking', {
      action: 'updateStatus',
      data: { id: row._id, status: nextStatus }
    })
    
    if (res.code === 0) {
      ElMessage.success(`订单已推进至${statusLabels[nextStatus]}`)
      // 更新本地数据
      const index = orders.value.findIndex(o => o._id === row._id)
      if (index !== -1) {
        orders.value[index].status = nextStatus
      }
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('推进状态失败:', err)
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-page {
  padding: 20px;
}

.orders-page h2 {
  color: #0a4a43;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #c8e8e4;
  position: relative;
}

.orders-page h2::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: #f5c842;
}

.filter-card {
  margin-bottom: 0;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}
</style>
