CREATE TABLE `weekly_plan_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_count` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weekly_plan_slots` (
	`slot_index` integer PRIMARY KEY NOT NULL,
	`recipe_id` text,
	`updated_at` text NOT NULL
);
