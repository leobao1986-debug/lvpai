/**
 * 照片压缩上传准备脚本
 * 功能：压缩 D:\lvpai\photo 下的照片并按分类归档
 * 输出到 D:\lvpai\cloud-upload/ 目录，用户手动上传到云存储
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SOURCE_DIR = 'D:\\lvpai\\photo'
const OUTPUT_DIR = 'D:\\lvpai\\cloud-upload'

// 照片分类映射
const photoMapping = {
  // gallery 客片
  '3.jpg': { category: 'couple', name: 'couple_01.jpg' },
  '4.jpg': { category: 'children', name: 'children_01.jpg' },
  '5.jpg': { category: 'mausoleum', name: 'mausoleum_01.jpg' },
  '6.jpg': { category: 'grassland', name: 'grassland_01.jpg' },
  '8.jpg': { category: 'children', name: 'children_02.jpg' },
  '10.jpg': { category: 'grassland', name: 'grassland_02.jpg' },
  '11.jpg': { category: 'couple', name: 'couple_02.jpg' },
  '12.jpg': { category: 'children', name: 'children_03.jpg' },
  '13.jpg': { category: 'mausoleum', name: 'mausoleum_02.jpg' },
  '14.jpg': { category: 'grassland', name: 'grassland_03.jpg' },
  '15.jpg': { category: 'couple', name: 'couple_03.jpg' },
  '16.jpg': { category: 'children', name: 'children_04.jpg' },
  '17.jpg': { category: 'mausoleum', name: 'mausoleum_03.jpg' },
  '18.jpg': { category: 'mausoleum', name: 'mausoleum_04.jpg' },
  '微信图片_20260409113908.jpg': { category: 'grassland', name: 'grassland_04.jpg' },
  '微信图片_20260409113938.jpg': { category: 'couple', name: 'couple_04.jpg' }
}

// 压缩参数
const COMPRESS_OPTIONS = {
  width: 1200,
  quality: 80,
  format: 'jpeg'
}

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`  创建目录: ${dir}`)
  }
}

/**
 * 压缩单张图片
 */
async function compressImage(sourcePath, targetPath, options) {
  try {
    // 获取原始文件信息
    const stats = fs.statSync(sourcePath)
    const originalSizeMB = (stats.size / 1024 / 1024).toFixed(2)

    console.log(`  处理: ${path.basename(sourcePath)} (${originalSizeMB}MB)`)

    // 使用 sharp 压缩
    await sharp(sourcePath)
      .resize(options.width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({
        quality: options.quality,
        progressive: true,
        mozjpeg: true
      })
      .toFile(targetPath)

    // 检查输出文件大小
    const outStats = fs.statSync(targetPath)
    const outSizeKB = (outStats.size / 1024).toFixed(2)
    const compressionRatio = ((1 - outStats.size / stats.size) * 100).toFixed(1)

    console.log(`    ✓ 完成: ${outSizeKB}KB (压缩率: ${compressionRatio}%)`)

    return {
      success: true,
      originalSize: originalSizeMB + 'MB',
      outputSize: outSizeKB + 'KB',
      compressionRatio: compressionRatio + '%'
    }
  } catch (err) {
    console.error(`    ✗ 失败: ${err.message}`)
    return { success: false, error: err.message }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('=== 照片压缩上传准备脚本 ===\n')

  // 1. 检查源目录
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`错误: 源目录不存在 ${SOURCE_DIR}`)
    process.exit(1)
  }

  // 2. 创建输出目录结构
  console.log('【1/3】创建输出目录结构...')
  const categories = ['couple', 'children', 'mausoleum', 'grassland']
  for (const category of categories) {
    ensureDir(path.join(OUTPUT_DIR, 'gallery', category))
  }
  console.log('  ✓ 目录结构创建完成\n')

  // 3. 处理照片
  console.log('【2/3】压缩照片...')
  let successCount = 0
  let failCount = 0
  const results = []

  for (const [sourceFile, mapping] of Object.entries(photoMapping)) {
    const sourcePath = path.join(SOURCE_DIR, sourceFile)
    const targetPath = path.join(OUTPUT_DIR, 'gallery', mapping.category, mapping.name)

    if (!fs.existsSync(sourcePath)) {
      console.warn(`  ⚠️ 跳过: 源文件不存在 ${sourceFile}`)
      failCount++
      continue
    }

    const result = await compressImage(sourcePath, targetPath, COMPRESS_OPTIONS)
    results.push({
      source: sourceFile,
      target: `gallery/${mapping.category}/${mapping.name}`,
      ...result
    })

    if (result.success) {
      successCount++
    } else {
      failCount++
    }
  }

  console.log(`\n  成功: ${successCount} 张, 失败: ${failCount} 张\n`)

  // 4. 生成文件清单
  console.log('【3/3】生成文件清单...')
  const manifest = {
    generateTime: new Date().toISOString(),
    totalFiles: successCount + failCount,
    successCount,
    failCount,
    compressOptions: COMPRESS_OPTIONS,
    files: results
  }

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`  ✓ 清单已保存: ${manifestPath}\n`)

  // 5. 输出统计信息
  console.log('=== 处理完成 ===')
  console.log(`输出目录: ${OUTPUT_DIR}`)
  console.log(`文件分布:`)
  for (const category of categories) {
    const categoryDir = path.join(OUTPUT_DIR, 'gallery', category)
    if (fs.existsSync(categoryDir)) {
      const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.jpg'))
      console.log(`  - ${category}: ${files.length} 张`)
    }
  }

  console.log('\n下一步操作:')
  console.log('1. 打开微信开发者工具')
  console.log('2. 进入"云开发" -> "存储"')
  console.log('3. 创建文件夹: gallery/couple, gallery/children, gallery/mausoleum, gallery/grassland')
  console.log('4. 将 cloud-upload/gallery/ 下的文件上传到对应文件夹')
  console.log('5. 上传完成后，获取文件的 cloud:// 路径，更新数据库中的图片地址')
}

// 运行主函数
main().catch(err => {
  console.error('脚本执行失败:', err)
  process.exit(1)
})
