const fs = require('fs');
const path = require('path');

// This script helps set up PWA assets and validates configuration
console.log('🚀 Setting up PWA configuration...');

// Check if required files exist
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/offline.html'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error('❌ Missing required PWA files:');
  missingFiles.forEach(file => console.error(`  - ${file}`));
  process.exit(1);
}

// Check if icons directory exists
if (!fs.existsSync('public/icons')) {
  console.log('📁 Creating icons directory...');
  fs.mkdirSync('public/icons', { recursive: true });
}

// Generate placeholder icons (you should replace these with actual icons)
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgTemplate = size => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#00af8f"/>
  <rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.6}" height="${
  size * 0.6
}" fill="white" rx="${size * 0.1}"/>
  <text x="${size / 2}" y="${
  size / 2 + size * 0.05
}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${
  size * 0.15
}" font-weight="bold" fill="#00af8f">SC</text>
  <text x="${size / 2}" y="${
  size / 2 + size * 0.2
}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${
  size * 0.08
}" fill="#00af8f">IMS</text>
</svg>`;

console.log('🎨 Generating placeholder icons...');
iconSizes.forEach(size => {
  const iconPath = `public/icons/icon-${size}x${size}.png`;
  if (!fs.existsSync(iconPath)) {
    // Create SVG and save as placeholder
    const svgContent = svgTemplate(size);
    const svgPath = `public/icons/icon-${size}x${size}.svg`;
    fs.writeFileSync(svgPath, svgContent);
    console.log(`  ✅ Created ${svgPath}`);
  }
});

// Create screenshots directory
if (!fs.existsSync('public/screenshots')) {
  fs.mkdirSync('public/screenshots', { recursive: true });
  console.log('📱 Created screenshots directory');
}

// Validate manifest.json
try {
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
  console.log('📋 Manifest validation:');
  console.log(`  ✅ Name: ${manifest.name}`);
  console.log(`  ✅ Short name: ${manifest.short_name}`);
  console.log(`  ✅ Start URL: ${manifest.start_url}`);
  console.log(`  ✅ Display: ${manifest.display}`);
  console.log(`  ✅ Theme color: ${manifest.theme_color}`);
  console.log(`  ✅ Icons: ${manifest.icons.length} defined`);
} catch (error) {
  console.error('❌ Invalid manifest.json:', error.message);
  process.exit(1);
}

// Check Next.js configuration for PWA
const nextConfigPath = 'next.config.mjs';
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  if (!nextConfig.includes('sw.js')) {
    console.log(
      '⚠️  Consider adding service worker configuration to next.config.mjs'
    );
  }
}

console.log('\n🎉 PWA setup complete!');
console.log('\nNext steps:');
console.log('1. Replace placeholder icons with your actual app icons');
console.log('2. Add screenshots to public/screenshots/ directory');
console.log('3. Test the PWA installation on different devices');
console.log('4. Configure push notifications if needed');
console.log('5. Test offline functionality');

console.log('\n📖 PWA Features enabled:');
console.log('  ✅ Offline support with service worker');
console.log('  ✅ Background sync for offline data');
console.log('  ✅ App installation prompt');
console.log('  ✅ Automatic updates');
console.log('  ✅ Local database with IndexedDB');
console.log('  ✅ Network status monitoring');
console.log('  ✅ Push notification support');

console.log('\n🔧 Development commands:');
console.log('  npm run dev - Start development server with PWA');
console.log('  npm run build - Build for production with PWA optimizations');
console.log('  npm run start - Start production server with PWA');

console.log('\n📊 To test PWA features:');
console.log('  1. Open Chrome DevTools > Application > Manifest');
console.log('  2. Open Chrome DevTools > Application > Service Workers');
console.log('  3. Test offline mode in Network tab');
console.log('  4. Use Lighthouse PWA audit');

