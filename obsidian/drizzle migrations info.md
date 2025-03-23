## Word of warning about migration scripts

- Drizzle migration scripts (sql files) need to have breakpoints (i.e `--> statement-breakpoint`) appended after every DDL statement for SQLite (and MySQL) databases b/c they don't support doing multiple DDL statements in one transaction
- Normally this isn't an issue as breakpoints are automatically generated when you generate your sql migration script, but in the case of adding a custom migration script (in our case, adding seed data like workouts, exercises, and workout sessions), you'll have to manually put those `--> statement-breakpoint` comments in after every DDL statement you make.
- Sources:
  1. https://orm.drizzle.team/docs/drizzle-config-file#breakpoints
  2. https://github.com/drizzle-team/drizzle-orm/issues/3650

### TLDR

Make sure to add a `--> statement-breakpoint` after the end of every DDL query in your sql migration file!
Like this:

```sql
CREATE TABLE `body_part` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cardio_set` (
	`id` integer PRIMARY KEY NOT NULL,
	`exercise_set_id` integer NOT NULL,
	`target_distance` real,
	`target_time` integer,
	FOREIGN KEY (`exercise_set_id`) REFERENCES `exercise_set`(`id`) ON UPDATE cascade ON DELETE cascade
);
```
