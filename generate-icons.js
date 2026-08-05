import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/logo-afrinova.svg');

async function generate() {
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/icon-512.png');

  // 180x180 for iOS Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  // 64x64 favicon
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.png');

  // favicon.ico (copy 64x64 or convert)
  await sharp(svgBuffer)
    .resize(48, 48)
    .toFormat('png')
    .toFile('public/favicon.ico');

  console.log('Successfully generated icon-192.png, icon-512.png, apple-touch-icon.png, favicon.png, favicon.ico');
}

generate().catch(console.error);
