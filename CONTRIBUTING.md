# Contributing to HyperPS3-Android

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Avoid offensive language
- Help each other learn and grow
- Focus on constructive feedback

## Getting Started

### Prerequisites

- Android Studio 2024.1+
- Android NDK 26.1.10909125
- Gradle 8.0+
- CMake 3.22.1+
- Python 3.8+ (for build scripts)
- Git

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/ahaqwmateas-code/HyperPS3-android.git
cd HyperPS3-android

# Install dependencies
git submodule update --init --recursive

# Build debug APK
./gradlew assembleDebug

# Install on connected device/emulator
adb install -r app/build/outputs/apk/debug/aps3e-debug.apk
```

## Development Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch naming convention**:
- `feature/description` - New features
- `bugfix/issue-number` - Bug fixes
- `perf/optimization-name` - Performance improvements
- `docs/change-description` - Documentation updates

### 2. Make Changes

#### Code Style Guide

**C++ Code** (91.2% of codebase):
```cpp
// Use camelCase for variables/functions
VkDevice logicalDevice;
void initializeVulkan() { }

// Classes use PascalCase
class VKGSRender { };

// Constants use UPPER_SNAKE_CASE
const size_t MAX_TEXEL_ELEMENTS = 67108864u;

// Maximum line length: 100 characters
// Use 4-space indentation

// Document complex logic with comments
// Explain WHY, not WHAT
if (isMaliGPU()) {
    // Mali-G57 requires explicit format override to avoid
    // driver rejection of VK_FORMAT_R8G8B8A8_UNORM
    surfaceFormat.format = VK_FORMAT_R8G8B8A8_UNORM;
}
```

**Java Code** (2.5% of codebase):
```java
// Follow Android/Java conventions
public class MainActivity extends AppCompatActivity {
    private static final String TAG = "PS3EMU";
    private VulkanRenderer mRenderer;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Implementation
    }
}
```

**CMake Configuration**:
```cmake
# Use lowercase for commands
cmake_minimum_required(VERSION 3.22.1)
project(aps3e)

# Clear variable documentation
set(ENABLE_VULKAN ON CACHE BOOL "Enable Vulkan rendering")

# Target properties
target_compile_features(aps3e PRIVATE cxx_std_17)
target_compile_options(aps3e PRIVATE -Wall -Wextra -Wpedantic)
```

### 3. Testing

#### Local Testing

```bash
# Build debug variant
./gradlew assembleDebug

# Run on emulator
emulator -avd Pixel_7_Pro_API_35 &
./gradlew installDebug

# Run tests
./gradlew connectedAndroidTest
```

#### Test Devices

For GPU fixes, test on multiple devices:
- **Mali devices**: Samsung Galaxy A54, A15, S21
- **Adreno devices**: OnePlus 11, Snapdragon 8 Gen 2
- **Exynos devices**: Samsung Galaxy S23

#### Game Testing

Critical test cases:
- Game launches without crashes
- Renders frames at 60 FPS (or target framerate)
- No visual glitches or corruption
- Audio syncs properly
- Controller input responds
- Memory doesn't leak (1+ hour gameplay)

### 4. Commit Guidelines

```bash
# Stage changes
git add app/src/main/cpp/rpcs3/Emu/RSX/VK/vkgsl.cpp

# Commit with clear message
git commit -m "Fix Mali GPU format mismatch in Vulkan swapchain

- Add format fallback for VK_FORMAT_R8G8B8A8_UNORM
- Detect Mali GPU and apply compatibility workarounds
- Fixes crash: 'Unrecognized format 0x38'
- Tested on Samsung Galaxy A15 (Dimensity 6100+)

Closes #42"
```

**Commit message format**:
```
<type>: <subject> (max 50 characters)

<body> (max 72 characters per line)
Explain the WHAT and WHY, not HOW.
Include relevant issue numbers.

Fixes #123
Related to #456
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `perf`: Performance improvement
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Test additions/modifications
- `chore`: Build, CI, dependencies

### 5. Push and Create Pull Request

```bash
# Push branch to GitHub
git push origin feature/your-feature-name

# Create PR with clear description
# - What problem does it solve?
# - How does it solve it?
# - Any trade-offs or side effects?
# - Testing performed
# - Screenshots (if UI changes)
```

## Pull Request Guidelines

### PR Description Template

```markdown
## Description
Brief summary of changes.

## Problem
What issue or limitation does this solve?

## Solution
How does this PR address the problem?

## Testing
- [ ] Tested on Mali-G57 device
- [ ] Tested on Adreno 630 device
- [ ] No performance regression
- [ ] All tests pass

## Performance Impact
- Mali-G57: +5-10% FPS
- Adreno: No change
- Memory: -2MB per frame

## Screenshots (if applicable)
Before/After comparison

## Checklist
- [ ] Code follows style guide
- [ ] Comments added for complex logic
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. **Automated Checks**:
   - Builds successfully
   - No compilation warnings
   - Tests pass

2. **Code Review**:
   - Maintainers review for:
     - Correctness
     - Performance
     - Code style
     - Documentation
   - At least 1 approval required

3. **Testing**:
   - Tested on multiple device types
   - No regressions
   - Performance acceptable

## Areas for Contribution

### High Priority
- [ ] Mali GPU format compatibility
- [ ] libmagtsync.so optional loading
- [ ] Vulkan limit validation
- [ ] Game compatibility improvements

### Medium Priority
- [ ] Audio codec optimization
- [ ] Controller input mapping
- [ ] Save state improvements
- [ ] User interface enhancements

### Documentation
- [ ] Troubleshooting guides
- [ ] Game compatibility database
- [ ] Build instructions
- [ ] Architecture documentation

## Reporting Issues

### Bug Report Template

```markdown
## Device Information
- Phone: Samsung Galaxy A15
- SoC: MediaTek Dimensity 6100+
- GPU: Mali-G57 MC2
- Android: 14

## Reproduce
1. Launch HyperPS3
2. Load game (e.g., Devil May Cry 4)
3. Play for 5 minutes

## Observed Behavior
Black screen after 5 minutes of gameplay

## Expected Behavior
Smooth gameplay at 60 FPS

## Error Messages
```
E/mali_gralloc: ERROR: Unrecognized format 0x38
E/libe.so: GPU allocation failed
```

## Logs
[Attach log files: logcat output, log_exec_full.txt]

## Additional Context
- Happens with all games
- Only on Mali devices
```

## Performance Optimization Guidelines

When submitting performance improvements:

1. **Benchmark Before/After**:
   ```bash
   # Use adb profiler
   adb shell am profiler start --sampling 1000
   [Run game for 60 seconds]
   adb shell am profiler stop --dump /sdcard/profile.trace
   ```

2. **Measure Impact**:
   - FPS improvement
   - Memory reduction
   - Battery consumption
   - Temperature reduction

3. **Document Results**:
   ```
   Performance Results (DMC4, 10 min gameplay):
   
   Mali-G57:
   - FPS: 45 → 52 (+15%)
   - Memory: 1.2GB → 1.1GB (-8%)
   - Temp: 42°C → 39°C (-3°C)
   
   Adreno 630:
   - No change (baseline already optimal)
   ```

## Getting Help

- **Discussions**: GitHub Discussions tab
- **Issues**: GitHub Issues for bugs/features
- **Discord**: Join our community server
- **Documentation**: Check FIXES.md and README.md first

## Legal

By contributing, you agree that:
- Your contributions will be licensed under the same MIT license
- You have the right to contribute the code
- You've tested your changes
- You won't introduce malicious code

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- GitHub Contributors page

Thank you for helping make HyperPS3-Android better!

---

**Last Updated**: 2026-09-03  
**Maintainer**: ahaqwmateas-code