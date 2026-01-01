# EnglishLab Mobile App - APK Build Guide

## Overview
EnglishLab Mobile adalah aplikasi pembelajaran bahasa Inggris interaktif yang dibangun menggunakan React Native dan Expo.

## Tech Stack
- **Framework**: React Native dengan TypeScript
- **Build Tool**: Expo
- **Database**: PostgreSQL (Backend)
- **API**: Node.js/Hono
- **Platform Target**: Android, iOS

## Setup Requirements

### 1. Prerequisites
- Node.js (v18+)
- Java Development Kit (JDK 17+)
- Android SDK
- Expo CLI
- Git

### 2. Installation Steps

```bash
# Clone repository
git clone https://github.com/knzzaa/virtual-web.git
cd virtual-web/mobile

# Install dependencies
npm install

# Setup Expo
npx expo prebuild --platform android --clean

# Build APK
cd android
./gradlew assembleRelease
```

### 3. Build Output
APK file akan tersimpan di:
```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

## APK Build Process

### Option 1: Local Build (Current Method)
```bash
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"

cd mobile/android
./gradlew assembleRelease --no-daemon
```

### Option 2: EAS Build (Recommended for CI/CD)
```bash
npm install -g eas-cli
eas login
eas build --platform android
```

## Features Implemented
- ✅ Mission-based learning system with auto-progression
- ✅ 8-minute timer per mission with countdown
- ✅ Answer feedback with visual indicators (correct/wrong)
- ✅ Mission result screen with celebration animation
- ✅ Animated bubble background (PurpleLights)
- ✅ Authentication system (Login/Register)
- ✅ Material & Exam modules
- ✅ History tracking

## Project Structure
```
mobile/
├── src/
│   ├── screens/
│   │   ├── mission/
│   │   │   ├── MissionHomeScreen.tsx      # Mission list
│   │   │   ├── MissionNextScreen.tsx      # Mission Q&A with timer
│   │   │   └── MissionResultScreen.tsx    # Celebration & next
│   │   ├── auth/
│   │   ├── exam/
│   │   ├── material/
│   │   └── ...
│   ├── components/
│   ├── services/
│   ├── navigation/
│   ├── types/
│   └── ...
├── app.json                               # Expo config
├── eas.json                              # EAS Build config
├── package.json
└── tsconfig.json
```

## Build Configuration

### app.json (Expo Config)
```json
{
  "expo": {
    "name": "EnglishLab",
    "slug": "englishlab",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "android": {
      "package": "com.anonymous.englishlab"
    }
  }
}
```

### eas.json (EAS Build Config)
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## Troubleshooting

### Issue: Java not found
**Solution**: Install Java 17
```bash
brew install openjdk@17
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

### Issue: Android SDK not found
**Solution**: Set ANDROID_HOME in local.properties
```properties
sdk.dir=/opt/homebrew/share/android-commandlinetools
```

### Issue: Gradle build fails
**Solution**: Clean and rebuild
```bash
./gradlew clean
./gradlew assembleRelease --no-daemon
```

## Environment Variables
```bash
JAVA_HOME=/opt/homebrew/opt/openjdk@17
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
PATH=$JAVA_HOME/bin:$PATH
```

## Backend API Configuration
API base URL configured in: `mobile/src/services/api.ts`
```typescript
const API_BASE_URL = 'http://localhost:3000';
```

## Testing APK
1. Transfer APK ke Android device atau emulator
2. Install: `adb install app-release.apk`
3. Launch aplikasi dan test features

## Deployment Checklist
- [ ] Verify all dependencies installed
- [ ] Check API connection working
- [ ] Build APK successfully
- [ ] Test on Android device/emulator
- [ ] Sign APK with production key
- [ ] Upload to Google Play Store (if needed)

## Contact & Support
GitHub: https://github.com/knzzaa/virtual-web
Owner: knzzaa

---
Generated on: 2026-01-02
Build Version: 1.0.0
