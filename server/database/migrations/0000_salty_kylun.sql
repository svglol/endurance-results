CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`season_id` integer,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`name` text NOT NULL,
	`event_id` integer,
	`value` blob NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`series_id` integer,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_season_id_idx` ON `events` (`season_id`);--> statement-breakpoint
CREATE INDEX `events_name_idx` ON `events` (`name`);--> statement-breakpoint
CREATE INDEX `results_event_id_idx` ON `results` (`event_id`);--> statement-breakpoint
CREATE INDEX `results_name_idx` ON `results` (`name`);--> statement-breakpoint
CREATE INDEX `seasons_series_id_idx` ON `seasons` (`series_id`);--> statement-breakpoint
CREATE INDEX `seasons_name_idx` ON `seasons` (`name`);--> statement-breakpoint
CREATE INDEX `series_name_idx` ON `series` (`name`);