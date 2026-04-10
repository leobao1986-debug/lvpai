<script setup>
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  // 初始化云开发
  if (!wx.cloud) {
    console.error('请使用 2.2.3 或以上的基础库以使用云能力')
  } else {
    try {
      wx.cloud.init({
        env: 'cloud1-3g56hllb4a005c0e',
        traceUser: true,
        timeout: 5000
      })
    } catch (e) {
      console.warn('云开发初始化失败:', e)
    }
  }
})
</script>

<style lang="scss">
page {
  background-color: $mongol-cream;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 28rpx;
  color: $text-color;
  // 淡雅的蒙古纹样背景
  background-image: 
    radial-gradient(circle at 15% 85%, rgba($mongol-gold, 0.02) 0%, transparent 40%),
    radial-gradient(circle at 85% 15%, rgba($mongol-blue, 0.02) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba($mongol-red, 0.01) 0%, transparent 50%);
  background-attachment: fixed;
}

// 全局蒙古元素装饰类
.mongol-bg-pattern {
  background-image: 
    radial-gradient(circle at 20% 80%, rgba($mongol-gold, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba($mongol-blue, 0.03) 0%, transparent 50%);
}

// 底部哈达装饰线容器
.tab-top-decoration {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $mongol-cream;
  z-index: 99;
  
  .hada-line {
    flex: 1;
    height: 2rpx;
    background: linear-gradient(90deg, transparent, $mongol-gold, transparent);
  }
  
  .wheel-icon {
    width: 16rpx;
    height: 16rpx;
    border: 2rpx solid $mongol-gold;
    border-radius: 50%;
    margin: 0 12rpx;
    position: relative;
    
    &::before, &::after {
      content: '';
      position: absolute;
      background: $mongol-gold;
    }
    
    &::before {
      width: 100%;
      height: 2rpx;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
    
    &::after {
      width: 2rpx;
      height: 100%;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
    }
  }
}
</style>
