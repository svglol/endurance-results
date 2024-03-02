CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`season_id` text,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`name` text NOT NULL,
	`event_id` text,
	`value` blob NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`series_id` text,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `series` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_id_unique` ON `events` (`id`);--> statement-breakpoint
CREATE INDEX `events_season_id_idx` ON `events` (`season_id`);--> statement-breakpoint
CREATE INDEX `events_name_idx` ON `events` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `results_id_unique` ON `results` (`id`);--> statement-breakpoint
CREATE INDEX `results_event_id_idx` ON `results` (`event_id`);--> statement-breakpoint
CREATE INDEX `results_name_idx` ON `results` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `seasons_id_unique` ON `seasons` (`id`);--> statement-breakpoint
CREATE INDEX `seasons_series_id_idx` ON `seasons` (`series_id`);--> statement-breakpoint
CREATE INDEX `seasons_name_idx` ON `seasons` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `series_id_unique` ON `series` (`id`);