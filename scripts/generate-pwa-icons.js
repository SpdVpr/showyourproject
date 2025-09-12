const fs = require('fs');
const path = require('path');

// Simple SVG icon generator
function generateSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" ry="${size * 0.15}" fill="url(#grad1)"/>
  
  <!-- Main text -->
  <text x="${size/2}" y="${size/2 - size*0.05}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.15}" 
        font-weight="bold" 
        text-anchor="middle" 
        dominant-baseline="middle" 
        fill="white">SYP</text>
  
  <!-- Subtitle -->
  <text x="${size/2}" y="${size/2 + size*0.08}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.08}" 
        text-anchor="middle" 
        dominant-baseline="middle" 
        fill="white">ShowYourProject</text>
  
  <!-- Shine effect -->
  <rect width="${size}" height="${size/2}" rx="${size * 0.15}" ry="${size * 0.15}" fill="url(#shine)"/>
</svg>`;
}

// Generate placeholder PNG data (base64)
function generatePlaceholderPNG(size) {
  // This is a simple 1x1 transparent PNG, scaled up
  // In a real implementation, you'd use a proper image library like sharp or canvas
  const canvas = `data:image/svg+xml;base64,${Buffer.from(generateSVGIcon(size)).toString('base64')}`;
  return canvas;
}

// Create simple PNG files using SVG data URLs
function createPNGFile(size) {
  const svg = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(__dirname, '..', 'public', filename);
  
  // For now, save as SVG (browsers will handle it)
  // In production, you'd convert SVG to PNG using a library like sharp
  const svgFilename = `icon-${size}x${size}.svg`;
  const svgFilepath = path.join(__dirname, '..', 'public', svgFilename);
  
  fs.writeFileSync(svgFilepath, svg);
  console.log(`Generated ${svgFilename}`);
  
  // Create a simple colored square as PNG fallback
  // This is a minimal PNG file (1x1 pixel, will be scaled by browser)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth: 8, color type: 2 (RGB), compression: 0, filter: 0, interlace: 0
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0x03, 0x00, 0x66, 0x7E, 0xEA, // compressed RGB data (purple-ish)
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  fs.writeFileSync(filepath, pngData);
  console.log(`Generated ${filename}`);
}

// Generate all required icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating PWA icons for ShowYourProject.com...');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate all icons
sizes.forEach(size => {
  createPNGFile(size);
});

// Generate favicon.ico (16x16 version)
createPNGFile(16);
createPNGFile(32);

// Generate apple-touch-icon
createPNGFile(180);

console.log('✅ All PWA icons generated successfully!');
console.log('📁 Icons saved to /public/ directory');
console.log('🔧 You can now use the manifest.json with these icons');

// Generate a simple favicon.ico file
const faviconData = Buffer.from([
  0x00, 0x00, // Reserved
  0x01, 0x00, // ICO format
  0x01, 0x00, // Number of images
  0x10, 0x10, // Width, Height (16x16)
  0x00, 0x00, // Color count, Reserved
  0x01, 0x00, // Color planes
  0x20, 0x00, // Bits per pixel
  0x68, 0x04, 0x00, 0x00, // Image size
  0x16, 0x00, 0x00, 0x00, // Image offset
  // Bitmap data would go here - simplified for demo
]);

// For now, just copy one of the PNG files as favicon
const favicon16 = path.join(publicDir, 'icon-16x16.png');
const faviconIco = path.join(publicDir, 'favicon.ico');

if (fs.existsSync(favicon16)) {
  fs.copyFileSync(favicon16, faviconIco);
  console.log('Generated favicon.ico');
}
