const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, '..', 'src', 'static', 'tabbar');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 图标颜色
const COLOR_NORMAL = '#999999';
const COLOR_ACTIVE = '#8b1a1a';

// 图标尺寸
const SIZE = 81;

// 1. 首页 - 蒙古包图标
const homeSvg = (color) => `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <!-- 穹顶 -->
  <path d="M15,55 Q40,12 65,55" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
  <!-- 底部 -->
  <line x1="15" y1="55" x2="65" y2="55" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
  <!-- 门 -->
  <path d="M34,55 L34,42 Q40,36 46,42 L46,55" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  <!-- 门中间的分割线 -->
  <line x1="40" y1="39" x2="40" y2="55" stroke="${color}" stroke-width="2"/>
</svg>`;

// 2. 套餐 - 蒙古袍/礼盒图标
const packageSvg = (color) => `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <!-- 袍身 -->
  <path d="M25,22 L20,62 L60,62 L55,22 Z" fill="none" stroke="${color}" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- 领口 -->
  <path d="M32,22 L40,32 L48,22" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- 腰带 -->
  <line x1="22" y1="40" x2="58" y2="40" stroke="${color}" stroke-width="3"/>
  <!-- 装饰 -->
  <circle cx="40" cy="40" r="3.5" fill="${color}"/>
</svg>`;

// 3. 客片 - 相框/画卷图标
const gallerySvg = (color) => `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <!-- 画框 -->
  <rect x="15" y="15" width="50" height="40" rx="3" fill="none" stroke="${color}" stroke-width="3.5"/>
  <!-- 山景 -->
  <path d="M20,45 L32,29 L40,37 L50,25 L60,45" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- 太阳 -->
  <circle cx="52" cy="22" r="3" fill="${color}"/>
  <!-- 底座 -->
  <path d="M28,58 L35,65 L45,65 L52,58" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// 4. 门店 - 蒙古包+定位图标
const storeSvg = (color) => `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <!-- 定位针外圈 -->
  <path d="M40,10 C28,10 18,20 18,32 C18,48 40,68 40,68 C40,68 62,48 62,32 C62,20 52,10 40,10 Z" fill="none" stroke="${color}" stroke-width="3.5"/>
  <!-- 内部蒙古包 - 穹顶 -->
  <path d="M30,36 Q40,22 50,36" fill="none" stroke="${color}" stroke-width="2.5"/>
  <!-- 内部蒙古包 - 底部 -->
  <line x1="30" y1="36" x2="50" y2="36" stroke="${color}" stroke-width="2.5"/>
  <!-- 内部蒙古包 - 门 -->
  <path d="M37,36 L37,30 Q40,27 43,30 L43,36" fill="none" stroke="${color}" stroke-width="2"/>
</svg>`;

// 5. 我的 - 人物+蒙古帽图标
const mineSvg = (color) => `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <!-- 头 -->
  <circle cx="40" cy="28" r="12" fill="none" stroke="${color}" stroke-width="3.5"/>
  <!-- 蒙古帽顶 -->
  <path d="M32,20 L40,8 L48,20" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- 帽尖装饰 -->
  <circle cx="40" cy="8" r="3" fill="${color}"/>
  <!-- 身体 -->
  <path d="M20,65 C20,48 30,42 40,42 C50,42 60,48 60,65" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

// 图标配置
const icons = [
  { name: 'home', svg: homeSvg },
  { name: 'package', svg: packageSvg },
  { name: 'gallery', svg: gallerySvg },
  { name: 'store', svg: storeSvg },
  { name: 'mine', svg: mineSvg }
];

// 生成图标
async function generateIcons() {
  for (const icon of icons) {
    // 普通态（灰色）
    const normalSvg = icon.svg(COLOR_NORMAL);
    await sharp(Buffer.from(normalSvg))
      .png()
      .toFile(path.join(outputDir, `${icon.name}.png`));
    console.log(`✓ Generated ${icon.name}.png`);

    // 选中态（蒙古红）
    const activeSvg = icon.svg(COLOR_ACTIVE);
    await sharp(Buffer.from(activeSvg))
      .png()
      .toFile(path.join(outputDir, `${icon.name}-active.png`));
    console.log(`✓ Generated ${icon.name}-active.png`);
  }
  console.log('\n所有图标生成完成！');
}

generateIcons().catch(err => {
  console.error('生成图标失败:', err);
  process.exit(1);
});
