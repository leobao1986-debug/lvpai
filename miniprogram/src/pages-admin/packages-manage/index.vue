<template>
  <view class="page">
    <!-- 页面标题 -->
    <view class="header">
      <text class="title">套餐管理</text>
      <view class="add-btn" @click="goToEdit()">
        <text class="add-icon">+</text>
        <text>新增套餐</text>
      </view>
    </view>

    <!-- 套餐列表 -->
    <scroll-view
      class="package-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view
        v-for="pkg in packageList"
        :key="pkg._id"
        class="package-card"
      >
        <view class="package-main" @click="goToEdit(pkg._id)">
          <image
            class="package-cover"
            :src="pkg.coverImage || '/static/default-package.png'"
            mode="aspectFill"
          />
          <view class="package-info">
            <view class="package-header">
              <text class="package-name">{{ pkg.name }}</text>
              <text
                class="status-tag"
                :class="pkg.status === 'active' ? 'active' : 'inactive'"
              >
                {{ pkg.status === 'active' ? '上架' : '下架' }}
              </text>
            </view>
            <text class="package-category">{{ getCategoryLabel(pkg.category) }}</text>
            <view class="package-price">
              <text class="price">¥{{ pkg.price }}</text>
              <text class="deposit">定金 ¥{{ pkg.deposit }}</text>
            </view>
          </view>
        </view>
        <view class="package-actions">
          <switch
            :checked="pkg.status === 'active'"
            color="#c41230"
            @change="toggleStatus(pkg)"
          />
          <view class="action-btns">
            <text class="action-btn edit" @click="goToEdit(pkg._id)">编辑</text>
            <text class="action-btn delete" @click="confirmDelete(pkg)">删除</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="packageList.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无套餐</text>
        <text class="empty-tip">点击右上角新增套餐</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="packageList.length > 0" class="load-more">
        <text v-if="loadingMore">加载中...</text>
        <text v-else-if="noMore">没有更多了</text>
      </view>
    </scroll-view>

    <!-- 加载状态 -->
    <view v-if="loading && packageList.length === 0" class="loading-mask">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { callFunction } from '../../utils/cloud'
import { PACKAGE_CATEGORIES } from '../../utils/constants'

const userStore = useUserStore()

const packageList = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10
const noMore = ref(false)

// 检查管理员权限
const checkAdmin = () => {
  if (!userStore.isAdminUser) {
    uni.showToast({
      title: '无权访问',
      icon: 'none'
    })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
    return false
  }
  return true
}

// 获取分类标签
const getCategoryLabel = (value) => {
  const category = PACKAGE_CATEGORIES.find(item => item.value === value)
  return category ? `${category.icon} ${category.label}` : value
}

// 获取套餐列表
const fetchPackages = async (isLoadMore = false) => {
  if (loading.value || loadingMore.value) return

  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    page.value = 1
    noMore.value = false
  }

  try {
    const res = await callFunction('package', {
      action: 'list',
      data: {
        isAdmin: true,
        page: page.value,
        pageSize
      }
    })

    if (res.code === 0) {
      const list = res.data.list || []

      if (isLoadMore) {
        packageList.value.push(...list)
      } else {
        packageList.value = list
      }

      if (list.length < pageSize) {
        noMore.value = true
      }
    }
  } catch (err) {
    console.error('获取套餐列表失败:', err)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    loadingMore.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  noMore.value = false
  fetchPackages(false)
}

// 加载更多
const loadMore = () => {
  if (noMore.value || loadingMore.value) return
  page.value++
  fetchPackages(true)
}

// 切换上下架状态
const toggleStatus = async (pkg) => {
  const newStatus = pkg.status === 'active' ? 'inactive' : 'active'
  const actionText = newStatus === 'active' ? '上架' : '下架'

  try {
    uni.showLoading({ title: '处理中...' })
    const res = await callFunction('package', {
      action: 'updateStatus',
      data: {
        id: pkg._id,
        status: newStatus
      }
    })

    if (res.code === 0) {
      uni.showToast({
        title: `${actionText}成功`,
        icon: 'success'
      })
      pkg.status = newStatus
    } else {
      uni.showToast({
        title: res.message || '操作失败',
        icon: 'none'
      })
    }
  } catch (err) {
    console.error('切换状态失败:', err)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 确认删除
const confirmDelete = (pkg) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除套餐"${pkg.name}"吗？此操作不可撤销。`,
    confirmColor: '#c41230',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          const result = await callFunction('package', {
            action: 'delete',
            data: { id: pkg._id }
          })

          if (result.code === 0) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            // 从列表中移除
            const index = packageList.value.findIndex(item => item._id === pkg._id)
            if (index > -1) {
              packageList.value.splice(index, 1)
            }
          } else {
            uni.showToast({
              title: result.message || '删除失败',
              icon: 'none'
            })
          }
        } catch (err) {
          console.error('删除失败:', err)
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 跳转到编辑页
const goToEdit = (id) => {
  const url = id
    ? `/pages-admin/packages-manage/edit?id=${id}`
    : '/pages-admin/packages-manage/edit'
  uni.navigateTo({ url })
}

onMounted(() => {
  if (checkAdmin()) {
    fetchPackages()
  }
})
</script>

<style lang="scss" scoped>
$primary-color: #c41230;
$bg-color: #f5f5f5;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$text-muted: #999999;

.page {
  min-height: 100vh;
  background-color: $bg-color;
  display: flex;
  flex-direction: column;
}

// 页面标题
.header {
  background: $card-bg;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eeeeee;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-primary;
  }

  .add-btn {
    display: flex;
    align-items: center;
    background: $primary-color;
    color: #ffffff;
    padding: 16rpx 24rpx;
    border-radius: 30rpx;
    font-size: 26rpx;

    .add-icon {
      font-size: 32rpx;
      margin-right: 8rpx;
    }
  }
}

// 套餐列表
.package-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.package-card {
  background: $card-bg;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;

  .package-main {
    display: flex;
    padding: 24rpx;

    .package-cover {
      width: 160rpx;
      height: 160rpx;
      border-radius: 12rpx;
      margin-right: 24rpx;
      background: #f5f5f5;
    }

    .package-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .package-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .package-name {
          font-size: 32rpx;
          font-weight: bold;
          color: $text-primary;
          flex: 1;
          margin-right: 16rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-tag {
          padding: 6rpx 16rpx;
          border-radius: 8rpx;
          font-size: 22rpx;

          &.active {
            background: #e6f7e6;
            color: #07c160;
          }

          &.inactive {
            background: #f5f5f5;
            color: $text-muted;
          }
        }
      }

      .package-category {
        font-size: 26rpx;
        color: $text-secondary;
        margin-bottom: 12rpx;
      }

      .package-price {
        display: flex;
        align-items: baseline;
        gap: 16rpx;

        .price {
          font-size: 36rpx;
          font-weight: bold;
          color: $primary-color;
        }

        .deposit {
          font-size: 24rpx;
          color: $text-muted;
        }
      }
    }
  }

  .package-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 24rpx;
    border-top: 1rpx solid #f5f5f5;
    background: #fafafa;

    .action-btns {
      display: flex;
      gap: 30rpx;

      .action-btn {
        font-size: 26rpx;
        padding: 8rpx 20rpx;
        border-radius: 8rpx;

        &.edit {
          color: $primary-color;
          background: #fff0f0;
        }

        &.delete {
          color: #ee0a24;
          background: #fff0f0;
        }
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 0;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 32rpx;
    color: $text-primary;
    margin-bottom: 12rpx;
  }

  .empty-tip {
    font-size: 26rpx;
    color: $text-muted;
  }
}

// 加载更多
.load-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: $text-muted;
}

// 加载遮罩
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .loading-text {
    color: $text-secondary;
    font-size: 28rpx;
  }
}
</style>
