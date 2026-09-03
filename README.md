# HyperPS3-Android

A PlayStation 3 emulator for Android devices with optimized Vulkan support.

## Features

- **Full PS3 Game Compatibility**: Supports a wide range of PS3 games
- **Hardware Acceleration**: Vulkan-based rendering pipeline
- **ARM64 Architecture**: Optimized for modern Android devices
- **Multi-Format Support**: Various audio and video codecs

## System Requirements

- **Android Version**: Android 9.0 (API 28) or higher
- **Architecture**: ARM64 (arm64-v8a)
- **RAM**: Minimum 4GB (8GB+ recommended)
- **GPU**: Mali-G57 or higher / Adreno 630+
- **Storage**: 50GB+ free space for games

## Installation

### Build from Source

```bash
# Clone repository
git clone https://github.com/ahaqwmateas-code/HyperPS3-android.git
cd HyperPS3-android

# Build with Gradle
./gradlew assembleDebug

# Install APK
adb install -r app/build/outputs/apk/debug/aps3e-debug.apk
```

## Configuration

### Mali GPU Compatibility (MediaTek Dimensity, Samsung Exynos)

For devices with Mali GPUs, ensure proper Vulkan format mapping:

1. **Manual Format Override** (if needed):
   - Settings → Graphics → Force Format: VK_FORMAT_R8G8B8A8_UNORM
   - Disable: Enhanced Texture Compression

2. **Driver Requirements**:
   - Update GPU drivers to latest version
   - Enable Vulkan validation layers for debugging

### Adreno GPU Support (Snapdragon)

- Automatic driver optimization via libadrenotools
- Custom Turnip drivers supported on Android 11+

## Troubleshooting

### "Error: Unrecognized format 0x38"

**Cause**: GPU format mismatch on Mali devices

**Solution**:
```
1. Launch app
2. Go to Settings → Graphics
3. Set "VK_FORMAT_OVERRIDE" to "FORCE_RGBA8"
4. Restart game
```

### "Can't load library: libmagtsync.so not found"

**Cause**: Missing MediaTek hardware sync library (non-critical)

**Solution**:
- Not required for basic functionality
- Affects performance optimization only
- Emulator falls back to Vulkan Fences automatically

### GPU Crashes / Black Screen

**Steps**:
1. Clear app cache: Settings → Apps → HyperPS3 → Storage → Clear Cache
2. Reset graphics settings to defaults
3. Update Android OS and GPU drivers
4. Try a different game title (some games are more demanding)

## Performance Tips

- **Mali G57 Devices**: 
  - Set resolution scale to 0.75x initially
  - Disable advanced shaders
  - Enable multi-threading

- **High-End Devices** (Mali G77+, Adreno 660+):
  - Enable upscaling filters
  - Use enhanced texture compression
  - Full resolution rendering (1x scale)

## Project Structure

```
HyperPS3-android/
├── app/
│   ├── src/main/
│   │   ├── cpp/          # Native C++ code (91.2%)
│   │   ├── java/         # Android Java code (2.5%)
│   │   └── resources/    # App resources
│   └── build.gradle      # App build configuration
├── build.gradle          # Root build configuration
└── settings.gradle       # Gradle settings
```

## Languages

- **C++** (91.2%) - Core emulation engine
- **Java** (2.5%) - Android UI layer
- **C** (4.9%) - Legacy interfaces
- **GLSL** (0.8%) - Shader code
- **CMake** (0.3%) - Build configuration

## Building Native Components

The project uses CMake (v3.22.1) to build native libraries with C++17:

```bash
./gradlew assembleDebug        # Full build
./gradlew assemble<Config>     # Specific configuration
```

**NDK Version**: 26.1.10909125

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/enhancement`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/enhancement`)
5. Submit Pull Request

## License

This project is provided as-is for educational purposes.

## Support

For issues and bug reports:
- Check existing issues first
- Provide device specifications (CPU, GPU, Android version)
- Include relevant log files from `log_exec_*.txt`
- Describe steps to reproduce

## Credits

- **RPCS3 Team**: Core emulation engine
- **FlatBuffers**: Serialization library
- **libadrenotools**: Adreno GPU support
- **Mesa 3D**: Turnip driver support

---

**Latest Version**: 1.50.0  
**Last Updated**: 2026-09-03