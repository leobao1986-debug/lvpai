<template>
  <div class="settings-page">
    <h2>店铺设置</h2>
    
    <el-card>
      <el-form :model="form" label-width="120px" style="max-width: 600px;">
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="店铺名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="店铺地址">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model="form.longitude" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model="form.latitude" />
        </el-form-item>
        
        <el-divider content-position="left">营业时间</el-divider>
        <el-form-item label="营业时间">
          <el-input v-model="form.businessHours" placeholder="如：09:00 - 20:00" />
        </el-form-item>
        <el-form-item label="休息日">
          <el-checkbox-group v-model="form.restDays">
            <el-checkbox v-for="d in weekDays" :key="d.value" :label="d.value">{{ d.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-divider content-position="left">店铺公告</el-divider>
        <el-form-item label="公告内容">
          <el-input v-model="form.announcement" type="textarea" :rows="3" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveSettings" :loading="saving">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { STORE_INFO } from '../../utils/constants'

const weekDays = [
  { value: 'monday', label: '周一' },
  { value: 'tuesday', label: '周二' },
  { value: 'wednesday', label: '周三' },
  { value: 'thursday', label: '周四' },
  { value: 'friday', label: '周五' },
  { value: 'saturday', label: '周六' },
  { value: 'sunday', label: '周日' }
]

const form = ref({
  name: '',
  phone: '',
  address: '',
  longitude: '',
  latitude: '',
  businessHours: '',
  restDays: [],
  announcement: ''
})

const saving = ref(false)

// 加载设置
const loadSettings = () => {
  // 从 localStorage 读取或从 constants 获取默认值
  const saved = localStorage.getItem('store_settings')
  if (saved) {
    form.value = JSON.parse(saved)
  } else {
    // 使用 STORE_INFO 作为默认值
    form.value = {
      name: STORE_INFO.name || '',
      phone: STORE_INFO.phone || '',
      address: STORE_INFO.address || '',
      longitude: STORE_INFO.longitude || '',
      latitude: STORE_INFO.latitude || '',
      businessHours: '09:00 - 20:00',
      restDays: [],
      announcement: ''
    }
  }
}

// 保存设置
const saveSettings = async () => {
  saving.value = true
  try {
    // 模拟保存到 localStorage
    localStorage.setItem('store_settings', JSON.stringify(form.value))
    ElMessage.success('保存成功')
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.settings-page h2 {
  color: #0a4a43;
  margin-bottom: 20px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #c8e8e4;
  position: relative;
}

.settings-page h2::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: #f5c842;
}
</style>
