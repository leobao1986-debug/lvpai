<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="clouds">
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
    </div>
    
    <div class="login-card">
      <h2>朵兰摄影 · 管理后台</h2>
      <p class="subtitle">成吉思汗陵蒙古袍旅拍</p>
      
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            prefix-icon="User" 
            placeholder="管理员账号" 
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            prefix-icon="Lock" 
            placeholder="密码" 
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button 
          type="primary" 
          class="login-btn" 
          @click="handleLogin" 
          :loading="loading"
          size="large"
        >
          登 录
        </el-button>
      </el-form>
      
      <div class="login-tip">
        <p>测试账号：admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    // Mock 登录验证
    if (form.username === 'admin' && form.password === 'admin123') {
      loading.value = true
      
      // 模拟登录延迟
      setTimeout(() => {
        userStore.setToken('mock_admin_token_' + Date.now())
        userStore.setUserInfo({
          id: 'admin_001',
          username: 'admin',
          nickname: '管理员',
          role: 'admin'
        })
        
        ElMessage.success('登录成功')
        router.push('/dashboard')
        loading.value = false
      }, 500)
    } else {
      ElMessage.error('账号或密码错误')
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a4a43 0%, #1a9b8c 50%, #0a4a43 100%);
  position: relative;
  overflow: hidden;
}

/* 云朵装饰 */
.clouds {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.cloud-1 {
  width: 100px;
  height: 40px;
  top: 15%;
  left: 10%;
  animation: float 20s ease-in-out infinite;
}

.cloud-1::before {
  width: 50px;
  height: 50px;
  top: -25px;
  left: 15px;
}

.cloud-1::after {
  width: 60px;
  height: 60px;
  top: -35px;
  right: 15px;
}

.cloud-2 {
  width: 120px;
  height: 50px;
  top: 25%;
  right: 15%;
  animation: float 25s ease-in-out infinite reverse;
}

.cloud-2::before {
  width: 60px;
  height: 60px;
  top: -30px;
  left: 20px;
}

.cloud-2::after {
  width: 70px;
  height: 70px;
  top: -40px;
  right: 20px;
}

.cloud-3 {
  width: 80px;
  height: 35px;
  bottom: 20%;
  left: 20%;
  animation: float 18s ease-in-out infinite;
}

.cloud-3::before {
  width: 45px;
  height: 45px;
  top: -22px;
  left: 10px;
}

.cloud-3::after {
  width: 50px;
  height: 50px;
  top: -28px;
  right: 10px;
}

@keyframes float {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  25% {
    transform: translateX(20px) translateY(-10px);
  }
  50% {
    transform: translateX(40px) translateY(0);
  }
  75% {
    transform: translateX(20px) translateY(10px);
  }
}

.login-card {
  background: #f8fffe;
  border-radius: 12px;
  padding: 40px;
  width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1;
  border: 2px solid #f5c842;
}

.login-card h2 {
  text-align: center;
  color: #0a4a43;
  margin-bottom: 8px;
  font-size: 24px;
}

.subtitle {
  text-align: center;
  color: #0d5c54;
  margin-bottom: 30px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #1a9b8c 0%, #2ab5a8 100%);
  border-color: #1a9b8c;
  font-size: 16px;
  height: 44px;
}

.login-btn:hover,
.login-btn:focus {
  background: linear-gradient(135deg, #2ab5a8 0%, #3ac5b8 100%);
  border-color: #2ab5a8;
}

.login-tip {
  margin-top: 20px;
  text-align: center;
}

.login-tip p {
  color: #0d5c54;
  font-size: 12px;
}
</style>
