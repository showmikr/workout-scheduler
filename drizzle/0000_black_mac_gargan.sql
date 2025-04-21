CREATE TABLE `app_user` (
	`id` integer PRIMARY KEY NOT NULL,
	`aws_cognito_sub` numeric NOT NULL,
	`first_name` text,
	`last_name` text,
	`user_name` text,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image_url` text,
	`creation_date` text NOT NULL,
	`last_signed_in` text NOT NULL,
	`avg_daily_calorie_goal` integer,
	`bodyweight_goal` real,
	`user_height` real
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_user_aws_cognito_sub_unique` ON `app_user` (`aws_cognito_sub`);--> statement-breakpoint
CREATE TABLE `body_part` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cardio_set` (
	`exercise_set_id` integer PRIMARY KEY NOT NULL,
	`target_distance` real,
	`target_time` integer,
	FOREIGN KEY (`exercise_set_id`) REFERENCES `exercise_set`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exercise` (
	`id` integer PRIMARY KEY NOT NULL,
	`exercise_class_id` integer NOT NULL,
	`workout_id` integer NOT NULL,
	`list_order` integer NOT NULL,
	`initial_weight` real,
	`notes` text,
	FOREIGN KEY (`exercise_class_id`) REFERENCES `exercise_class`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workout_id`) REFERENCES `workout`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exercise_class` (
	`id` integer PRIMARY KEY NOT NULL,
	`app_user_id` integer NOT NULL,
	`exercise_type_id` integer NOT NULL,
	`exercise_equipment_id` integer NOT NULL,
	`body_part_id` integer,
	`is_archived` integer DEFAULT false NOT NULL,
	`title` text NOT NULL,
	FOREIGN KEY (`app_user_id`) REFERENCES `app_user`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`exercise_type_id`) REFERENCES `exercise_type`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_equipment_id`) REFERENCES `exercise_equipment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`body_part_id`) REFERENCES `body_part`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exercise_equipment` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercise_session` (
	`id` integer PRIMARY KEY NOT NULL,
	`workout_session_id` integer NOT NULL,
	`exercise_class_id` integer NOT NULL,
	FOREIGN KEY (`workout_session_id`) REFERENCES `workout_session`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`exercise_class_id`) REFERENCES `exercise_class`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `exercise_set` (
	`id` integer PRIMARY KEY NOT NULL,
	`exercise_id` integer NOT NULL,
	`title` text,
	`list_order` integer NOT NULL,
	`reps` integer DEFAULT 1 NOT NULL,
	`rest_time` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercise`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exercise_type` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `link_tag_workout` (
	`id` integer PRIMARY KEY NOT NULL,
	`workout_tag_id` integer NOT NULL,
	`workout_id` integer NOT NULL,
	FOREIGN KEY (`workout_tag_id`) REFERENCES `workout_tag`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`workout_id`) REFERENCES `workout`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pr_history` (
	`id` integer PRIMARY KEY NOT NULL,
	`exercise_class_id` integer NOT NULL,
	`weight` real,
	`reps` integer,
	`distance` real,
	`time` integer,
	`date` text NOT NULL,
	FOREIGN KEY (`exercise_class_id`) REFERENCES `exercise_class`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `resistance_set` (
	`exercise_set_id` integer PRIMARY KEY NOT NULL,
	`total_weight` real,
	FOREIGN KEY (`exercise_set_id`) REFERENCES `exercise_set`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `set_session` (
	`id` integer PRIMARY KEY NOT NULL,
	`exercise_session_id` integer NOT NULL,
	`reps` integer DEFAULT 1 NOT NULL,
	`rest_time` integer DEFAULT 0 NOT NULL,
	`completed` integer NOT NULL,
	`set_type` integer NOT NULL,
	`total_weight` real,
	`target_distance` real,
	`target_time` integer,
	`actual_distance` real,
	`actual_time` integer,
	FOREIGN KEY (`exercise_session_id`) REFERENCES `exercise_session`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_bodyweight` (
	`id` integer PRIMARY KEY NOT NULL,
	`app_user_id` integer NOT NULL,
	`weight` real NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`app_user_id`) REFERENCES `app_user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout` (
	`id` integer PRIMARY KEY NOT NULL,
	`app_user_id` integer NOT NULL,
	`title` text NOT NULL,
	`list_order` integer NOT NULL,
	`last_session` text,
	FOREIGN KEY (`app_user_id`) REFERENCES `app_user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_session` (
	`id` integer PRIMARY KEY NOT NULL,
	`app_user_id` integer NOT NULL,
	`title` text DEFAULT 'Custom Workout' NOT NULL,
	`started_on` text NOT NULL,
	`ended_on` text NOT NULL,
	`calories` integer,
	FOREIGN KEY (`app_user_id`) REFERENCES `app_user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_tag` (
	`id` integer PRIMARY KEY NOT NULL,
	`app_user_id` integer NOT NULL,
	`title` text NOT NULL,
	FOREIGN KEY (`app_user_id`) REFERENCES `app_user`(`id`) ON UPDATE cascade ON DELETE cascade
);
