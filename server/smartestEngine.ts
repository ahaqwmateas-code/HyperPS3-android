/**
 * Smartest Engine - AI-Powered Optimization System
 * Learns from crash patterns and automatically applies optimal fixes
 */

import * as db from "./db";

interface OptimizationProfile {
  gameSerial: string;
  gameTitle: string;
  optimizationLevel: "aggressive" | "balanced" | "conservative";
  settings: Record<string, unknown>;
  successRate: number;
  appliedCount: number;
}

interface SpecialFeature {
  id: string;
  name: string;
  description: string;
  category: "performance" | "compatibility" | "graphics" | "audio" | "advanced";
  enabled: boolean;
  settings: Record<string, unknown>;
  gameSerials: string[];
  recommendedFor: string;
}

// Special Features Mod Library
export const SPECIAL_FEATURES: Record<string, SpecialFeature> = {
  "ultra_performance": {
    id: "ultra_performance",
    name: "Ultra Performance Mode",
    description: "Maximum performance optimization - disables advanced graphics for 60+ FPS",
    category: "performance",
    enabled: false,
    settings: {
      resolution_scale: 0.5,
      frame_skip: true,
      vsync: false,
      advanced_rendering: false,
      cpu_optimization: true,
      thread_scheduler: true,
    },
    gameSerials: ["BCES00510", "BLUS30182", "BLUS30284"],
    recommendedFor: "Budget devices, heavy games",
  },
  "enhanced_graphics": {
    id: "enhanced_graphics",
    name: "Enhanced Graphics Mode",
    description: "Improved graphics quality with better rendering and textures",
    category: "graphics",
    enabled: false,
    settings: {
      resolution_scale: 1.5,
      advanced_rendering: true,
      texture_filtering: "anisotropic_16x",
      anti_aliasing: true,
      shadow_quality: "high",
    },
    gameSerials: ["BLUS30182", "BLUS30284"],
    recommendedFor: "Flagship devices, visual games",
  },
  "audio_enhancement": {
    id: "audio_enhancement",
    name: "Audio Enhancement",
    description: "Improved audio processing with surround sound support",
    category: "audio",
    enabled: false,
    settings: {
      audio_backend: "openal",
      surround_sound: true,
      audio_threads: 4,
      audio_quality: "high",
      dts_support: true,
    },
    gameSerials: ["BCES00510", "BLUS30182", "BLUS30284"],
    recommendedFor: "All devices",
  },
  "memory_optimizer": {
    id: "memory_optimizer",
    name: "Memory Optimizer",
    description: "Advanced memory management for stable gameplay",
    category: "advanced",
    enabled: false,
    settings: {
      memory_optimization: true,
      memory_limit: 3072,
      cache_optimization: true,
      garbage_collection: "aggressive",
    },
    gameSerials: ["BCES00510", "BLUS30182"],
    recommendedFor: "Devices with 4GB+ RAM",
  },
  "cpu_turbo": {
    id: "cpu_turbo",
    name: "CPU Turbo Mode",
    description: "Enables all CPU cores for maximum performance",
    category: "performance",
    enabled: false,
    settings: {
      cpu_cores: "all",
      cpu_frequency: "max",
      cpu_optimization: true,
      ppu_optimization: true,
      spu_optimization: true,
    },
    gameSerials: ["BLUS30182", "BLUS30284"],
    recommendedFor: "Octa-core devices",
  },
  "stability_mode": {
    id: "stability_mode",
    name: "Stability Mode",
    description: "Conservative settings for maximum stability",
    category: "compatibility",
    enabled: false,
    settings: {
      spu_decoder: "asmjit",
      ppu_decoder: "llvm",
      frame_skip: false,
      cpu_optimization: false,
      advanced_rendering: false,
    },
    gameSerials: ["BCES00510"],
    recommendedFor: "All devices, problematic games",
  },
};

/**
 * Analyze game crash history and recommend optimal settings
 */
export async function analyzeGamePerformance(gameSerial: string): Promise<OptimizationProfile> {
  const crashes = await db.getCrashesForGame(gameSerial, 100);
  
  let optimizationLevel: "aggressive" | "balanced" | "conservative" = "balanced";
  let successRate = 100;
  
  if (crashes.length > 0) {
    const fixedCrashes = crashes.filter(c => c.fixedByAutoFix).length;
    successRate = Math.round((fixedCrashes / crashes.length) * 100);
    
    // Determine optimization level based on crash patterns
    if (successRate > 90) {
      optimizationLevel = "aggressive"; // Game is stable, can use aggressive settings
    } else if (successRate < 50) {
      optimizationLevel = "conservative"; // Game is unstable, use conservative settings
    }
  }

  return {
    gameSerial,
    gameTitle: gameSerial, // Would fetch from DB in production
    optimizationLevel,
    settings: getOptimalSettings(gameSerial, optimizationLevel),
    successRate,
    appliedCount: crashes.length,
  };
}

/**
 * Get optimal settings based on game and optimization level
 */
function getOptimalSettings(gameSerial: string, level: "aggressive" | "balanced" | "conservative"): Record<string, unknown> {
  const baseSettings = {
    ppu_decoder: "llvm",
    spu_decoder: "asmjit",
    vsync: true,
    frame_skip: false,
  };

  const levelSettings = {
    aggressive: {
      resolution_scale: 1.25,
      advanced_rendering: true,
      cpu_optimization: true,
      spu_optimization: true,
    },
    balanced: {
      resolution_scale: 1.0,
      advanced_rendering: false,
      cpu_optimization: true,
      spu_optimization: false,
    },
    conservative: {
      resolution_scale: 0.75,
      advanced_rendering: false,
      cpu_optimization: false,
      spu_optimization: false,
      frame_skip: true,
    },
  };

  return { ...baseSettings, ...levelSettings[level] };
}

/**
 * Get recommended special features for a game
 */
export function getRecommendedFeatures(gameSerial: string, deviceType: "budget" | "midrange" | "flagship"): SpecialFeature[] {
  const features = Object.values(SPECIAL_FEATURES);
  
  return features.filter(feature => {
    // Check if feature supports this game
    if (!feature.gameSerials.includes(gameSerial)) return false;
    
    // Recommend based on device type
    if (deviceType === "budget" && feature.category === "graphics") return false;
    if (deviceType === "budget" && feature.id === "enhanced_graphics") return false;
    
    return true;
  });
}

/**
 * Apply special feature to game settings
 */
export function applySpecialFeature(baseSettings: Record<string, unknown>, feature: SpecialFeature): Record<string, unknown> {
  return {
    ...baseSettings,
    ...feature.settings,
    specialFeatureApplied: feature.id,
  };
}

/**
 * Get all available special features
 */
export function getAllSpecialFeatures(): SpecialFeature[] {
  return Object.values(SPECIAL_FEATURES);
}

/**
 * Get special feature by ID
 */
export function getSpecialFeatureById(id: string): SpecialFeature | undefined {
  return SPECIAL_FEATURES[id];
}

/**
 * Smart recommendation engine - suggests best settings based on device and game
 */
export async function getSmartRecommendation(
  gameSerial: string,
  deviceType: "budget" | "midrange" | "flagship",
  deviceRam: number
): Promise<{
  optimizationProfile: OptimizationProfile;
  recommendedFeatures: SpecialFeature[];
  finalSettings: Record<string, unknown>;
}> {
  // Get optimization profile
  const optimizationProfile = await analyzeGamePerformance(gameSerial);
  
  // Get recommended features
  const recommendedFeatures = getRecommendedFeatures(gameSerial, deviceType);
  
  // Build final settings
  let finalSettings = { ...optimizationProfile.settings };
  
  // Apply top recommended feature if available
  if (recommendedFeatures.length > 0) {
    finalSettings = applySpecialFeature(finalSettings, recommendedFeatures[0]);
  }
  
  // Adjust for RAM
  if (deviceRam < 3000) {
    finalSettings.memory_limit = 2048;
  } else if (deviceRam >= 6000) {
    finalSettings.memory_limit = 3072;
  }
  
  return {
    optimizationProfile,
    recommendedFeatures,
    finalSettings,
  };
}
