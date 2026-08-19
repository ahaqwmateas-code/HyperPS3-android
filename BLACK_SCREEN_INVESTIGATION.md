# HyperPS3 Post-Logo Black-Screen Investigation

## Preservation boundary

The supplied reference APK is an arm64 Android build whose existing virtual controller and performance overlay must remain intact. The current source tree includes matching controls, including performance-overlay resources and the Android virtual pad implementation. The repair must therefore be limited to renderer lifecycle, driver selection, and recovery behavior.

## Observed failure boundary

The reported flow reaches the game publisher logo, so Android activity launch, the initial `Surface`, Vulkan initialization, and early frame presentation have all progressed far enough to show content. The failure boundary is therefore the transition into sustained RSX/Vulkan presentation after the logo rather than a package-install or initial-activity failure.

## Renderer path under review

`EmulatorActivity` supplies a `Surface` through `setup_surface`, then starts the native boot thread. The JNI bridge converts that `Surface` into an `ANativeWindow`, and `android_gs_frame` exposes the same window reference to the Vulkan renderer. The Vulkan loader supports a custom driver only when the matching setting is explicitly enabled and the selected library exists; otherwise it falls back to Android's system `libvulkan.so`.

## Repair approach

The next change will preserve the current overlay and base configuration while adding narrowly scoped diagnostics and a safe, opt-in fallback path. It will avoid forcing a custom driver, avoid releasing a renderer-owned surface during a transient lifecycle event, and surface a useful recovery option rather than silently leaving a black frame.
