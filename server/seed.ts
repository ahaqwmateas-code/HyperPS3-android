import { getDb } from "./db";
import { performanceProfiles, gameCompatibility, settingsGuide, emulatorVersions } from "../drizzle/schema";

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  console.log("🌱 Seeding database...");

  try {
    // Seed Performance Profiles
    console.log("📋 Seeding performance profiles...");
    const turboConfig = `# HyperPS3 Turbo Profile - Maximum Performance
ppu_decoder: LLVM
spu_decoder: ASMJIT
clocks_scale: 200
thread_scheduler_mode: Affinity
max_spurs_threads: 8
preferred_spu_threads: 0
write_color_buffers: true
write_depth_buffer: true
strict_rendering_mode: true
asynchronous_queue_scheduler: true
asynchronous_texture_streaming_2: true
llvm_precompilation: true`;

    const balancedConfig = `# HyperPS3 Balanced Profile - Optimal Performance & Stability
ppu_decoder: LLVM
spu_decoder: ASMJIT
clocks_scale: 150
thread_scheduler_mode: Affinity
max_spurs_threads: 6
preferred_spu_threads: 0
write_color_buffers: true
write_depth_buffer: false
strict_rendering_mode: false
asynchronous_queue_scheduler: true
asynchronous_texture_streaming_2: false
llvm_precompilation: true`;

    const compatibilityConfig = `# HyperPS3 Compatibility Profile - Maximum Stability
ppu_decoder: Interpreter (Precise)
spu_decoder: Interpreter (Precise)
clocks_scale: 100
thread_scheduler_mode: Legacy
max_spurs_threads: 4
preferred_spu_threads: 0
write_color_buffers: true
write_depth_buffer: true
strict_rendering_mode: true
accurate_spu_dma: true
accurate_spu_reservations: true
llvm_precompilation: false`;

    await db.insert(performanceProfiles).values([
      {
        name: "Turbo",
        configYaml: turboConfig,
        description: "Maximum performance for powerful devices. Pushes clock speeds and threading to the limit.",
        targetDeviceType: "flagship",
      },
      {
        name: "Balanced",
        configYaml: balancedConfig,
        description: "Optimal balance between performance and stability. Recommended for most users.",
        targetDeviceType: "midrange",
      },
      {
        name: "Compatibility",
        configYaml: compatibilityConfig,
        description: "Maximum compatibility and stability. Prioritizes reliability over raw performance.",
        targetDeviceType: "budget",
      },
    ]);

    // Seed Game Compatibility
    console.log("🎮 Seeding game compatibility data...");
    const games = [
      {
        gameTitle: "Metal Gear Solid 4",
        gameSerial: "BLUS30109",
        ppuDecoder: "LLVM",
        spuMode: "ASMJIT",
        renderingFlags: "Strict Rendering Mode, Color Buffer Writing",
        recommendedSettings: JSON.stringify({
          ppu_decoder: "LLVM",
          spu_decoder: "ASMJIT",
          write_color_buffers: true,
          strict_rendering_mode: true,
          clocks_scale: 150,
        }),
        compatibilityNotes: "Excellent compatibility. Works best with Balanced profile.",
      },
      {
        gameTitle: "The Last of Us",
        gameSerial: "BLUS31159",
        ppuDecoder: "LLVM",
        spuMode: "ASMJIT",
        renderingFlags: "Async Queue Scheduler",
        recommendedSettings: JSON.stringify({
          ppu_decoder: "LLVM",
          spu_decoder: "ASMJIT",
          asynchronous_queue_scheduler: true,
          clocks_scale: 150,
          thread_scheduler_mode: "Affinity",
        }),
        compatibilityNotes: "Great performance with Balanced profile. May require Turbo on older devices.",
      },
      {
        gameTitle: "Uncharted 3",
        gameSerial: "BLUS30841",
        ppuDecoder: "LLVM",
        spuMode: "ASMJIT",
        renderingFlags: "Async Texture Streaming",
        recommendedSettings: JSON.stringify({
          ppu_decoder: "LLVM",
          spu_decoder: "ASMJIT",
          asynchronous_texture_streaming_2: true,
          clocks_scale: 150,
        }),
        compatibilityNotes: "Runs smoothly with Balanced or Turbo profile.",
      },
      {
        gameTitle: "God of War III",
        gameSerial: "BLUS30407",
        ppuDecoder: "LLVM",
        spuMode: "ASMJIT",
        renderingFlags: "Strict Rendering, Color Buffers",
        recommendedSettings: JSON.stringify({
          ppu_decoder: "LLVM",
          spu_decoder: "ASMJIT",
          write_color_buffers: true,
          strict_rendering_mode: true,
          clocks_scale: 150,
        }),
        compatibilityNotes: "Excellent with Turbo profile. Balanced works on most devices.",
      },
      {
        gameTitle: "Grand Theft Auto V",
        gameSerial: "BLUS31272",
        ppuDecoder: "LLVM",
        spuMode: "ASMJIT",
        renderingFlags: "Async Queue, Texture Streaming",
        recommendedSettings: JSON.stringify({
          ppu_decoder: "LLVM",
          spu_decoder: "ASMJIT",
          asynchronous_queue_scheduler: true,
          asynchronous_texture_streaming_2: true,
          clocks_scale: 150,
          thread_scheduler_mode: "Affinity",
        }),
        compatibilityNotes: "Requires Turbo profile for smooth gameplay. Heavy game.",
      },
    ];

    for (const game of games) {
      await db.insert(gameCompatibility).values(game).onDuplicateKeyUpdate({
        set: game,
      });
    }

    // Seed Settings Guide
    console.log("⚙️ Seeding settings guide...");
    const settings = [
      // Core Settings
      {
        category: "Core",
        settingKey: "ppu_decoder",
        displayName: "PPU Decoder",
        description: "Determines how the PS3's PPU (main processor) instructions are translated. LLVM is faster but may have compatibility issues. Interpreter is slower but more accurate.",
        recommendedValue: "LLVM",
        recommendedValueHeavyGames: "LLVM",
        possibleValues: JSON.stringify(["LLVM", "Interpreter (Precise)"]),
      },
      {
        category: "Core",
        settingKey: "spu_decoder",
        displayName: "SPU Decoder",
        description: "Controls how SPU (sound processor) instructions are handled. ASMJIT provides good performance. Interpreter is more compatible but slower.",
        recommendedValue: "ASMJIT",
        recommendedValueHeavyGames: "ASMJIT",
        possibleValues: JSON.stringify(["ASMJIT", "Interpreter (Precise)"]),
      },
      {
        category: "Core",
        settingKey: "clocks_scale",
        displayName: "Clock Scale (%)",
        description: "Scales the emulated CPU clock speed. Higher values = faster emulation but more power usage. 100% is normal speed, 150% is 1.5x faster.",
        recommendedValue: "100",
        recommendedValueHeavyGames: "150",
        possibleValues: JSON.stringify(["50", "75", "100", "125", "150", "200"]),
      },
      {
        category: "Core",
        settingKey: "thread_scheduler_mode",
        displayName: "Thread Scheduler Mode",
        description: "Controls how threads are scheduled. Affinity binds threads to specific cores for better performance. Legacy is more compatible.",
        recommendedValue: "Affinity",
        recommendedValueHeavyGames: "Affinity",
        possibleValues: JSON.stringify(["Legacy", "Affinity"]),
      },
      {
        category: "Core",
        settingKey: "accurate_spu_dma",
        displayName: "Accurate SPU DMA",
        description: "Enables more accurate SPU Direct Memory Access emulation. Improves compatibility but may reduce performance.",
        recommendedValue: "false",
        recommendedValueHeavyGames: "true",
        possibleValues: JSON.stringify(["true", "false"]),
      },
      // Video Settings
      {
        category: "Video",
        settingKey: "write_color_buffers",
        displayName: "Write Color Buffers",
        description: "Enables writing to color buffers. Essential for proper graphics rendering. Disable only if experiencing issues.",
        recommendedValue: "true",
        recommendedValueHeavyGames: "true",
        possibleValues: JSON.stringify(["true", "false"]),
      },
      {
        category: "Video",
        settingKey: "write_depth_buffer",
        displayName: "Write Depth Buffer",
        description: "Controls depth buffer writing. Improves visual accuracy but may impact performance.",
        recommendedValue: "false",
        recommendedValueHeavyGames: "true",
        possibleValues: JSON.stringify(["true", "false"]),
      },
      {
        category: "Video",
        settingKey: "strict_rendering_mode",
        displayName: "Strict Rendering Mode",
        description: "Enforces strict rendering rules. Improves compatibility but reduces performance. Useful for games with rendering issues.",
        recommendedValue: "false",
        recommendedValueHeavyGames: "true",
        possibleValues: JSON.stringify(["true", "false"]),
      },
      {
        category: "Video",
        settingKey: "asynchronous_queue_scheduler",
        displayName: "Async Queue Scheduler",
        description: "Enables asynchronous command queue scheduling for better GPU utilization and performance.",
        recommendedValue: "true",
        recommendedValueHeavyGames: "true",
        possibleValues: JSON.stringify(["true", "false"]),
      },
      // Audio Settings
      {
        category: "Audio",
        settingKey: "audio_backend",
        displayName: "Audio Backend",
        description: "Selects the audio output system. OpenAL is recommended for most devices.",
        recommendedValue: "OpenAL",
        recommendedValueHeavyGames: "OpenAL",
        possibleValues: JSON.stringify(["OpenAL", "ALSA", "PulseAudio"]),
      },
      {
        category: "Audio",
        settingKey: "accurate_audio_timing",
        displayName: "Accurate Audio Timing",
        description: "Enables precise audio timing synchronization. Improves audio quality but may reduce performance.",
        recommendedValue: "false",
        recommendedValueHeavyGames: "true",
        possibleValues: JSON.stringify(["true", "false"]),
      },
      {
        category: "Audio",
        settingKey: "audio_buffer_size",
        displayName: "Audio Buffer Size",
        description: "Size of the audio buffer. Larger values reduce crackling but increase latency. Smaller values reduce latency but may cause audio issues.",
        recommendedValue: "256",
        recommendedValueHeavyGames: "512",
        possibleValues: JSON.stringify(["128", "256", "512", "1024"]),
      },
    ];

    for (const setting of settings) {
      await db.insert(settingsGuide).values(setting);
    }

    // Seed Emulator Versions
    console.log("📦 Seeding emulator versions...");
    const versions = [
      {
        version: "2.5.0",
        changelogText: `## HyperPS3 v2.5.0 - Ultimate Release

### New Features
- Smart Fix Bot with AI-powered diagnostics
- Game compatibility database with 1000+ optimized games
- Performance profiles (Turbo, Balanced, Compatibility)
- Settings guide with detailed explanations
- Admin dashboard for community management
- Real-time notifications for updates

### Improvements
- 40% faster boot times with optimized PPU compilation
- Better thread scheduling with affinity mode
- Improved Vulkan rendering pipeline
- Enhanced audio synchronization

### Bug Fixes
- Fixed black screen issues on certain games
- Resolved audio crackling in heavy games
- Improved stability on mid-range devices

### Performance
- Turbo profile now achieves 60fps on most AAA titles
- Balanced profile optimized for mid-range phones
- Compatibility profile works on budget devices`,
        downloadUrl: "https://github.com/hyperps3/hyperps3-android/releases/download/v2.5.0/HyperPS3_v2.5.0.apk",
        releaseDate: new Date("2026-08-04"),
        isLatest: true,
        isCritical: false,
      },
      {
        version: "2.4.5",
        changelogText: `## HyperPS3 v2.4.5 - Stability Update

### Bug Fixes
- Fixed crash on Metal Gear Solid 4
- Resolved audio sync issues
- Improved memory management

### Performance
- Optimized SPU threading
- Better cache utilization`,
        downloadUrl: "https://github.com/hyperps3/hyperps3-android/releases/download/v2.4.5/HyperPS3_v2.4.5.apk",
        releaseDate: new Date("2026-07-15"),
        isLatest: false,
        isCritical: false,
      },
      {
        version: "2.4.0",
        changelogText: `## HyperPS3 v2.4.0 - Major Performance Update

### Features
- New Vulkan rendering backend
- Improved thread scheduling
- Better game compatibility

### Performance
- 30% faster rendering
- Reduced memory usage
- Better battery efficiency`,
        downloadUrl: "https://github.com/hyperps3/hyperps3-android/releases/download/v2.4.0/HyperPS3_v2.4.0.apk",
        releaseDate: new Date("2026-06-01"),
        isLatest: false,
        isCritical: false,
      },
    ];

    for (const version of versions) {
      await db.insert(emulatorVersions).values(version).onDuplicateKeyUpdate({
        set: version,
      });
    }

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
