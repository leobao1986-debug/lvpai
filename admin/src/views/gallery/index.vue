<template>
  <div class="gallery-page">
    <div class="page-header">
      <h2>客片管理</h2>
      <el-button type="primary" @click="openEditDialog()">
        <el-icon><Plus /></el-icon> 上传客片
      </el-button>
    </div>
    
    <!-- 筛选 -->
    <el-card class="filter-card">
      <el-form inline>
        <el-form-item label="分类">
          <el-select v-model="filterCategory" clearable placeholder="全部">
            <el-option v-for="c in galleryCategories" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterStatus" clearable placeholder="全部">
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 卡片列表 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="6" v-for="item in filteredGallery" :key="item._id">
        <el-card :body-style="{ padding: '0' }" shadow="hover" class="gallery-card">
          <el-image :src="item.coverImage" style="width: 100%; height: 180px;" fit="cover" />
          <div style="padding: 12px;">
            <div style="font-weight: bold; margin-bottom: 4px;">{{ item.title }}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <el-tag size="small" :type="item.status === 'published' ? 'success' : 'info'">
                {{ item.status === 'published' ? '已发布' : '草稿' }}
              </el-tag>
              <div>
                <el-button text size="small" type="primary" @click="openEditDialog(item)">编辑</el-button>
                <el-popconfirm title="确定删除？" @confirm="deleteGallery(item)">
                  <template #reference>
                    <el-button text size="small" style="color: #e85040;">删除</el-button>
                  </template>
                </el-popconfirm>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" :title="isEdit ? '编辑客片' : '上传客片'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category">
            <el-option v-for="c in galleryCategories" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple filterable allow-create placeholder="添加标签">
          </el-select>
        </el-form-item>
        <el-form-item label="文案">
          <el-input v-model="form.copyText" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="图片" prop="images">
          <el-upload
            v-model:file-list="imageFileList"
            :http-request="uploadImage"
            list-type="picture-card"
            accept="image/*"
            :limit="20"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="published">发布</el-radio>
            <el-radio value="draft">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGallery" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { callFunction } from '../../api/cloud'
import { GALLERY_CATEGORIES } from '../../utils/constants'

const galleryList = ref([])
const filterCategory = ref('')
const filterStatus = ref('')
const editVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref(null)
const imageFileList = ref([])

const form = ref({
  title: '',
  category: '',
  tags: [],
  copyText: '',
  images: [],
  status: 'draft'
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  images: [{ required: true, message: '请上传图片', trigger: 'change' }]
}

// 排除 "all" 的分类选项
const galleryCategories = computed(() => {
  return GALLERY_CATEGORIES.filter(c => c.value !== 'all')
})

// 筛选后的客片列表
const filteredGallery = computed(() => {
  let list = galleryList.value
  if (filterCategory.value) {
    list = list.filter(g => g.category === filterCategory.value)
  }
  if (filterStatus.value) {
    list = list.filter(g => g.status === filterStatus.value)
  }
  return list
})

// 获取客片列表
const fetchGalleryList = async () => {
  try {
    const res = await callFunction('gallery', { action: 'list' })
    if (res.code === 0) {
      galleryList.value = res.data.list
    }
  } catch (err) {
    ElMessage.error('获取客片列表失败')
  }
}

// 打开编辑弹窗
const openEditDialog = (item = null) => {
  isEdit.value = !!item
  if (item) {
    form.value = { ...item }
    // 转换图片为文件列表格式
    imageFileList.value = item.images.map((url, index) => ({
      name: `image_${index}.jpg`,
      url: url,
      status: 'success'
    }))
  } else {
    form.value = {
      title: '',
      category: '',
      tags: [],
      copyText: '',
      images: [],
      status: 'draft'
    }
    imageFileList.value = []
  }
  editVisible.value = true
}

// 上传图片（Mock 模式使用 URL.createObjectURL）
const uploadImage = async (options) => {
  const { file, onSuccess } = options
  // Mock 模式下创建本地 URL
  const url = URL.createObjectURL(file)
  onSuccess({ url })
}

// 保存客片
const saveGallery = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    // 从文件列表中提取图片 URL
    const images = imageFileList.value.map(file => {
      if (file.response?.url) {
        return file.response.url
      }
      return file.url
    })
    
    const data = {
      ...form.value,
      images,
      coverImage: images[0] || ''
    }

    if (isEdit.value) {
      await callFunction('gallery', { action: 'update', ...data })
      ElMessage.success('更新成功')
    } else {
      await callFunction('gallery', { action: 'create', ...data })
      ElMessage.success('创建成功')
    }
    editVisible.value = false
    fetchGalleryList()
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 删除客片
const deleteGallery = async (item) => {
  try {
    await callFunction('gallery', { action: 'delete', _id: item._id })
    ElMessage.success('删除成功')
    fetchGalleryList()
  } catch (err) {
    ElMessage.error(err.message || '删除失败')
  }
}

onMounted(() => {
  fetchGalleryList()
})
</script>

<style scoped>
.gallery-page {
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

.filter-card {
  margin-bottom: 16px;
}

.gallery-card {
  margin-bottom: 16px;
  transition: transform 0.2s;
  background-color: #f8fffe;
  border-color: #c8e8e4;
}

.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(26, 155, 140, 0.2);
}
</style>
