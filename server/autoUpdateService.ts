/**
 * Auto-Update Service
 * Handles automatic crash detection, analysis, and fix application
 */

import * as db from "./db";
import { InsertAutoFixProfile } from "../drizzle/schema";

// Pre-defined auto-fix profiles for common crash patterns
const COMMON_AUTO_FIXES: Record<string, InsertAutoFixProfile[]> = {
  "BCES00510": [ // Demon's Souls
    {
      gameSerial: "BCES00510",
      gameTitle: "Demon's Souls",
      triggerCrashType: "boot_crash",
      fixName: "Disable SPU Optimization",
      recommendedSettings: JSON.stringify({
        spu_decoder: "asmjit",
        spu_optimization: false,
        spu_threads: 2,
      }),
      priority: 1,
    },
    {
      gameSerial: "BCES00510",
      gameTitle: "Demon's Souls",
      triggerCrashType: "gameplay_crash",
      fixName: "Lower PPU Decoder Quality",
      recommendedSettings: JSON.stringify({
        ppu_decoder: "llvm",
        ppu_optimization: false,
        frame_skip: true,
      }),
      priority: 2,
    },
    {
      gameSerial: "BCES00510",
      gameTitle: "Demon's Souls",
      triggerCrashType: "rendering_crash",
      fixName: "Reduce Resolution & Disable Advanced Rendering",
      recommendedSettings: JSON.stringify({
        resolution_scale: 0.75,
        advanced_rendering: false,
        vsync: false,
      }),
      priority: 1,
    },
  ],
};

/**
 * Initialize auto-fix profiles for a game
 */
export async function initializeAutoFixesForGame(gameSerial: string) {
  const fixes = COMMON_AUTO_FIXES[gameSerial];
  if (!fixes) return;

  for (const fix of fixes) {
    try {
      await db.createAutoFixProfile(fix);
    } catch (error) {
      console.error(`Failed to create auto-fix for ${gameSerial}:`, error);
    }
  }
}

/**
 * Analyze crash pattern and suggest fixes
 */
export async function analyzeCrashPattern(gameSerial: string, crashType: string) {
  const crashes = await db.getCrashesForGame(gameSerial);
  
  // If we see 3+ crashes of the same type in last 10 minutes, it's a pattern
  const recentCrashes = crashes.filter(c => {
    const timeDiff = Date.now() - new Date(c.createdAt).getTime();
    return timeDiff < 10 * 60 * 1000 && c.crashType === crashType;
  });

  if (recentCrashes.length >= 3) {
    // Get auto-fix profiles
    const fixes = await db.getAutoFixProfilesForGame(gameSerial, crashType);
    return {
      isCrashPattern: true,
      crashCount: recentCrashes.length,
      suggestedFixes: fixes,
    };
  }

  return {
    isCrashPattern: false,
    crashCount: recentCrashes.length,
    suggestedFixes: [],
  };
}

/**
 * Auto-apply the best fix for a crash
 */
export async function autoApplyBestFix(gameSerial: string, crashType: string) {
  const fixes = await db.getAutoFixProfilesForGame(gameSerial, crashType);
  
  if (fixes.length === 0) {
    return null;
  }

  // Return the highest priority fix (lowest priority number = highest priority)
  return fixes[0];
}

/**
 * Get crash statistics for a game
 */
export async function getCrashStats(gameSerial: string) {
  const crashes = await db.getCrashesForGame(gameSerial, 100);
  
  const stats = {
    totalCrashes: crashes.length,
    fixedCrashes: crashes.filter(c => c.fixedByAutoFix).length,
    crashTypes: {} as Record<string, number>,
    successRate: 0,
  };

  crashes.forEach(crash => {
    stats.crashTypes[crash.crashType] = (stats.crashTypes[crash.crashType] || 0) + 1;
  });

  if (stats.totalCrashes > 0) {
    stats.successRate = Math.round((stats.fixedCrashes / stats.totalCrashes) * 100);
  }

  return stats;
}

/**
 * Initialize all common auto-fixes on startup
 */
export async function initializeAllAutoFixes() {
  const commonGames = ["BCES00510", "BLUS30182", "BLUS30284"]; // Demon's Souls, God of War III, Persona 5
  
  for (const gameSerial of commonGames) {
    try {
      await initializeAutoFixesForGame(gameSerial);
    } catch (error) {
      console.error(`Failed to initialize auto-fixes for ${gameSerial}:`, error);
    }
  }
}
