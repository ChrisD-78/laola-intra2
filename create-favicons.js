const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, 'public', 'logo-favicon.svg');
const publicDir = path.join(__dirname, 'public');

// Favicon Größen
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function createFavicons() {
  try {
    console.log('🎨 Erstelle Favicons aus SVG...\n');

    // Erstelle alle Favicon-Varianten
    for (const { name, size } of sizes) {
      const outputPath = path.join(publicDir, name);
      
      await sharp(inputSvg)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${name} (${size}x${size}) erstellt`);
    }

    // Erstelle favicon.ico (Multi-Resolution ICO)
    // ICO Dateien benötigen spezielle Behandlung - wir erstellen eine 32x32 Version
    const icoPath = path.join(__dirname, 'src', 'app', 'favicon.ico');
    const icoPng = await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    // Für ICO verwenden wir die PNG-Version (Next.js konvertiert automatisch)
    fs.writeFileSync(icoPath.replace('.ico', '.png'), icoPng);
    console.log(`✅ favicon.png (32x32) erstellt`);

    console.log('\n✨ Alle Favicons erfolgreich erstellt!');
    console.log('\n📝 Nächste Schritte:');
    console.log('   1. Die layout.tsx wurde bereits aktualisiert');
    console.log('   2. Die Favicons sind in /public verfügbar');
    console.log('   3. Nach dem Deployment werden sie automatisch verwendet');

  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Favicons:', error);
    process.exit(1);
  }
}

createFavicons();

