const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeLogo() {
  const inputPath = path.join(__dirname, '../public/syp-logo.png');
  const outputPath = path.join(__dirname, '../public/syp-logo-optimized.png');
  
  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('Input logo file not found:', inputPath);
      return;
    }

    // Get original file size
    const originalStats = fs.statSync(inputPath);
    console.log(`Original logo size: ${(originalStats.size / 1024).toFixed(2)} KB`);

    // Optimize the logo
    await sharp(inputPath)
      .resize(40, 40, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ 
        quality: 90,
        compressionLevel: 9,
        progressive: true
      })
      .toFile(outputPath);

    // Get optimized file size
    const optimizedStats = fs.statSync(outputPath);
    const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);
    
    console.log(`Optimized logo size: ${(optimizedStats.size / 1024).toFixed(2)} KB`);
    console.log(`Size reduction: ${savings}%`);
    
    // Replace original with optimized version
    fs.renameSync(outputPath, inputPath);
    console.log('Logo optimized successfully!');
    
  } catch (error) {
    console.error('Error optimizing logo:', error);
  }
}

// Run if called directly
if (require.main === module) {
  optimizeLogo();
}

module.exports = { optimizeLogo };
