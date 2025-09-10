import sharp from 'sharp';
import fs from 'fs';

async function convertSvgToPng() {
  try {
    // Convert 192x192 icon
    await sharp('./public/icon-192.svg')
      .png()
      .resize(192, 192)
      .toFile('./public/icon-192.png');
    
    // Convert 512x512 icon
    await sharp('./public/icon-512.svg')
      .png()
      .resize(512, 512)
      .toFile('./public/icon-512.png');
    
    console.log('Icons converted successfully!');
  } catch (error) {
    console.error('Error converting icons:', error);
  }
}

convertSvgToPng();
