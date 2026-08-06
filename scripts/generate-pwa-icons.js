import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/logo-afrinova.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Sizes to generate
const targets = [
  { name: 'icon-48.png', size: 48 },
  { name: 'icon-72.png', size: 72 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.png', size: 32 },
  { name: 'favicon.ico', size: 32 }
];

async function generateIcons() {
  console.log('Generating PWA Icons from logo-afrinova.svg...');
  for (const { name, size } of targets) {
    const outputPath = path.resolve('public', name);
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(outputPath);
    console.log(`Generated ${name} (${size}x${size})`);
  }
  console.log('All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
