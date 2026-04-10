/**
 * 照片处理脚本
 * 压缩照片并分类存放到 static/images 目录
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'D:\\lvpai\\photo';
const DEST_DIR = path.join(__dirname, '..', 'src', 'static', 'images');

// 照片分配方案
const IMAGE_PLAN = {
  // Banner: 取3张最好看的
  banner: [
    { source: '3.jpg', target: 'banner1.jpg', width: 750, quality: 80 },
    { source: '6.jpg', target: 'banner2.jpg', width: 750, quality: 80 },
    { source: '微信图片_20260409113908.jpg', target: 'banner3.jpg', width: 750, quality: 80 }
  ],
  // 场景: 取3张适合的
  scenes: [
    { source: '10.jpg', target: 'scene1.jpg', width: 500, quality: 75 },
    { source: '14.jpg', target: 'scene2.jpg', width: 500, quality: 75 },
    { source: '15.jpg', target: 'scene3.jpg', width: 500, quality: 75 }
  ],
  // 套餐封面: 取4张
  packages: [
    { source: '5.jpg', target: 'basic.jpg', width: 300, quality: 70 },
    { source: '8.jpg', target: 'advanced.jpg', width: 300, quality: 70 },
    { source: '12.jpg', target: 'family.jpg', width: 300, quality: 70 },
    { source: '16.jpg', target: 'vip.jpg', width: 300, quality: 70 }
  ],
  // 客片: 所有16张
  gallery: [
    { source: '3.jpg', target: '1.jpg', width: 500, quality: 75 },
    { source: '4.jpg', target: '2.jpg', width: 500, quality: 75 },
    { source: '5.jpg', target: '3.jpg', width: 500, quality: 75 },
    { source: '6.jpg', target: '4.jpg', width: 500, quality: 75 },
    { source: '8.jpg', target: '5.jpg', width: 500, quality: 75 },
    { source: '10.jpg', target: '6.jpg', width: 500, quality: 75 },
    { source: '11.jpg', target: '7.jpg', width: 500, quality: 75 },
    { source: '12.jpg', target: '8.jpg', width: 500, quality: 75 },
    { source: '13.jpg', target: '9.jpg', width: 500, quality: 75 },
    { source: '14.jpg', target: '10.jpg', width: 500, quality: 75 },
    { source: '15.jpg', target: '11.jpg', width: 500, quality: 75 },
    { source: '16.jpg', target: '12.jpg', width: 500, quality: 75 },
    { source: '17.jpg', target: '13.jpg', width: 500, quality: 75 },
    { source: '18.jpg', target: '14.jpg', width: 500, quality: 75 },
    { source: '微信图片_20260409113908.jpg', target: '15.jpg', width: 500, quality: 75 },
    { source: '微信图片_20260409113938.jpg', target: '16.jpg', width: 500, quality: 75 }
  ]
};

async function processImage(sourcePath, targetPath, width, quality) {
  try {
    const sourceFullPath = path.join(SOURCE_DIR, sourcePath);
    const targetFullPath = path.join(DEST_DIR, targetPath);
    
    if (!fs.existsSync(sourceFullPath)) {
      console.warn(`⚠️ 源文件不存在: ${sourcePath}`);
      return false;
    }

    // 获取文件大小
    const stats = fs.statSync(sourceFullPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`处理: ${sourcePath} (${sizeMB}MB) -> ${targetPath}`);

    // 使用 sharp 压缩
    await sharp(sourceFullPath)
      .resize(width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ 
        quality: quality,
        progressive: true,
        mozjpeg: true
      })
      .toFile(targetFullPath);

    // 检查输出文件大小
    const outStats = fs.statSync(targetFullPath);
    const outSizeKB = (outStats.size / 1024).toFixed(2);
    console.log(`  ✓ 完成: ${outSizeKB}KB`);
    
    return true;
  } catch (err) {
    console.error(`  ✗ 失败: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('=== 开始处理照片 ===\n');
  
  let successCount = 0;
  let failCount = 0;

  // 处理每个分类
  for (const [category, images] of Object.entries(IMAGE_PLAN)) {
    console.log(`\n【${category}】`);
    
    for (const img of images) {
      const success = await processImage(
        img.source, 
        path.join(category, img.target), 
        img.width, 
        img.quality
      );
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
  }

  console.log(`\n=== 处理完成 ===`);
  console.log(`成功: ${successCount} 张`);
  console.log(`失败: ${failCount} 张`);
}

main().catch(console.error);
