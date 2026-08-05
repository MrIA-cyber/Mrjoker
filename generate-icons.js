import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/logo-afrinova.svg');

const sizes = [
  { name: 'icon-48.png', size: 48 },
  { name: 'icon-72.png', size: 72 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.png', size: 64 },
  { name: 'favicon.ico', size: 48 },
];

async function generate() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const item of sizes) {
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .toFormat(item.name.endsWith('.ico') ? 'png' : 'png')
      .toFile(path.join('public', item.name));
    console.log(`Generated public/${item.name} (${item.size}x${item.size})`);
  }
}

generate().catch(console.error);
