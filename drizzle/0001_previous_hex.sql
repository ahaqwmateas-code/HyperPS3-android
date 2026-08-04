CREATE TABLE `bugReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameSerial` varchar(64) NOT NULL,
	`deviceInfo` text NOT NULL,
	`issueDescription` text NOT NULL,
	`status` enum('open','investigating','fixed','closed') NOT NULL DEFAULT 'open',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bugReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`configRecommendation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(128) NOT NULL,
	`topic` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `chatSessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `emulatorVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(64) NOT NULL,
	`changelogText` text NOT NULL,
	`downloadUrl` varchar(512) NOT NULL,
	`releaseDate` timestamp NOT NULL,
	`isLatest` boolean NOT NULL DEFAULT false,
	`isCritical` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emulatorVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `emulatorVersions_version_unique` UNIQUE(`version`)
);
--> statement-breakpoint
CREATE TABLE `gameCompatibility` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameTitle` varchar(256) NOT NULL,
	`gameSerial` varchar(64) NOT NULL,
	`ppuDecoder` varchar(128),
	`spuMode` varchar(128),
	`renderingFlags` text,
	`recommendedSettings` text,
	`compatibilityNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gameCompatibility_id` PRIMARY KEY(`id`),
	CONSTRAINT `gameCompatibility_gameSerial_unique` UNIQUE(`gameSerial`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('version_update','bug_fixed','feature_release','critical_alert') NOT NULL,
	`title` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`relatedVersionId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`emailSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`configYaml` text NOT NULL,
	`description` text,
	`targetDeviceType` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performanceProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settingsGuide` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(128) NOT NULL,
	`settingKey` varchar(256) NOT NULL,
	`displayName` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`recommendedValue` varchar(256),
	`recommendedValueHeavyGames` varchar(256),
	`possibleValues` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settingsGuide_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `deviceInfo` text;