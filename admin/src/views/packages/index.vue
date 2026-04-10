<template>
  <div class="packages-page">
    <div class="page-header">
      <h2>套餐管理</h2>
      <el-button type="primary" @click="openEditDialog()">
        <el-icon><Plus /></el-icon> 新建套餐
      </el-button>
    </div>
    
    <el-card>
      <el-table :data="packageList" v-loading="loading" stripe>
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image :src="row.coverImage" style="width: 60px; height: 45px; border-radius: 4px;" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="套餐名称" min-width="180" />
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            {{ getCategoryLabel(row.category) }}
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column label="定金" width="100">
          <template #default="{ row }">
            ¥{{ row.deposit }}
          </template>
        </el-table-column>
        <el-table-column label="时长" width="80">
          <template #default="{ row }">
            {{ row.duration }}分钟
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="on" inactive-value="off" @change="toggleStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除？" @confirm="deletePackage(row)">
              <template #reference>
                <el-button text style="color: #e85040;">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" :title="isEdit ? '编辑套餐' : '新建套餐'" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="form.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="选择分类">
            <el-option v-for="c in categories" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="定金" prop="deposit">
              <el-input-number v-model="form.deposit" :min="0" :precision="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时长(分)" prop="duration">
              <el-input-number v-model="form.duration" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="服装套数" prop="clothCount">
              <el-input-number v-model="form.clothCount" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="精修张数" prop="photoCount">
              <el-input-number v-model="form.photoCount" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="标签" prop="tag">
              <el-input v-model="form.tag" placeholder="如：热卖" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="封面图" prop="coverImage">
          <el-upload
            :show-file-list="false"
            :before-upload="beforeCoverUpload"
            :http-request="uploadCover"
            accept="image/*"
          >
            <el-image v-if="form.coverImage" :src="form.coverImage" style="width: 200px; height: 150px; border-radius: 4px;" fit="cover" />
            <el-button v-else type="primary" plain>上传封面</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="详情图片" prop="images">
          <el-upload
            v-model:file-list="detailFileList"
            :before-upload="beforeDetailUpload"
            :http-request="uploadDetail"
            list-type="picture-card"
            accept="image/*"
            :limit="9"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="特色亮点" prop="features">
          <div v-for="(f, i) in form.features" :key="i" style="display: flex; margin-bottom: 8px;">
            <el-input v-model="form.features[i]" />
            <el-button text style="color: #e85040; margin-left: 8px;" @click="form.features.splice(i, 1)">删除</el-button>
          </div>
          <el-button text type="primary" @click="form.features.push('')" v-if="form.features.length < 6">添加亮点</el-button>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="savePackage" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { callFunction } from '../../api/cloud'
import { PACKAGE_CATEGORIES } from '../../utils/constants'

const loading = ref(false)
const saving = ref(false)
const packageList = ref([])
const editVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const detailFileList = ref([])

const categories = PACKAGE_CATEGORIES

const defaultForm = {
  name: '',
  category: '',
  price: 0,
  deposit: 0,
  duration: 30,
  clothCount: 1,
  photoCount: 5,
  tag: '',
  coverImage: '',
  images: [],
  features: [],
  description: '',
  status: 'on'
}

const form = reactive({ ...defaultForm })

const rules = {
  name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  deposit: [{ required: true, message: '请输入定金', trigger: 'blur' }],
  coverImage: [{ required: true, message: '请上传封面图', trigger: 'change' }]
}

const getCategoryLabel = (value) => {
  const cat = categories.find(c => c.value === value)
  return cat ? cat.label : value
}

const fetchPackageList = async () => {
  loading.value = true
  try {
    const res = await callFunction('package', { action: 'list' })
    if (res.code === 0) {
      packageList.value = res.data.list
    }
  } catch (err) {
    ElMessage.error('获取套餐列表失败')
  } finally {
    loading.value = false
  }
}

const openEditDialog = (row) => {
  isEdit.value = !!row
  Object.assign(form, row || { ...defaultForm })
  detailFileList.value = (form.images || []).map((url, index) => ({
    name: `detail_${index}.jpg`,
    url
  }))
  editVisible.value = true
}

const savePackage = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    // 从 fileList 中提取图片 URL
    form.images = detailFileList.value.map(file => file.url)
    
    const action = isEdit.value ? 'update' : 'create'
    const data = isEdit.value ? { ...form, id: form._id } : form
    
    const res = await callFunction('package', { action, ...data })
    if (res.code === 0) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      editVisible.value = false
      fetchPackageList()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const deletePackage = async (row) => {
  try {
    const res = await callFunction('package', { action: 'delete', id: row._id })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      fetchPackageList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

const toggleStatus = async (row) => {
  try {
    const res = await callFunction('package', { 
      action: 'toggleStatus', 
      id: row._id, 
      status: row.status 
    })
    if (res.code === 0) {
      ElMessage.success('状态更新成功')
    } else {
      ElMessage.error(res.message || '状态更新失败')
      // 恢复原状态
      row.status = row.status === 'on' ? 'off' : 'on'
    }
  } catch (err) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 'on' ? 'off' : 'on'
  }
}

// 图片上传相关
const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

const uploadCover = ({ file }) => {
  // Mock 模式：直接用本地 URL
  form.coverImage = URL.createObjectURL(file)
}

const beforeDetailUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

const uploadDetail = ({ file, onSuccess }) => {
  // Mock 模式：直接用本地 URL
  const url = URL.createObjectURL(file)
  onSuccess({ url })
  // 添加到 fileList
  detailFileList.value.push({
    name: file.name,
    url: url
  })
}

onMounted(() => {
  fetchPackageList()
})
</script>

<style scoped>
.packages-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #0a4a43;
  font-size: 20px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #c8e8e4;
  position: relative;
}

.page-header h2::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: #f5c842;
}

/* 删除按钮改为珊瑚红 */
:deep(.el-button--text.is-danger) {
  color: #e85040;
}

:deep(.el-button--text.is-danger:hover) {
  color: #f06a5c;
}

/* Switch 使用青绿 */
:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #1a9b8c;
  border-color: #1a9b8c;
}
</style>
