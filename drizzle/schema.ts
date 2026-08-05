import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  deviceInfo: text("deviceInfo"), // Store device info for compatibility tracking
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Bug reports submitted by users
 */
export const bugReports = mysqlTable("bugReports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameSerial: varchar("gameSerial", { length: 64 }).notNull(),
  deviceInfo: text("deviceInfo").notNull(),
  issueDescription: text("issueDescription").notNull(),
  status: mysqlEnum("status", ["open", "investigating", "fixed", "closed"]).default("open").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BugReport = typeof bugReports.$inferSelect;
export type InsertBugReport = typeof bugReports.$inferInsert;

/**
 * Game compatibility database with recommended settings
 */
export const gameCompatibility = mysqlTable("gameCompatibility", {
  id: int("id").autoincrement().primaryKey(),
  gameTitle: varchar("gameTitle", { length: 256 }).notNull(),
  gameSerial: varchar("gameSerial", { length: 64 }).notNull().unique(),
  ppuDecoder: varchar("ppuDecoder", { length: 128 }),
  spuMode: varchar("spuMode", { length: 128 }),
  renderingFlags: text("renderingFlags"), // JSON string of rendering settings
  recommendedSettings: text("recommendedSettings"), // JSON string of all recommended settings
  compatibilityNotes: text("compatibilityNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GameCompatibility = typeof gameCompatibility.$inferSelect;
export type InsertGameCompatibility = typeof gameCompatibility.$inferInsert;

/**
 * Pre-built performance profiles for download
 */
export const performanceProfiles = mysqlTable("performanceProfiles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(), // "Turbo", "Balanced", "Compatibility"
  configYaml: text("configYaml").notNull(), // Full config.yml content
  description: text("description"),
  targetDeviceType: varchar("targetDeviceType", { length: 128 }), // e.g., "flagship", "midrange", "budget"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerformanceProfile = typeof performanceProfiles.$inferSelect;
export type InsertPerformanceProfile = typeof performanceProfiles.$inferInsert;

/**
 * Emulator version tracking and changelog
 */
export const emulatorVersions = mysqlTable("emulatorVersions", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 64 }).notNull().unique(), // e.g., "2.5.0"
  changelogText: text("changelogText").notNull(),
  downloadUrl: varchar("downloadUrl", { length: 512 }).notNull(),
  releaseDate: timestamp("releaseDate").notNull(),
  isLatest: boolean("isLatest").default(false).notNull(),
  isCritical: boolean("isCritical").default(false).notNull(), // Flag for critical security/stability fixes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmulatorVersion = typeof emulatorVersions.$inferSelect;
export type InsertEmulatorVersion = typeof emulatorVersions.$inferInsert;

/**
 * In-app and email notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["version_update", "bug_fixed", "feature_release", "critical_alert"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  relatedVersionId: int("relatedVersionId"), // Link to emulatorVersions if applicable
  isRead: boolean("isRead").default(false).notNull(),
  emailSent: boolean("emailSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Settings guide entries for the documentation page
 */
export const settingsGuide = mysqlTable("settingsGuide", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 128 }).notNull(), // "Core", "Video", "Audio"
  settingKey: varchar("settingKey", { length: 256 }).notNull(),
  displayName: varchar("displayName", { length: 256 }).notNull(),
  description: text("description").notNull(),
  recommendedValue: varchar("recommendedValue", { length: 256 }),
  recommendedValueHeavyGames: varchar("recommendedValueHeavyGames", { length: 256 }),
  possibleValues: text("possibleValues"), // JSON array of possible values
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SettingsGuide = typeof settingsGuide.$inferSelect;
export type InsertSettingsGuide = typeof settingsGuide.$inferInsert;

/**
 * Chat conversation history for the LLM assistant
 */
export const chatSessions = mysqlTable("chatSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 128 }).notNull().unique(),
  topic: varchar("topic", { length: 256 }), // e.g., "game_compatibility", "boot_issue", "general"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

/**
 * Chat messages within sessions
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  configRecommendation: text("configRecommendation"), // JSON of recommended config if assistant provided one
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Crash logs for detecting game crashes and patterns
 */
export const crashLogs = mysqlTable("crashLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  gameSerial: varchar("gameSerial", { length: 64 }).notNull(),
  gameTitle: varchar("gameTitle", { length: 256 }),
  deviceInfo: text("deviceInfo"),
  crashType: varchar("crashType", { length: 128 }).notNull(), // "boot_crash", "gameplay_crash", "audio_crash", "rendering_crash"
  errorMessage: text("errorMessage"),
  stackTrace: text("stackTrace"),
  emulatorVersion: varchar("emulatorVersion", { length: 64 }),
  performanceProfile: varchar("performanceProfile", { length: 128 }), // Which profile was active
  autoFixApplied: boolean("autoFixApplied").default(false).notNull(),
  fixedByAutoFix: boolean("fixedByAutoFix").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CrashLog = typeof crashLogs.$inferSelect;
export type InsertCrashLog = typeof crashLogs.$inferInsert;

/**
 * Auto-fix profiles that are applied when crashes are detected
 */
export const autoFixProfiles = mysqlTable("autoFixProfiles", {
  id: int("id").autoincrement().primaryKey(),
  gameSerial: varchar("gameSerial", { length: 64 }).notNull(),
  gameTitle: varchar("gameTitle", { length: 256 }),
  triggerCrashType: varchar("triggerCrashType", { length: 128 }).notNull(), // The crash type that triggers this fix
  fixName: varchar("fixName", { length: 256 }).notNull(), // e.g., "Disable SPU Optimization", "Lower PPU Decoder"
  recommendedSettings: text("recommendedSettings").notNull(), // JSON of settings to apply
  successRate: int("successRate").default(0).notNull(), // Percentage of times this fix worked (0-100)
  appliedCount: int("appliedCount").default(0).notNull(), // How many times this fix was applied
  successCount: int("successCount").default(0).notNull(), // How many times it actually fixed the crash
  priority: int("priority").default(1).notNull(), // 1=highest priority, lower number = try first
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutoFixProfile = typeof autoFixProfiles.$inferSelect;
export type InsertAutoFixProfile = typeof autoFixProfiles.$inferInsert;
