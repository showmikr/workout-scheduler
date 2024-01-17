const sqlite_ddl = [
  `CREATE TABLE IF NOT EXISTS "days_of_week" (
    "day" text CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))
  );`,

  `CREATE TABLE IF NOT EXISTS "app_user" (
    "id" INTEGER PRIMARY KEY,
    "aws_cognito_sub" uuid UNIQUE NOT NULL,
    "first_name" text,
    "last_name" text,
    "user_name" text,
    "email" text NOT NULL,
    "email_verified" boolean NOT NULL DEFAULT false,
    "image_url" text,
    "creation_date" timestamp NOT NULL,
    "last_signed_in" timestamp NOT NULL,
    "avg_daily_calorie_goal" int,
    "bodyweight_goal" real
  );`,

  `CREATE TABLE IF NOT EXISTS "exercise_type" (
    "id" INTEGER PRIMARY KEY,
    "title" text NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "exercise_equipment" (
    "id" INTEGER PRIMARY KEY,
    "title" text UNIQUE NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "workout_tag" (
    "id" INTEGER PRIMARY KEY,
    "app_user_id" bigint NOT NULL,
    "title" text NOT NULL,
    FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "link_tag_workout" (
    "id" INTEGER PRIMARY KEY,
    "workout_tag_id" bigint NOT NULL,
    "workout_id" bigint NOT NULL,
    FOREIGN KEY ("workout_id") REFERENCES "workout" ("id"),
    FOREIGN KEY ("workout_tag_id") REFERENCES "workout_tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "workout" (
    "id" INTEGER PRIMARY KEY,
    "app_user_id" bigint NOT NULL,
    "training_day_id" bigint,
    "title" text NOT NULL,
    "list_order" int NOT NULL,
    "last_session" timestamp,
    FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("training_day_id") REFERENCES "training_day" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "workout_days" (
    "id" INTEGER PRIMARY KEY,
    "workout_id" bigint,
    "day" days_of_week NOT NULL,
    FOREIGN KEY ("workout_id") REFERENCES "workout" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "exercise" (
    "id" INTEGER PRIMARY KEY,
    "standard_exercise_category_id" bigint,
    "custom_exercise_category_id" bigint,
    "workout_id" bigint NOT NULL,
    "exercise_type_id" bigint NOT NULL,
    "exercise_equipment_id" bigint,
    "title" text NOT NULL,
    "list_order" int NOT NULL,
    "initial_weight" real,
    "notes" text,
    FOREIGN KEY ("exercise_type_id") REFERENCES "exercise_type" ("id"),
    FOREIGN KEY ("exercise_equipment_id") REFERENCES "exercise_equipment" ("id"),
    FOREIGN KEY ("workout_id") REFERENCES "workout" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("custom_exercise_category_id") REFERENCES "custom_exercise_category" ("id") ON DELETE SET NULL,
    FOREIGN KEY ("standard_exercise_category_id") REFERENCES "standard_exercise_category" ("id") ON DELETE SET NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "set" (
    "id" INTEGER PRIMARY KEY,
    "exercise_id" bigint NOT NULL,
    "title" text,
    "list_order" int NOT NULL,
    "reps" int NOT NULL DEFAULT 1,
    "rest_time" int NOT NULL DEFAULT 0,
    FOREIGN KEY ("exercise_id") REFERENCES "exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "resistance_set" (
    "id" INTEGER PRIMARY KEY,
    "set_id" bigint UNIQUE NOT NULL,
    "total_weight" real,
    FOREIGN KEY ("set_id") REFERENCES "set" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "cardio_set" (
    "id" INTEGER PRIMARY KEY,
    "set_id" bigint UNIQUE NOT NULL,
    "target_distance" real,
    "target_speed" real,
    "target_time" int,
    FOREIGN KEY ("set_id") REFERENCES "set" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "workout_session" (
    "id" INTEGER PRIMARY KEY,
    "app_user_id" bigint NOT NULL,
    "title" text NOT NULL,
    "date" timestamp NOT NULL,
    "calories" int,
    "tied_to_workout" boolean NOT NULL DEFAULT False,
    FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "exercise_session" (
    "id" INTEGER PRIMARY KEY,
    "workout_session_id" bigint NOT NULL,
    "pr_history_id" bigint,
    "exercise_type_id" bigint NOT NULL,
    "title" text NOT NULL,
    "list_order" int NOT NULL,
    "initial_weight" real,
    "was_completed" boolean NOT NULL DEFAULT False,
    FOREIGN KEY ("exercise_type_id") REFERENCES "exercise_type" ("id"),
    FOREIGN KEY ("workout_session_id") REFERENCES "workout_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("pr_history_id") REFERENCES "pr_history" ("id") ON DELETE SET NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "cardio_set_session" (
    "id" INTEGER PRIMARY KEY,
    "set_session_id" bigint NOT NULL,
    "target_distance" real,
    "target_speed" real,
    "target_time" int,
    "actual_distance" real,
    "actual_speed" real,
    "actual_time" int,
    FOREIGN KEY ("set_session_id") REFERENCES "set_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  ` CREATE TABLE IF NOT EXISTS "set_session" (
    "id" INTEGER PRIMARY KEY,
    "exercise_session_id" bigint NOT NULL,
    "title" text,
    "reps" int NOT NULL DEFAULT 1,
    "list_order" int NOT NULL,
    "elapsed_time" int NOT NULL DEFAULT 0,
    "rest_time" int NOT NULL DEFAULT 0,
    FOREIGN KEY ("exercise_session_id") REFERENCES "exercise_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "resistance_set_session" (
    "id" INTEGER PRIMARY KEY,
    "set_session_id" bigint NOT NULL,
    "total_weight" real,
    FOREIGN KEY ("set_session_id") REFERENCES "set_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "user_bodyweight" (
    "id" INTEGER PRIMARY KEY,
    "app_user_id" bigint NOT NULL,
    "weight" real NOT NULL,
    "date" timestamp NOT NULL,
    FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "custom_exercise_category" (
    "id" INTEGER PRIMARY KEY,
    "app_user_id" bigint NOT NULL,
    "title" text NOT NULL,
    FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "pr_history" (
    "id" INTEGER PRIMARY KEY,
    "weight" real,
    "reps" int,
    "distance" real,
    "speed" real,
    "time" int,
    "date" timestamp NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "custom_category_pr" (
    "id" INTEGER PRIMARY KEY,
    "custom_category_pr_id" bigint NOT NULL,
    "pr_history_id" bigint UNIQUE NOT NULL,
    FOREIGN KEY ("pr_history_id") REFERENCES "pr_history" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("custom_category_pr_id") REFERENCES "custom_exercise_category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "standard_category_pr" (
    "id" INTEGER PRIMARY KEY,
    "standard_category_pr_id" bigint NOT NULL,
    "pr_history_id" bigint UNIQUE NOT NULL,
    FOREIGN KEY ("pr_history_id") REFERENCES "pr_history" ("id"),
    FOREIGN KEY ("standard_category_pr_id") REFERENCES "standard_exercise_category" ("id")
  );`,

  `CREATE TABLE IF NOT EXISTS "training_cycle" (
    "id" INTEGER PRIMARY KEY,
    "app_user_id" bigint NOT NULL,
    "title" text NOT NULL,
    "list_order" int NOT NULL,
    FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "training_day" (
    "id" INTEGER PRIMARY KEY,
    "training_cycle_id" bigint NOT NULL,
    "list_order" int NOT NULL,
    FOREIGN KEY ("training_cycle_id") REFERENCES "training_cycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "standard_exercise_category" (
    "id" INTEGER PRIMARY KEY,
    "title" text NOT NULL
  );`,

  `INSERT INTO days_of_week values 
  ('Monday'), 
  ('Tuesday'), 
  ('Wednesday'), 
  ('Thursday'), 
  ('Friday'), 
  ('Saturday'), 
  ('Sunday');`,

  `INSERT INTO app_user (aws_cognito_sub, first_name, last_name, user_name, email, email_verified, image_url, creation_date, last_signed_in, avg_daily_calorie_goal, bodyweight_goal)
  VALUES
	('c8bf7e34-7dcf-11ee-b962-0242ac120002', 'David', 'Shcherbina', 'kalashnikov', 'davidshcherbina@gmail.com', true, null, '2022-05-07 09:12:34-05:00', '2023-11-07 14:12:34-05:00', 150, 270);
  `,

  `INSERT INTO workout_session (app_user_id, title, date, calories, tied_to_workout)
    VALUES
    (1, 'Warmup Stretches',         '2023-11-07T14:12:34',   34,     False),
    (1, 'Upperbody',                '2023-11-07T14:12:34',   200,    True),
    (1, 'Legday workout + core',    '2023-11-15T07:34:12',   200,    True),
    (1, 'Upperbody',                '2023-11-15T07:34:12',   200,    False),

    (1, 'Daily Jog',                '2023-11-07T14:12:34',   134,    False),
    (1, 'Daily Jog',                '2023-11-11T17:05:03',   120,    False);
  `,
];

export default sqlite_ddl;
