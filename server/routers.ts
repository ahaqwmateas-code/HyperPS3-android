import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Bug Reports
  bugReports: router({
    submit: protectedProcedure
      .input(z.object({
        gameSerial: z.string().min(1),
        deviceInfo: z.string().min(1),
        issueDescription: z.string().min(10),
      }))
      .mutation(async ({ input, ctx }) => {
        const report = await db.submitBugReport({
          userId: ctx.user.id,
          gameSerial: input.gameSerial.toUpperCase(),
          deviceInfo: input.deviceInfo,
          issueDescription: input.issueDescription,
          status: 'open',
        });
        return report;
      }),

    list: adminProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getBugReports(input.limit, input.offset);
      }),

    myReports: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
      }))
      .query(async ({ input, ctx }) => {
        return db.getUserBugReports(ctx.user.id, input.limit);
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['open', 'investigating', 'fixed', 'closed']),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateBugReportStatus(input.id, input.status, input.adminNotes);
        return { success: true };
      }),
  }),

  // Game Compatibility
  gameCompatibility: router({
    search: publicProcedure
      .input(z.object({
        query: z.string().min(1),
      }))
      .query(async ({ input }) => {
        return db.searchGameCompatibility(input.query);
      }),

    getBySerial: publicProcedure
      .input(z.object({
        serial: z.string().min(1),
      }))
      .query(async ({ input }) => {
        return db.getGameCompatibilityBySerial(input.serial);
      }),

    upsert: adminProcedure
      .input(z.object({
        gameTitle: z.string(),
        gameSerial: z.string(),
        ppuDecoder: z.string().optional(),
        spuMode: z.string().optional(),
        renderingFlags: z.string().optional(),
        recommendedSettings: z.string().optional(),
        compatibilityNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertGameCompatibility({
          gameTitle: input.gameTitle,
          gameSerial: input.gameSerial.toUpperCase(),
          ppuDecoder: input.ppuDecoder,
          spuMode: input.spuMode,
          renderingFlags: input.renderingFlags,
          recommendedSettings: input.recommendedSettings,
          compatibilityNotes: input.compatibilityNotes,
        });
        return { success: true };
      }),
  }),

  // Performance Profiles
  performanceProfiles: router({
    list: publicProcedure.query(async () => {
      return db.getPerformanceProfiles();
    }),

    getByName: publicProcedure
      .input(z.object({
        name: z.enum(['Turbo', 'Balanced', 'Compatibility']),
      }))
      .query(async ({ input }) => {
        return db.getPerformanceProfileByName(input.name);
      }),

    download: publicProcedure
      .input(z.object({
        name: z.enum(['Turbo', 'Balanced', 'Compatibility']),
      }))
      .query(async ({ input }) => {
        const profile = await db.getPerformanceProfileByName(input.name);
        if (!profile) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
        }
        return {
          filename: 'config.yml',
          content: profile.configYaml,
        };
      }),
  }),

  // Emulator Versions
  emulatorVersions: router({
    latest: publicProcedure.query(async () => {
      return db.getLatestEmulatorVersion();
    }),

    list: publicProcedure
      .input(z.object({
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        return db.getEmulatorVersions(input.limit);
      }),

    create: adminProcedure
      .input(z.object({
        version: z.string(),
        changelogText: z.string(),
        downloadUrl: z.string().url(),
        releaseDate: z.date(),
        isCritical: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        await db.createEmulatorVersion({
          version: input.version,
          changelogText: input.changelogText,
          downloadUrl: input.downloadUrl,
          releaseDate: input.releaseDate,
          isLatest: true,
          isCritical: input.isCritical,
        });
        return { success: true };
      }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
      }))
      .query(async ({ input, ctx }) => {
        return db.getUserNotifications(ctx.user.id, input.limit);
      }),

    markAsRead: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
  }),

  // Settings Guide
  settingsGuide: router({
    listByCategory: publicProcedure
      .input(z.object({
        category: z.enum(['Core', 'Video', 'Audio']),
      }))
      .query(async ({ input }) => {
        return db.getSettingsGuideByCategory(input.category);
      }),

    listAll: publicProcedure.query(async () => {
      return db.getAllSettingsGuide();
    }),
  }),

  // Crash Detection & Auto-Fix
  crashes: router({
    report: publicProcedure
      .input(z.object({
        gameSerial: z.string().min(1),
        gameTitle: z.string().optional(),
        deviceInfo: z.string().optional(),
        crashType: z.enum(['boot_crash', 'gameplay_crash', 'audio_crash', 'rendering_crash']),
        errorMessage: z.string().optional(),
        stackTrace: z.string().optional(),
        emulatorVersion: z.string().optional(),
        performanceProfile: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Report the crash
        const crash = await db.reportCrash({
          userId: ctx.user?.id,
          gameSerial: input.gameSerial.toUpperCase(),
          gameTitle: input.gameTitle,
          deviceInfo: input.deviceInfo,
          crashType: input.crashType,
          errorMessage: input.errorMessage,
          stackTrace: input.stackTrace,
          emulatorVersion: input.emulatorVersion,
          performanceProfile: input.performanceProfile,
        });

        // Get auto-fix profiles for this game and crash type
        const fixes = await db.getAutoFixProfilesForGame(input.gameSerial.toUpperCase(), input.crashType);
        
        return {
          crashId: crash.id,
          autoFixesAvailable: fixes.length > 0,
          suggestedFixes: fixes.slice(0, 3), // Top 3 fixes
        };
      }),

    getRecentCrashes: adminProcedure
      .input(z.object({
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return db.getRecentCrashes(input.limit);
      }),

    getCrashesForGame: publicProcedure
      .input(z.object({
        gameSerial: z.string().min(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return db.getCrashesForGame(input.gameSerial.toUpperCase(), input.limit);
      }),

    applyFix: publicProcedure
      .input(z.object({
        crashLogId: z.number(),
        fixProfileId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Mark crash as having auto-fix applied
        await db.markCrashAsFixed(input.crashLogId, true);
        // Update fix stats
        await db.updateAutoFixStats(input.fixProfileId, true, false);
        return { success: true };
      }),

    reportFixSuccess: publicProcedure
      .input(z.object({
        crashLogId: z.number(),
        fixProfileId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Mark crash as fixed
        await db.markCrashAsFixed(input.crashLogId, true);
        // Update fix stats with success
        await db.updateAutoFixStats(input.fixProfileId, true, true);
        return { success: true };
      }),
  }),

  // Smartest Engine & Special Features
  smartEngine: router({
    analyzeGame: publicProcedure
      .input(z.object({
        gameSerial: z.string().min(1),
        deviceType: z.enum(['budget', 'midrange', 'flagship']),
        deviceRam: z.number().default(4096),
      }))
      .query(async ({ input }) => {
        const { getSmartRecommendation } = await import('./smartestEngine');
        return getSmartRecommendation(input.gameSerial, input.deviceType, input.deviceRam);
      }),

    getSpecialFeatures: publicProcedure
      .input(z.object({
        gameSerial: z.string().optional(),
      }))
      .query(async () => {
        const { getAllSpecialFeatures } = await import('./smartestEngine');
        return getAllSpecialFeatures();
      }),

    getFeatureById: publicProcedure
      .input(z.object({
        featureId: z.string(),
      }))
      .query(async ({ input }) => {
        const { getSpecialFeatureById } = await import('./smartestEngine');
        return getSpecialFeatureById(input.featureId);
      }),

    applyFeature: publicProcedure
      .input(z.object({
        gameSerial: z.string(),
        featureId: z.string(),
      }))
      .mutation(async ({ input }) => {
        // In production, this would save to user's settings
        return {
          success: true,
          message: `Applied ${input.featureId} to ${input.gameSerial}`,
        };
      }),
  }),

  // Crash Fix Profiles & Special Mods
  crashFixes: router({
    getCrashFixForGame: publicProcedure
      .input(z.object({
        gameSerial: z.string(),
        crashType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getCrashFixProfile, getGameCrashFixes } = await import('./crashFixProfiles');
        if (input.crashType) {
          return getCrashFixProfile(input.gameSerial, input.crashType);
        }
        return getGameCrashFixes(input.gameSerial);
      }),

    getSpecialMods: publicProcedure
      .input(z.object({
        gameSerial: z.string(),
      }))
      .query(async ({ input }) => {
        const { getGameMods } = await import('./crashFixProfiles');
        return getGameMods(input.gameSerial);
      }),

    getRecommendedMods: publicProcedure
      .input(z.object({
        gameSerial: z.string(),
        deviceType: z.enum(['budget', 'midrange', 'flagship']),
      }))
      .query(async ({ input }) => {
        const { getRecommendedMods } = await import('./crashFixProfiles');
        return getRecommendedMods(input.gameSerial, input.deviceType);
      }),

    getOptimalSettings: publicProcedure
      .input(z.object({
        gameSerial: z.string(),
        appliedMods: z.array(z.string()).optional(),
      }))
      .query(async ({ input }) => {
        const { getOptimalGameSettings } = await import('./crashFixProfiles');
        return getOptimalGameSettings(input.gameSerial, input.appliedMods);
      }),
  }),

  // Auto-Update System
  autoUpdate: router({
    checkForUpdates: publicProcedure
      .query(async () => {
        const { checkForAllUpdates } = await import('./autoUpdateService');
        return checkForAllUpdates();
      }),

    getLatestAppVersion: publicProcedure
      .query(async () => {
        const { getLatestAppUpdate } = await import('./autoUpdateService');
        return getLatestAppUpdate();
      }),

    getPendingCrashFixes: publicProcedure
      .query(async () => {
        const { getPendingCrashFixUpdates } = await import('./autoUpdateService');
        return getPendingCrashFixUpdates();
      }),

    getPendingMods: publicProcedure
      .query(async () => {
        const { getPendingModUpdates } = await import('./autoUpdateService');
        return getPendingModUpdates();
      }),

    markUpdateInstalled: publicProcedure
      .input(z.object({ version: z.string() }))
      .mutation(async ({ input }) => {
        const { markUpdateAsInstalled } = await import('./autoUpdateService');
        return markUpdateAsInstalled(input.version);
      }),

    applyCrashFix: publicProcedure
      .input(z.object({ fixId: z.string() }))
      .mutation(async ({ input }) => {
        const { markCrashFixAsApplied } = await import('./autoUpdateService');
        return markCrashFixAsApplied(input.fixId);
      }),

    enableMod: publicProcedure
      .input(z.object({ modId: z.string() }))
      .mutation(async ({ input }) => {
        const { markModAsEnabled } = await import('./autoUpdateService');
        return markModAsEnabled(input.modId);
      }),

    getUpdateStatistics: publicProcedure
      .query(async () => {
        const { getUpdateStatistics } = await import('./autoUpdateService');
        return getUpdateStatistics();
      }),
  }),

  // App Configuration
  appConfig: router({
    getConfig: publicProcedure
      .query(async () => {
        const { getAppConfig } = await import('./appConfigService');
        return getAppConfig();
      }),

    getGameSettings: publicProcedure
      .input(z.object({
        gameSerial: z.string(),
      }))
      .query(async ({ input }) => {
        const { getGameOptimizedSettings } = await import('./appConfigService');
        return getGameOptimizedSettings(input.gameSerial);
      }),

    getPerformanceProfile: publicProcedure
      .input(z.object({
        level: z.string(),
      }))
      .query(async ({ input }) => {
        const { getPerformanceProfile } = await import('./appConfigService');
        return getPerformanceProfile(input.level);
      }),

    getSpecialFeatures: publicProcedure
      .query(async () => {
        const { getAllSpecialFeatures } = await import('./appConfigService');
        return getAllSpecialFeatures();
      }),
  }),

  // Chat
  chat: router({
    createSession: publicProcedure
      .input(z.object({
        topic: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const sessionId = nanoid();
        await db.createChatSession({
          userId: ctx.user?.id,
          sessionId,
          topic: input.topic,
        });
        return { sessionId };
      }),

    sendMessage: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        // Store user message
        await db.addChatMessage({
          sessionId: input.sessionId,
          role: 'user',
          content: input.message,
        });
        return { success: true };
      }),

    getMessages: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return db.getChatMessages(input.sessionId, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
