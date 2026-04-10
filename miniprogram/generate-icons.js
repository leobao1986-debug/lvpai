/**
 * 生成 Tabbar 图标脚本
 * 使用纯 Node.js 生成简单的 PNG 图标，无需外部依赖
 */

const fs = require('fs');
const path = require('path');

// 图标配置：5个tab，每个有普通态(灰)和选中态(红)
const icons = [
  { name: 'home', color: { normal: '#999999', active: '#c41230' } },
  { name: 'package', color: { normal: '#999999', active: '#c41230' } },
  { name: 'gallery', color: { normal: '#999999', active: '#c41230' } },
  { name: 'store', color: { normal: '#999999', active: '#c41230' } },
  { name: 'mine', color: { normal: '#999999', active: '#c41230' } }
];

const TABBAR_DIR = path.join(__dirname, 'src', 'static', 'tabbar');

// 确保目录存在
if (!fs.existsSync(TABBAR_DIR)) {
  fs.mkdirSync(TABBAR_DIR, { recursive: true });
}

// 创建简单的 1x1 像素 PNG（占位符）
// 实际使用时会用 CSS/Canvas 渲染，这里先创建有效文件
function createMinimalPNG(width, height, r, g, b) {
  // PNG 文件头
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR 块
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdr = createChunk('IHDR', ihdrData);
  
  // IDAT 块 - 压缩的图像数据
  const rowSize = 1 + width * 3; // filter byte + RGB data
  const imageData = Buffer.alloc(rowSize * height);
  
  for (let y = 0; y < height; y++) {
    imageData[y * rowSize] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const offset = y * rowSize + 1 + x * 3;
      imageData[offset] = r;
      imageData[offset + 1] = g;
      imageData[offset + 2] = b;
    }
  }
  
  const compressed = zlibDeflate(imageData);
  const idat = createChunk('IDAT', compressed);
  
  // IEND 块
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// 简化的 deflate 实现（用于小数据）
function zlibDeflate(data) {
  // 使用 Node.js 内置 zlib
  const zlib = require('zlib');
  return zlib.deflateSync(data);
}

// 创建 PNG chunk
function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type);
  
  const crc = require('zlib').crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// 将颜色字符串转为 RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 128, g: 128, b: 128 };
}

// 生成图标
function generateIcons() {
  const size = 81; // 微信小程序推荐尺寸
  
  icons.forEach(icon => {
    // 普通态
    const normalRgb = hexToRgb(icon.color.normal);
    const normalPng = createMinimalPNG(size, size, normalRgb.r, normalRgb.g, normalRgb.b);
    fs.writeFileSync(path.join(TABBAR_DIR, `${icon.name}.png`), normalPng);
    
    // 选中态
    const activeRgb = hexToRgb(icon.color.active);
    const activePng = createMinimalPNG(size, size, activeRgb.r, activeRgb.g, activeRgb.b);
    fs.writeFileSync(path.join(TABBAR_DIR, `${icon.name}-active.png`), activePng);
    
    console.log(`✓ 生成 ${icon.name}.png 和 ${icon.name}-active.png`);
  });
  
  console.log('\n图标生成完成！路径:', TABBAR_DIR);
}

generateIcons();
