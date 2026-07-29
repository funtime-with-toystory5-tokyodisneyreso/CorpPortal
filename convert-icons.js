const sharp = require('sharp');
const path = require('path');

const inputImagePath = path.join(__dirname, 'public', 'icon-192x192.jpg');

async function convertIcons() {
  await sharp(inputImagePath)
    .resize(192, 192)
    .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));

  await sharp(inputImagePath)
    .resize(512, 512)
    .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));
  
  console.log('Icons generated successfully.');
}

convertIcons().catch(console.error);
