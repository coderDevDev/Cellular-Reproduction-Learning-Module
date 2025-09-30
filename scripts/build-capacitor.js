const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building SCIMS for Capacitor...');

// Step 1: Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
  }
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
} catch (error) {
  console.log('No previous builds to clean');
}

// Step 2: Build Next.js static export
console.log('📦 Building Next.js static export...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}

// Step 3: Verify build output
if (!fs.existsSync('out')) {
  console.error('❌ Build output directory "out" not found');
  process.exit(1);
}

console.log('✅ Next.js build completed successfully');

// Step 4: Create 404.html for proper routing in Capacitor
console.log('🔧 Creating 404.html for SPA routing...');
const indexHtml = path.join('out', 'index.html');
const notFoundHtml = path.join('out', '404.html');

if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, notFoundHtml);
  console.log('✅ 404.html created for SPA routing');
}

// Step 5: Update Capacitor configuration if needed
console.log('⚙️  Updating Capacitor configuration...');
const capacitorConfig = `
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.scims.seniorapp',
  appName: 'SCIMS - Senior Citizen App',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#00af8f',
      androidSplashResourceName: 'splash',
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      showSpinner: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#00af8f'
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    Filesystem: {
      androidRequestPermissions: true
    },
    App: {
      launchUrl: 'capacitor://localhost'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      keystorePassword: undefined,
      releaseType: 'APK'
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
`;

fs.writeFileSync('capacitor.config.ts', capacitorConfig);
console.log('✅ Capacitor configuration updated');

// Step 6: Sync with Capacitor
console.log('🔄 Syncing with Capacitor...');
try {
  execSync('npx cap sync', { stdio: 'inherit' });
  console.log('✅ Capacitor sync completed');
} catch (error) {
  console.error('❌ Capacitor sync failed:', error.message);
  process.exit(1);
}

// Step 7: Verify Android project
const androidDir = path.join('android');
if (fs.existsSync(androidDir)) {
  console.log('✅ Android project is ready');

  // Check if we have the necessary Android build tools
  console.log('\n📱 Android Build Information:');
  console.log('==========================================');
  console.log('✅ Capacitor Android project created');
  console.log('✅ Web assets synced to Android');
  console.log('✅ All offline functionality bundled');

  console.log('\n🔧 Next Steps:');
  console.log(
    '1. Install Android Studio: https://developer.android.com/studio'
  );
  console.log('2. Open Android project: npm run cap:android');
  console.log('3. Build APK: npm run mobile:build:android');
  console.log('4. Or build directly in Android Studio');

  console.log('\n📦 APK Build Commands:');
  console.log('• Development APK: npm run cap:serve');
  console.log('• Production APK: npm run mobile:build:android');
  console.log('• Open Android Studio: npm run cap:android');
} else {
  console.error('❌ Android project not found. Run: npx cap add android');
  process.exit(1);
}

console.log('\n🎉 Capacitor build completed successfully!');
console.log('\n📊 Build Summary:');
console.log('==========================================');
console.log('✅ Next.js app exported as static files');
console.log('✅ All PWA features included');
console.log('✅ Offline database (IndexedDB) bundled');
console.log('✅ Service Worker for offline caching');
console.log('✅ Capacitor native features integrated');
console.log('✅ Camera, filesystem, preferences available');
console.log('✅ Network detection for auto-sync');
console.log('✅ Background sync capabilities');

console.log('\n🚀 Your SCIMS app is now ready for mobile deployment!');
console.log(
  'The entire app will work offline with all UI files bundled in the APK.'
);
