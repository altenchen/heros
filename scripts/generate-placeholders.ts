/**
 * 占位资源生成脚本
 * 运行此脚本生成UI所需的占位图片
 *
 * 使用方法: npx ts-node scripts/generate-placeholders.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// 简单的PNG文件头（1x1像素透明PNG）
const TRANSPARENT_PNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
    0x42, 0x60, 0x82
]);

// 资源目录
const TEXTURES_DIR = path.join(__dirname, '../assets/resources/ui/textures');
const FONTS_DIR = path.join(__dirname, '../assets/resources/ui/fonts');

// 需要创建的占位图片
const PLACEHOLDER_IMAGES = [
    'gold.png',
    'button.png',
    'button_pressed.png',
    'panel_bg.png',
    'icon_wood.png',
    'icon_ore.png',
    'icon_crystal.png',
    'icon_gem.png',
    'icon_sulfur.png',
    'icon_mercury.png',
    'hero_avatar_placeholder.png',
    'unit_placeholder.png',
    'skill_icon_placeholder.png',
    'hex_normal.png',
    'hex_selected.png',
    'hex_movable.png',
    'hex_attackable.png'
];

// 需要创建的目录
const DIRECTORIES = [
    TEXTURES_DIR,
    FONTS_DIR
];

function main() {
    console.log('=== 生成占位资源 ===\n');

    // 创建目录
    DIRECTORIES.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✓ 创建目录: ${dir}`);
        }
    });

    // 创建占位图片
    PLACEHOLDER_IMAGES.forEach(filename => {
        const filepath = path.join(TEXTURES_DIR, filename);
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, TRANSPARENT_PNG);
            console.log(`✓ 创建占位图片: ${filename}`);
        } else {
            console.log(`  已存在: ${filename}`);
        }
    });

    console.log('\n=== 占位资源生成完成 ===');
    console.log('\n注意: 这些是1x1透明占位图片，请在Cocos Creator中替换为实际美术资源。');
}

main();