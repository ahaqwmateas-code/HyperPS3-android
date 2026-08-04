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
