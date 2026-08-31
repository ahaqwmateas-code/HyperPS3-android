# HyperPS3 futuristic repair

Applied fixes:
- Restored the missing `app/build.gradle` from the supplied `.bak` so `:app:assembleDebug` exists again.
- Bumped the Android version code to 150 / version 1.50.0 so it can update a v148 install instead of triggering a downgrade.
- Reworked the main screen into a dark futuristic dashboard and made the empty library state visible.
- Added a one-tap SCAN action wired to the existing game-list refresh routine.
- Changed the game-library rows to a futuristic card presentation without changing the adapter IDs.
- Made native library loading synchronized/idempotent and fixed the partial-load retry trap.
- Hardened GPU probing so a failed Vulkan probe does not throw from `should_delay_load()`.
- Removed the forced `SurfaceHolder` RGBX format; Vulkan now uses the compatible Android surface format selected by the native swapchain logic.
- Retained the existing Mali-G57 BGRA/safe texel-buffer work already present in the supplied native source.

Validation:
- All Android XML resources parse successfully.
- Edited Java source has balanced braces/structure checks.
- A full APK build could not be executed in this environment because the Gradle wrapper attempted to download Gradle 8.10.2 and outbound DNS/network access is unavailable here.

Build on the Android/Termux environment that already has the Android SDK/NDK installed:

```sh
cd ~/android/HyperPS3/source-1.20/aps3e-main2
./gradlew clean
./gradlew :app:assembleDebug
```

The APK will be under `app/build/outputs/apk/debug/`.
