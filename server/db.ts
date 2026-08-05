import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  bugReports, InsertBugReport, BugReport,
  gameCompatibility, InsertGameCompatibility, GameCompatibility,
  performanceProfiles, InsertPerformanceProfile, PerformanceProfile,
  emulatorVersions, InsertEmulatorVersion, EmulatorVersion,
  notifications, InsertNotification, Notification,
  settingsGuide, InsertSettingsGuide, SettingsGuide,
  chatSessions, InsertChatSession, ChatSession,
  chatMessages, InsertChatMessage, ChatMessage,
  crashLogs, InsertCrashLog, CrashLog,
  autoFixProfiles, InsertAutoFixProfile, AutoFixProfile
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "deviceInfo"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Bug Reports
export async function submitBugReport(report: InsertBugReport): Promise<BugReport> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bugReports).values(report);
  const id = result[0].insertId;
  const created = await db.select().from(bugReports).where(eq(bugReports.id, id as number)).limit(1);
  return created[0];
}

export async function getBugReports(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(bugReports).orderBy(desc(bugReports.createdAt)).limit(limit).offset(offset);
}

export async function getUserBugReports(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(bugReports).where(eq(bugReports.userId, userId)).orderBy(desc(bugReports.createdAt)).limit(limit);
}

export async function updateBugReportStatus(id: number, status: string, adminNotes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = { status };
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  
  await db.update(bugReports).set(updateData).where(eq(bugReports.id, id));
}

// Game Compatibility
export async function searchGameCompatibility(query: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Simple search by title or serial
  const results = await db.select().from(gameCompatibility)
    .where(
      query.length === 4 
        ? eq(gameCompatibility.gameSerial, query.toUpperCase())
        : undefined
    );
  
  return results;
}

export async function getGameCompatibilityBySerial(serial: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(gameCompatibility)
    .where(eq(gameCompatibility.gameSerial, serial.toUpperCase()))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function upsertGameCompatibility(game: InsertGameCompatibility) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(gameCompatibility).values(game).onDuplicateKeyUpdate({
    set: {
      ppuDecoder: game.ppuDecoder,
      spuMode: game.spuMode,
      renderingFlags: game.renderingFlags,
      recommendedSettings: game.recommendedSettings,
      compatibilityNotes: game.compatibilityNotes,
    }
  });
}

// Performance Profiles
export async function getPerformanceProfiles() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(performanceProfiles).orderBy(performanceProfiles.name);
}

export async function getPerformanceProfileByName(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(performanceProfiles)
    .where(eq(performanceProfiles.name, name))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

// Emulator Versions
export async function getLatestEmulatorVersion() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(emulatorVersions)
    .where(eq(emulatorVersions.isLatest, true))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getEmulatorVersions(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(emulatorVersions)
    .orderBy(desc(emulatorVersions.releaseDate))
    .limit(limit);
}

export async function createEmulatorVersion(version: InsertEmulatorVersion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Mark all others as not latest if this one is latest
  if (version.isLatest) {
    await db.update(emulatorVersions).set({ isLatest: false });
  }
  
  await db.insert(emulatorVersions).values(version);
}

// Notifications
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(notifications).values(notification);
}

export async function getUserNotifications(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

// Settings Guide
export async function getSettingsGuideByCategory(category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(settingsGuide)
    .where(eq(settingsGuide.category, category))
    .orderBy(settingsGuide.settingKey);
}

export async function getAllSettingsGuide() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(settingsGuide)
    .orderBy(settingsGuide.category, settingsGuide.settingKey);
}

// Chat Sessions & Messages
export async function createChatSession(session: InsertChatSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(chatSessions).values(session);
}

export async function getChatSession(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(chatSessions)
    .where(eq(chatSessions.sessionId, sessionId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function addChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(chatMessages).values(message);
}

export async function getChatMessages(sessionId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt)
    .limit(limit);
}


// Crash Logs & Auto-Fix
export async function reportCrash(crash: InsertCrashLog): Promise<CrashLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(crashLogs).values(crash);
  const id = result[0].insertId;
  const created = await db.select().from(crashLogs).where(eq(crashLogs.id, id as number)).limit(1);
  return created[0];
}

export async function getCrashesForGame(gameSerial: string, limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(crashLogs)
    .where(eq(crashLogs.gameSerial, gameSerial))
    .orderBy(desc(crashLogs.createdAt))
    .limit(limit);
}

export async function getRecentCrashes(limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(crashLogs)
    .orderBy(desc(crashLogs.createdAt))
    .limit(limit);
}

export async function createAutoFixProfile(profile: InsertAutoFixProfile): Promise<AutoFixProfile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(autoFixProfiles).values(profile);
  const id = result[0].insertId;
  const created = await db.select().from(autoFixProfiles).where(eq(autoFixProfiles.id, id as number)).limit(1);
  return created[0];
}

export async function getAutoFixProfilesForGame(gameSerial: string, crashType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(autoFixProfiles)
    .where(
      and(
        eq(autoFixProfiles.gameSerial, gameSerial),
        eq(autoFixProfiles.triggerCrashType, crashType)
      )
    )
    .orderBy(autoFixProfiles.priority);
}

export async function updateAutoFixStats(id: number, applied: boolean, success: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updates: Record<string, unknown> = {
    appliedCount: (await db.select().from(autoFixProfiles).where(eq(autoFixProfiles.id, id)).limit(1))[0]?.appliedCount || 0 + 1
  };
  
  if (success) {
    updates.successCount = (await db.select().from(autoFixProfiles).where(eq(autoFixProfiles.id, id)).limit(1))[0]?.successCount || 0 + 1;
    updates.successRate = Math.round(((updates.successCount as number) / (updates.appliedCount as number)) * 100);
  }
  
  await db.update(autoFixProfiles).set(updates).where(eq(autoFixProfiles.id, id));
}

export async function markCrashAsFixed(crashLogId: number, fixedByAutoFix: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(crashLogs).set({
    fixedByAutoFix,
    autoFixApplied: true
  }).where(eq(crashLogs.id, crashLogId));
}
