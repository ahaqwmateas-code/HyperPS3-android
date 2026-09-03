# Build Guide - HyperPS3-Android

Complete guide to building HyperPS3-Android from source.

## Prerequisites

### Required Software
- **Android Studio** 2024.1 or later
- **Android SDK** API 35
- **Android NDK** 26.1.10909125 (exact version required)
- **CMake** 3.22.1
- **Gradle** 8.0+
- **Java** JDK 11+ (included with Android Studio)
- **Python** 3.8+ (for build scripts)

### Required Hardware
- **RAM**: 8GB minimum (16GB recommended)
- **Disk Space**: 50GB free (for build artifacts and games)
- **Processor**: Multi-core CPU (4+ cores recommended)

### Operating System Support
- Linux (Ubuntu 22.04+ or Fedora 38+)
- macOS (12.0+)
- Windows 10/11 (with Git Bash or WSL2)

## Installation Steps

### Step 1: Install Android Studio

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y android-studio

# Fedora
sudo dnf install -y android-studio
```

#### macOS
```bash
brew install android-studio
```

#### Windows
Download from: https://developer.android.com/studio

### Step 2: Install Android SDK Components

```bash
# Using sdkmanager (available in Android Studio)
sdkmanager --install "platforms;android-35"
sdkmanager --install "build-tools;35.0.0"
sdkmanager --install "ndk;26.1.10909125"
sdkmanager --install "cmake;3.22.1"
```

Or via Android Studio GUI:
1. Settings → Appearance & Behavior → System Settings → Android SDK
2. SDK Platforms → Android 14 (API 34) ✓
3. SDK Tools:
   - Android SDK Build-Tools 35.0.0 ✓
   - NDK (Side by side) 26.1.10909125 ✓
   - CMake 3.22.1 ✓
   - Android Emulator (optional)

### Step 3: Set ANDROID_HOME

```bash
# Linux/macOS (~/.bashrc, ~/.zshrc, or ~/.bash_profile)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$ANDROID_HOME/tools:$PATH
export PATH=$ANDROID_HOME/platform-tools:$PATH

# Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\YourUser\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\tools"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"

# Verify installation
adb version
```

### Step 4: Clone Repository

```bash
# Clone with submodules
git clone --recursive https://github.com/ahaqwmateas-code/HyperPS3-android.git
cd HyperPS3-android

# Or if already cloned without submodules:
git submodule update --init --recursive
```

### Step 5: Configure Build Properties

Edit `gradle.properties`:

```gradle
# Set your ANDROID_HOME path explicitly (optional, if not in environment)
# android.sdkRoot=/path/to/Android/Sdk

# Performance tweaks for your system
org.gradle.jvmargs=-Xmx6144m       # Increase for 16GB+ RAM systems
org.gradle.workers.max=8            # CPU cores
```

## Building

### Option 1: Build Using Gradle (Recommended)

#### Debug Build (Development)

```bash
# Full clean build
./gradlew clean assembleDebug

# Quick rebuild (if no .gradle deletion)
./gradlew assembleDebug

# Build specific variant
./gradlew assembleDebug --info    # Verbose output
```

**Output**: `app/build/outputs/apk/debug/aps3e-debug.apk`

#### Release Build (Production)

```bash
# Requires signing configuration
./gradlew assembleRelease

# Build without signing (for testing)
./gradlew assembleRelease --exclude-task signReleaseApk
```

**Output**: `app/build/outputs/apk/release/aps3e-release-unsigned.apk`

### Option 2: Build Using Android Studio GUI

1. **Open Project**:
   - File → Open → Select HyperPS3-android folder
   - Wait for Gradle sync to complete

2. **Build Variant**:
   - Build → Select Build Variant → debuggable or release

3. **Build APK**:
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

4. **Locate APK**:
   - `app/build/outputs/apk/<variant>/`

### Build Customization

#### Custom Optimization Flags

Edit `app/build.gradle`:

```gradle
externalNativeBuild {
    cmake {
        cppFlags "-std=c++17"
        // Add optimization flags
        cppFlags "-O3"              // Maximum optimization
        // cppFlags "-O0 -g"        // Debug mode
        
        // Add CPU-specific flags
        arguments "-DCMAKE_SIZEOF_VOID_P=8"  // 64-bit
    }
}
```

#### Target Specific ABI Only

In `app/build.gradle`:

```gradle
defaultConfig {
    ndk {
        abiFilters 'arm64-v8a'  // Only arm64
        // Optional: 'armeabi-v7a' for 32-bit
    }
}
```

## Installation on Device

### Prerequisites
- Connected Android device (with USB debugging enabled)
- Or Android Emulator running

### Enable USB Debugging

**On Device**:
1. Settings → About phone → Tap "Build number" 7 times
2. Settings → Developer options → USB Debugging ✓
3. Connect via USB cable

**Verify Connection**:
```bash
adb devices
# Output should show: [device-id] device
```

### Install APK

```bash
# Install debug build
adb install -r app/build/outputs/apk/debug/aps3e-debug.apk

# Install and run
adb install -r app/build/outputs/apk/debug/aps3e-debug.apk
adb shell am start -n aenu.aps3e/.MainActivity

# Uninstall
adb uninstall aenu.aps3e
```

### View Live Logs

```bash
# Real-time logcat
adb logcat | grep "PS3EMU\|mali_gralloc\|VK"

# Filter for errors only
adb logcat *:S E:V | grep "PS3EMU\|Error\|ERROR"

# Save to file
adb logcat > logcat_$(date +%Y%m%d_%H%M%S).txt

# Clear previous logs
adb logcat -c
```

## Emulator Setup (Optional)

### Create Emulator

```bash
# Using command line
emulator -avd list            # List existing emulators
emulator -avd Pixel_7_Pro_API_35 &   # Launch emulator

# Using Android Studio GUI
Tools → Device Manager → Create Device
- Device: Pixel 7 Pro
- Release: API 35 (Android 15)
- ABI: arm64-v8a
```

### Recommended Emulator Settings

**RAM**: 4GB
**VM Heap**: 512MB
**Resolution**: 2796×1290 (Pixel 7 Pro)
**GPU Acceleration**: Enabled (if available)

## Troubleshooting

### Gradle Sync Issues

```bash
# Clean gradle cache
rm -rf .gradle
rm -rf ~/.gradle/caches

# Resync
./gradlew sync
```

### NDK Not Found

```bash
# Verify NDK installation
ls $ANDROID_HOME/ndk/26.1.10909125

# Reinstall if missing
sdkmanager --install "ndk;26.1.10909125"
```

### CMake Version Mismatch

```bash
# Check installed CMake
cmake --version

# Install correct version
sdkmanager --install "cmake;3.22.1"
```

### C++ Compilation Errors

```bash
# Check for STL compatibility
# Ensure C++17 support is enabled in app/build.gradle:
cppFlags "-std=c++17"

# Rebuild native code
./gradlew cleanNative
./gradlew assembleDebug
```

### Out of Memory During Build

```bash
# Increase heap size in gradle.properties
org.gradle.jvmargs=-Xmx8192m

# Or run with less parallelism
./gradlew assembleDebug --parallel=false
```

### ADB Device Not Found

```bash
# Check USB connection
lsusb  # Linux/macOS
# Look for: "Android" device

# Restart adb
adb kill-server
adb start-server
adb devices

# On Windows, install USB drivers:
# http://developer.android.com/studio/run/win-usb.html
```

## Build Verification

### Check APK Structure

```bash
# List APK contents
unzip -l app/build/outputs/apk/debug/aps3e-debug.apk

# Should contain:
# - lib/arm64-v8a/libe.so (main emulator library)
# - resources.pb
# - AndroidManifest.xml
```

### Verify Native Libraries

```bash
# Extract and inspect
unzip -p app/build/outputs/apk/debug/aps3e-debug.apk \
  lib/arm64-v8a/libe.so | file -

# Should output: ELF 64-bit LSB shared object, ARM aarch64
```

## Performance Optimization

### Faster Builds

```bash
# Parallel builds (default)
org.gradle.parallel=true

# Use build cache
org.gradle.caching=true

# Daemon process
org.gradle.daemon=true

# Watch filesystem changes
org.gradle.vfs.watch.enabled=true
```

### Incremental Compilation

```bash
# Only rebuild changed files
./gradlew assemble --incremental

# No rebuilding
./gradlew assembleDebug --build-cache
```

## Advanced Topics

### Custom NDK Build

```bash
# Manual CMake configuration
cd app/src/main/cpp
mkdir -p build && cd build

cmake .. \
  -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK/build/cmake/android.toolchain.cmake \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM=android-28

make -j$(nproc)
```

### Profiling Builds

```bash
# Generate build profile
./gradlew assembleDebug --profile

# View profile (HTML report)
open build/reports/profile/profile-2024-01-15-10-45-00.html
```

### CI/CD Integration

```yaml
# GitHub Actions example (.github/workflows/build.yml)
name: Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      - uses: actions/setup-java@v3
        with:
          java-version: 11
      - run: ./gradlew assembleDebug
      - uses: actions/upload-artifact@v3
        with:
          name: apk
          path: app/build/outputs/apk/debug/aps3e-debug.apk
```

## Support

- **Build Issues**: Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **GitHub Issues**: Report build-specific problems
- **Logs**: Attach `logcat` output when asking for help

---

**Last Updated**: 2026-09-03  
**NDK Version**: 26.1.10909125  
**Min Android**: 9 (API 28)  
**Target Android**: 15 (API 35)
