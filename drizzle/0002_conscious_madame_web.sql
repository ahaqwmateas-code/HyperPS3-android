CREATE TABLE `autoFixProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameSerial` varchar(64) NOT NULL,
	`gameTitle` varchar(256),
	`triggerCrashType` varchar(128) NOT NULL,
	`fixName` varchar(256) NOT NULL,
	`recommendedSettings` text NOT NULL,
	`successRate` int NOT NULL DEFAULT 0,
	`appliedCount` int NOT NULL DEFAULT 0,
	`successCount` int NOT NULL DEFAULT 0,
	`priority` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autoFixProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crashLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`gameSerial` varchar(64) NOT NULL,
	`gameTitle` varchar(256),
	`deviceInfo` text,
	`crashType` varchar(128) NOT NULL,
	`errorMessage` text,
	`stackTrace` text,
	`emulatorVersion` varchar(64),
	`performanceProfile` varchar(128),
	`autoFixApplied` boolean NOT NULL DEFAULT false,
	`fixedByAutoFix` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crashLogs_id` PRIMARY KEY(`id`)
);
