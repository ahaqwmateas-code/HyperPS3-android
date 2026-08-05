/**
 * App Configuration Service
 * Provides all settings and configurations needed by the HyperPS3 Android app
 */

export interface AppConfig {
  version: string;
  buildNumber: number;
  apiUrl: string;
  features: {
    crashDetection: boolean;
    autoOptimization: boolean;
    smartEngine: boolean;
    specialFeatures: boolean;
  };
  defaultSettings: {
    ppuDecoder: string;
    spuDecoder: string;
    resolution: number;
    vsync: boolean;
    frameSkip: boolean;
    cpuOptimization: boolean;
    spuOptimization: boolean;
    audioBackend: string;
  };
  gameProfiles: Record<string, GameProfile>;
  specialFeatures: SpecialFeatureConfig[];
  performanceProfiles: PerformanceProfile[];
}

export interface GameProfile {
  serial: string;
  title: string;
  recommendedSettings: Record<string, unknown>;
  compatibilityLevel: "excellent" | "good" | "playable" | "experimental";
  fps: number;
  notes: string;
}

export interface SpecialFeatureConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  settings: Record<string, unknown>;
}

export interface PerformanceProfile {
  name: string;
  level: "ultra" | "high" | "balanced" | "low" | "minimum";
  settings: Record<string, unknown>;
  targetFps: number;
  minRam: number;
}

/**
 * Get complete app configuration
 */
export function getAppConfig(): AppConfig {
  return {
    version: "2.42.0",
    buildNumber: 242,
    apiUrl: process.env.VITE_FRONTEND_FORGE_API_URL || "https://api.manus.im",
    features: {
      crashDetection: true,
      autoOptimization: true,
      smartEngine: true,
      specialFeatures: true,
    },
    defaultSettings: {
      ppuDecoder: "llvm",
      spuDecoder: "asmjit",
      resolution: 1.0,
      vsync: true,
      frameSkip: false,
      cpuOptimization: true,
      spuOptimization: false,
      audioBackend: "openal",
    },
    gameProfiles: {
      "BCES00510": {
        serial: "BCES00510",
        title: "Demon's Souls",
        recommendedSettings: {
          ppuDecoder: "llvm",
          spuDecoder: "asmjit",
          spuOptimization: false,
          resolution: 0.9,
          frameSkip: false,
          cpuOptimization: true,
        },
        compatibilityLevel: "excellent",
        fps: 30,
        notes: "Excellent compatibility with Smartest Engine optimization",
      },
      "BLUS30182": {
        serial: "BLUS30182",
        title: "God of War III",
        recommendedSettings: {
          ppuDecoder: "llvm",
          spuDecoder: "asmjit",
          cpuOptimization: true,
          resolution: 1.0,
          vsync: true,
          frameSkip: false,
        },
        compatibilityLevel: "excellent",
        fps: 30,
        notes: "Perfect performance with CPU Turbo feature",
      },
      "BLUS30284": {
        serial: "BLUS30284",
        title: "Persona 5",
        recommendedSettings: {
          ppuDecoder: "llvm",
          spuDecoder: "asmjit",
          audioBackend: "openal",
          resolution: 1.0,
          cpuOptimization: true,
          spuOptimization: false,
        },
        compatibilityLevel: "excellent",
        fps: 30,
        notes: "Stable with Audio Enhancement feature",
      },
    },
    specialFeatures: [
      {
        id: "ultra_performance",
        name: "Ultra Performance Mode",
        description: "Maximum performance - 60+ FPS",
        category: "performance",
        settings: {
          resolution: 0.5,
          frameSkip: true,
          vsync: false,
          cpuOptimization: true,
          spuOptimization: true,
        },
      },
      {
        id: "enhanced_graphics",
        name: "Enhanced Graphics Mode",
        description: "Improved graphics quality",
        category: "graphics",
        settings: {
          resolution: 1.5,
          advancedRendering: true,
          textureFiltering: "anisotropic_16x",
          antiAliasing: true,
        },
      },
      {
        id: "audio_enhancement",
        name: "Audio Enhancement",
        description: "Surround sound support",
        category: "audio",
        settings: {
          audioBackend: "openal",
          surroundSound: true,
          audioThreads: 4,
          dtsSupport: true,
        },
      },
      {
        id: "memory_optimizer",
        name: "Memory Optimizer",
        description: "Advanced memory management",
        category: "advanced",
        settings: {
          memoryOptimization: true,
          cacheOptimization: true,
          garbageCollection: "aggressive",
        },
      },
      {
        id: "cpu_turbo",
        name: "CPU Turbo Mode",
        description: "All CPU cores enabled",
        category: "performance",
        settings: {
          cpuCores: "all",
          cpuFrequency: "max",
          cpuOptimization: true,
          ppuOptimization: true,
          spuOptimization: true,
        },
      },
      {
        id: "stability_mode",
        name: "Stability Mode",
        description: "Conservative settings",
        category: "compatibility",
        settings: {
          ppuDecoder: "llvm",
          spuDecoder: "asmjit",
          frameSkip: false,
          cpuOptimization: false,
          advancedRendering: false,
        },
      },
    ],
    performanceProfiles: [
      {
        name: "Ultra",
        level: "ultra",
        settings: {
          resolution: 1.5,
          advancedRendering: true,
          antiAliasing: true,
          shadowQuality: "ultra",
        },
        targetFps: 60,
        minRam: 8000,
      },
      {
        name: "High",
        level: "high",
        settings: {
          resolution: 1.2,
          advancedRendering: true,
          antiAliasing: true,
          shadowQuality: "high",
        },
        targetFps: 45,
        minRam: 6000,
      },
      {
        name: "Balanced",
        level: "balanced",
        settings: {
          resolution: 1.0,
          advancedRendering: false,
          antiAliasing: false,
          shadowQuality: "medium",
        },
        targetFps: 30,
        minRam: 4000,
      },
      {
        name: "Low",
        level: "low",
        settings: {
          resolution: 0.75,
          advancedRendering: false,
          antiAliasing: false,
          shadowQuality: "low",
        },
        targetFps: 25,
        minRam: 2500,
      },
      {
        name: "Minimum",
        level: "minimum",
        settings: {
          resolution: 0.5,
          advancedRendering: false,
          frameSkip: true,
          shadowQuality: "off",
        },
        targetFps: 20,
        minRam: 2000,
      },
    ],
  };
}

/**
 * Get optimized settings for a specific game
 */
export function getGameOptimizedSettings(gameSerial: string): Record<string, unknown> {
  const config = getAppConfig();
  const gameProfile = config.gameProfiles[gameSerial];
  
  if (gameProfile) {
    return gameProfile.recommendedSettings;
  }
  
  return config.defaultSettings;
}

/**
 * Get performance profile by level
 */
export function getPerformanceProfile(level: string): PerformanceProfile | undefined {
  const config = getAppConfig();
  return config.performanceProfiles.find(p => p.level === level);
}

/**
 * Get all special features
 */
export function getAllSpecialFeatures(): SpecialFeatureConfig[] {
  const config = getAppConfig();
  return config.specialFeatures;
}

/**
 * Get special feature by ID
 */
export function getSpecialFeatureById(id: string): SpecialFeatureConfig | undefined {
  const config = getAppConfig();
  return config.specialFeatures.find(f => f.id === id);
}
