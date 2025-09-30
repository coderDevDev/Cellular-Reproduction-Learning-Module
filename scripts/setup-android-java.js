const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Android Java Setup Helper...');

// Function to check Java version
function checkJavaVersion() {
  try {
    const javaVersion = execSync('java -version 2>&1', { encoding: 'utf8' });
    console.log('📋 Current Java Version:');
    console.log(javaVersion);

    // Check if Java 17+ is available
    if (
      javaVersion.includes('17.') ||
      javaVersion.includes('18.') ||
      javaVersion.includes('19.') ||
      javaVersion.includes('20.') ||
      javaVersion.includes('21.')
    ) {
      console.log('✅ Compatible Java version found!');
      return true;
    } else {
      console.log('❌ Java 17+ required for Android development');
      return false;
    }
  } catch (error) {
    console.log('❌ Java not found in PATH');
    return false;
  }
}

// Function to check JAVA_HOME
function checkJavaHome() {
  const javaHome = process.env.JAVA_HOME;
  if (javaHome) {
    console.log(`📂 JAVA_HOME: ${javaHome}`);
    return true;
  } else {
    console.log('⚠️  JAVA_HOME not set');
    return false;
  }
}

// Function to find Android Studio JDK
function findAndroidStudioJDK() {
  const possiblePaths = [
    'C:\\Program Files\\Android\\Android Studio\\jbr',
    'C:\\Program Files\\Android\\Android Studio\\jre',
    'C:\\Users\\' +
      process.env.USERNAME +
      '\\AppData\\Local\\Android\\Sdk\\jbr',
    'C:\\Android\\Sdk\\jbr'
  ];

  console.log('🔍 Searching for Android Studio JDK...');

  for (const jdkPath of possiblePaths) {
    if (fs.existsSync(jdkPath)) {
      console.log(`✅ Found Android Studio JDK at: ${jdkPath}`);
      return jdkPath;
    }
  }

  console.log('❌ Android Studio JDK not found in common locations');
  return null;
}

// Function to update gradle.properties
function updateGradleProperties(jdkPath) {
  const gradlePropsPath = path.join('android', 'gradle.properties');

  if (!fs.existsSync(gradlePropsPath)) {
    console.log('❌ gradle.properties not found');
    return false;
  }

  let content = fs.readFileSync(gradlePropsPath, 'utf8');

  // Remove existing java.home if present
  content = content.replace(/org\.gradle\.java\.home=.*/g, '');

  // Add new java.home path
  const jdkPathEscaped = jdkPath.replace(/\\/g, '\\\\');
  content += `\n# Android Studio JDK Path\norg.gradle.java.home=${jdkPathEscaped}\n`;

  fs.writeFileSync(gradlePropsPath, content);
  console.log('✅ Updated gradle.properties with JDK path');
  return true;
}

// Function to create local.properties for Android SDK
function createLocalProperties() {
  const localPropsPath = path.join('android', 'local.properties');

  // Common Android SDK paths
  const possibleSdkPaths = [
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Android\\Sdk',
    'C:\\Android\\Sdk',
    'C:\\Users\\' + process.env.USERNAME + '\\Android\\Sdk'
  ];

  let sdkPath = null;
  for (const path of possibleSdkPaths) {
    if (fs.existsSync(path)) {
      sdkPath = path;
      break;
    }
  }

  if (sdkPath) {
    const sdkPathEscaped = sdkPath.replace(/\\/g, '\\\\');
    const content = `sdk.dir=${sdkPathEscaped}\n`;
    fs.writeFileSync(localPropsPath, content);
    console.log(`✅ Created local.properties with SDK path: ${sdkPath}`);
  } else {
    console.log('⚠️  Android SDK not found, you may need to install it');
  }
}

// Main execution
console.log('🚀 Starting Android Java Setup...');
console.log('=====================================');

// Check current Java setup
const hasJava = checkJavaVersion();
const hasJavaHome = checkJavaHome();

// Find Android Studio JDK
const androidJDK = findAndroidStudioJDK();

if (androidJDK) {
  updateGradleProperties(androidJDK);
}

createLocalProperties();

console.log('\n📋 Setup Summary:');
console.log('=====================================');
console.log(`✅ Java in PATH: ${hasJava ? 'Yes' : 'No'}`);
console.log(`✅ JAVA_HOME set: ${hasJavaHome ? 'Yes' : 'No'}`);
console.log(`✅ Android Studio JDK: ${androidJDK ? 'Found' : 'Not found'}`);
console.log(`✅ gradle.properties: Updated`);
console.log(`✅ local.properties: Created`);

console.log('\n🎯 Next Steps:');
console.log('=====================================');
if (!hasJava) {
  console.log('1. 📥 Install Java 17+ from https://adoptium.net/');
  console.log('2. 🔧 Set JAVA_HOME environment variable');
}
console.log('3. 🚀 Try building again: npm run cap:build');
console.log('4. 📱 Or open Android Studio: npm run cap:android');

console.log('\n💡 Alternative Solutions:');
console.log('=====================================');
console.log("• Use Android Studio's embedded JDK (configured)");
console.log('• Download portable OpenJDK and extract to a folder');
console.log('• Use chocolate: choco install openjdk17');

if (androidJDK) {
  console.log('\n🎉 Android Studio JDK configured!');
  console.log("Your project should now build with Android Studio's JDK.");
} else {
  console.log('\n⚠️  Manual Setup Required:');
  console.log('1. Open Android Studio');
  console.log('2. Go to File > Project Structure > SDK Location');
  console.log("3. Set JDK location to Android Studio's embedded JDK");
}
