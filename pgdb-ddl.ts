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
    (1, 'Upperbody',                '2022-01-02T07:34:12',   306,    False),
    (1, 'Upperbody',                '2022-01-07T07:34:12',   142,    False),
    (1, 'Upperbody',                '2022-01-12T07:34:12',   263,    False),
    (1, 'Upperbody',                '2022-01-17T07:34:12',   384,    False),
    (1, 'Upperbody',                '2022-01-25T07:34:12',   373,    False),
    (1, 'Upperbody',                '2022-01-29T07:34:12',   147,    False),
    (1, 'Upperbody',                '2022-01-31T07:34:12',   278,    False),
	
	  (1, 'Upperbody',                '2022-02-02T07:34:12',   279,    False),
    (1, 'Upperbody',                '2022-02-07T07:34:12',   103,    False),
    (1, 'Upperbody',                '2022-02-12T07:34:12',   343,    False),
    (1, 'Upperbody',                '2022-02-17T07:34:12',   339,    False),
    (1, 'Upperbody',                '2022-02-25T07:34:12',   347,    False),
    (1, 'Upperbody',                '2022-02-29T07:34:12',   236,    False),
    (1, 'Upperbody',                '2022-02-31T07:34:12',   93,     False),
	
	  (1, 'Upperbody',                '2022-03-02T07:34:12',   281,    False),
    (1, 'Upperbody',                '2022-03-07T07:34:12',   316,    False),
    (1, 'Upperbody',                '2022-03-12T07:34:12',   300,    False),
    (1, 'Upperbody',                '2022-03-17T07:34:12',   386,    False),
    (1, 'Upperbody',                '2022-03-25T07:34:12',   214,    False),
    (1, 'Upperbody',                '2022-03-29T07:34:12',   247,    False),
    (1, 'Upperbody',                '2022-03-31T07:34:12',   256,    False),
	
	  (1, 'Upperbody',                '2022-04-02T07:34:12',   305,    False),
    (1, 'Upperbody',                '2022-04-07T07:34:12',   394,    False),
    (1, 'Upperbody',                '2022-04-12T07:34:12',   344,    False),
    (1, 'Upperbody',                '2022-04-17T07:34:12',   238,    False),
    (1, 'Upperbody',                '2022-04-25T07:34:12',   116,    False),
    (1, 'Upperbody',                '2022-04-29T07:34:12',   90,     False),
    (1, 'Upperbody',                '2022-04-31T07:34:12',   94,     False),
	
	  (1, 'Upperbody',                '2022-05-02T07:34:12',   359,    False),
    (1, 'Upperbody',                '2022-05-07T07:34:12',   265,    False),
    (1, 'Upperbody',                '2022-05-12T07:34:12',   90,     False),
    (1, 'Upperbody',                '2022-05-17T07:34:12',   341,    False),
    (1, 'Upperbody',                '2022-05-25T07:34:12',   126,    False),
    (1, 'Upperbody',                '2022-05-29T07:34:12',   185,    False),
    (1, 'Upperbody',                '2022-05-31T07:34:12',   392,    False),
	
	  (1, 'Upperbody',                '2022-06-02T07:34:12',   300,    False),
    (1, 'Upperbody',                '2022-06-07T07:34:12',   118,    False),
    (1, 'Upperbody',                '2022-06-12T07:34:12',   329,    False),
    (1, 'Upperbody',                '2022-06-17T07:34:12',   110,    False),
    (1, 'Upperbody',                '2022-06-25T07:34:12',   265,    False),
    (1, 'Upperbody',                '2022-06-29T07:34:12',   158,    False),
    (1, 'Upperbody',                '2022-06-31T07:34:12',   223,    False),
	
	  (1, 'Upperbody',                '2022-07-02T07:34:12',   196,    False),
    (1, 'Upperbody',                '2022-07-07T07:34:12',   201,    False),
    (1, 'Upperbody',                '2022-07-12T07:34:12',   184,    False),
    (1, 'Upperbody',                '2022-07-17T07:34:12',   389,    False),
    (1, 'Upperbody',                '2022-07-25T07:34:12',   315,    False),
    (1, 'Upperbody',                '2022-07-29T07:34:12',   255,    False),
    (1, 'Upperbody',                '2022-07-31T07:34:12',   107,    False),
	
	  (1, 'Upperbody',                '2022-08-02T07:34:12',   167,    False),
    (1, 'Upperbody',                '2022-08-07T07:34:12',   389,    False),
    (1, 'Upperbody',                '2022-08-12T07:34:12',   356,    False),
    (1, 'Upperbody',                '2022-08-17T07:34:12',   312,    False),
    (1, 'Upperbody',                '2022-08-25T07:34:12',   123,    False),
    (1, 'Upperbody',                '2022-08-29T07:34:12',   251,    False),
    (1, 'Upperbody',                '2022-08-31T07:34:12',   310,    False),
	
	  (1, 'Upperbody',                '2022-09-02T07:34:12',   175,    False),
    (1, 'Upperbody',                '2022-09-07T07:34:12',   132,    False),
    (1, 'Upperbody',                '2022-09-12T07:34:12',   239,    False),
    (1, 'Upperbody',                '2022-09-17T07:34:12',   157,    False),
    (1, 'Upperbody',                '2022-09-25T07:34:12',   211,    False),
    (1, 'Upperbody',                '2022-09-29T07:34:12',   87,     False),
    (1, 'Upperbody',                '2022-09-31T07:34:12',   153,    False),
	
	  (1, 'Upperbody',                '2022-10-02T07:34:12',   156,    False),
    (1, 'Upperbody',                '2022-10-07T07:34:12',   298,    False),
    (1, 'Upperbody',                '2022-10-12T07:34:12',   184,    False),
    (1, 'Upperbody',                '2022-10-17T07:34:12',   277,    False),
    (1, 'Upperbody',                '2022-10-25T07:34:12',   91,     False),
    (1, 'Upperbody',                '2022-10-29T07:34:12',   99,     False),
    (1, 'Upperbody',                '2022-10-31T07:34:12',   293,    False),
	
	  (1, 'Upperbody',                '2022-11-02T07:34:12',   257,    False),
    (1, 'Upperbody',                '2022-11-07T07:34:12',   271,    False),
    (1, 'Upperbody',                '2022-11-12T07:34:12',   157,    False),
    (1, 'Upperbody',                '2022-11-17T07:34:12',   223,    False),
    (1, 'Upperbody',                '2022-11-25T07:34:12',   278,    False),
    (1, 'Upperbody',                '2022-11-29T07:34:12',   128,    False),
    (1, 'Upperbody',                '2022-11-31T07:34:12',   86,     False),
	
	  (1, 'Upperbody',                '2022-12-02T07:34:12',   237,    False),
    (1, 'Upperbody',                '2022-12-07T07:34:12',   179,    False),
    (1, 'Upperbody',                '2022-12-12T07:34:12',   145,    False),
    (1, 'Upperbody',                '2022-12-17T07:34:12',   116,    False),
    (1, 'Upperbody',                '2022-12-25T07:34:12',   204,    False),
    (1, 'Upperbody',                '2022-12-29T07:34:12',   103,    False),
    (1, 'Upperbody',                '2022-12-31T07:34:12',   281,    False),

	  (1, 'Upperbody',                '2023-01-02T07:34:12',   115,    False),
    (1, 'Upperbody',                '2023-01-07T07:34:12',   202,    False),
    (1, 'Upperbody',                '2023-01-12T07:34:12',   182,    False),
    (1, 'Upperbody',                '2023-01-17T07:34:12',   239,    False),
    (1, 'Upperbody',                '2023-01-25T07:34:12',   227,    False),
    (1, 'Upperbody',                '2023-01-29T07:34:12',   287,    False),
    (1, 'Upperbody',                '2023-01-31T07:34:12',   170,    False),
	
	  (1, 'Upperbody',                '2023-02-02T07:34:12',   152,    False),
    (1, 'Upperbody',                '2023-02-07T07:34:12',   235,    False),
    (1, 'Upperbody',                '2023-02-12T07:34:12',   282,    False),
    (1, 'Upperbody',                '2023-02-17T07:34:12',   234,    False),
    (1, 'Upperbody',                '2023-02-25T07:34:12',   296,    False),
    (1, 'Upperbody',                '2023-02-29T07:34:12',   248,    False),
    (1, 'Upperbody',                '2023-02-31T07:34:12',   343,    False),
	
	  (1, 'Upperbody',                '2023-03-02T07:34:12',   330,    False),
    (1, 'Upperbody',                '2023-03-07T07:34:12',   240,    False),
    (1, 'Upperbody',                '2023-03-12T07:34:12',   283,    False),
    (1, 'Upperbody',                '2023-03-17T07:34:12',   156,    False),
    (1, 'Upperbody',                '2023-03-25T07:34:12',   331,    False),
    (1, 'Upperbody',                '2023-03-29T07:34:12',   153,    False),
    (1, 'Upperbody',                '2023-03-31T07:34:12',   290,    False),
	
	  (1, 'Upperbody',                '2023-04-02T07:34:12',   151,    False),
    (1, 'Upperbody',                '2023-04-07T07:34:12',   244,    False),
    (1, 'Upperbody',                '2023-04-12T07:34:12',   180,    False),
    (1, 'Upperbody',                '2023-04-17T07:34:12',   341,    False),
    (1, 'Upperbody',                '2023-04-25T07:34:12',   234,    False),
    (1, 'Upperbody',                '2023-04-29T07:34:12',   261,    False),
    (1, 'Upperbody',                '2023-04-31T07:34:12',   318,    False),
	
	  (1, 'Upperbody',                '2023-05-02T07:34:12',   179,    False),
    (1, 'Upperbody',                '2023-05-07T07:34:12',   213,    False),
    (1, 'Upperbody',                '2023-05-12T07:34:12',   182,    False),
    (1, 'Upperbody',                '2023-05-17T07:34:12',   297,    False),
    (1, 'Upperbody',                '2023-05-25T07:34:12',   243,    False),
    (1, 'Upperbody',                '2023-05-29T07:34:12',   223,    False),
    (1, 'Upperbody',                '2023-05-31T07:34:12',   337,    False),
	
	  (1, 'Upperbody',                '2023-06-02T07:34:12',   177,    False),
    (1, 'Upperbody',                '2023-06-07T07:34:12',   277,    False),
    (1, 'Upperbody',                '2023-06-12T07:34:12',   180,    False),
    (1, 'Upperbody',                '2023-06-17T07:34:12',   319,    False),
    (1, 'Upperbody',                '2023-06-25T07:34:12',   420,    False),
    (1, 'Upperbody',                '2023-06-29T07:34:12',   238,    False),
    (1, 'Upperbody',                '2023-06-31T07:34:12',   287,    False),
	
	  (1, 'Upperbody',                '2023-07-02T07:34:12',   187,    False),
    (1, 'Upperbody',                '2023-07-07T07:34:12',   204,    False),
    (1, 'Upperbody',                '2023-07-12T07:34:12',   230,    False),
    (1, 'Upperbody',                '2023-07-17T07:34:12',   305,    False),
    (1, 'Upperbody',                '2023-07-25T07:34:12',   302,    False),
    (1, 'Upperbody',                '2023-07-29T07:34:12',   327,    False),
    (1, 'Upperbody',                '2023-07-31T07:34:12',   238,    False),
	
	  (1, 'Upperbody',                '2023-08-02T07:34:12',   345,    False),
    (1, 'Upperbody',                '2023-08-07T07:34:12',   170,    False),
    (1, 'Upperbody',                '2023-08-12T07:34:12',   188,    False),
    (1, 'Upperbody',                '2023-08-17T07:34:12',   181,    False),
    (1, 'Upperbody',                '2023-08-25T07:34:12',   324,    False),
    (1, 'Upperbody',                '2023-08-29T07:34:12',   278,    False),
    (1, 'Upperbody',                '2023-08-31T07:34:12',   213,    False),
	
	  (1, 'Upperbody',                '2023-09-02T07:34:12',   223,    False),
    (1, 'Upperbody',                '2023-09-07T07:34:12',   224,    False),
    (1, 'Upperbody',                '2023-09-12T07:34:12',   150,    False),
    (1, 'Upperbody',                '2023-09-17T07:34:12',   295,    False),
    (1, 'Upperbody',                '2023-09-25T07:34:12',   260,    False),
    (1, 'Upperbody',                '2023-09-29T07:34:12',   169,    False),
    (1, 'Upperbody',                '2023-09-31T07:34:12',   288,    False),
	
	  (1, 'Upperbody',                '2023-10-02T07:34:12',   296,    False),
    (1, 'Upperbody',                '2023-10-07T07:34:12',   261,    False),
    (1, 'Upperbody',                '2023-10-12T07:34:12',   198,    False),
    (1, 'Upperbody',                '2023-10-17T07:34:12',   318,    False),
    (1, 'Upperbody',                '2023-10-25T07:34:12',   190,    False),
    (1, 'Upperbody',                '2023-10-29T07:34:12',   183,    False),
    (1, 'Upperbody',                '2023-10-31T07:34:12',   310,    False),
    
    (1, 'Warmup Stretches',         '2023-11-07T14:12:34',   34,     False),
    (1, 'Upperbody',                '2023-11-07T14:12:34',   200,    True),
    (1, 'Legday workout + core',    '2023-11-15T07:34:12',   200,    True),
    (1, 'Upperbody',                '2023-11-15T07:34:12',   200,    False),
    (1, 'Daily Jog',                '2023-11-07T14:12:34',   134,    False),
    (1, 'Daily Jog',                '2023-11-11T17:05:03',   120,    False),
    (1, 'Upperbody',                '2023-11-23T07:34:12',   296,    False),
    (1, 'Upperbody',                '2023-11-28T07:34:12',   274,    False),

    (1, 'Upperbody',                '2023-12-02T07:34:12',   203,    False),
    (1, 'Upperbody',                '2023-12-07T07:34:12',   108,    False),
    (1, 'Upperbody',                '2023-12-12T07:34:12',   253,    False),
    (1, 'Upperbody',                '2023-12-17T07:34:12',   393,    False),
    (1, 'Upperbody',                '2023-12-25T07:34:12',   169,    False),
    (1, 'Upperbody',                '2023-12-29T07:34:12',   222,    False),
    (1, 'Upperbody',                '2023-12-31T07:34:12',   257,    False),

    (1, 'Upperbody',                '2024-01-03T07:34:12',   247,    False),
    (1, 'Upperbody',                '2024-01-10T07:34:12',   332,    False),
    (1, 'Upperbody',                '2024-01-13T07:34:12',   202,    False),
    (1, 'Upperbody',                '2024-01-17T07:34:12',   355,    False),
    (1, 'Upperbody',                '2024-01-20T07:34:12',   509,    False),
    (1, 'Upperbody',                '2024-01-24T07:34:12',   271,    False),
    (1, 'Upperbody',                '2024-01-27T07:34:12',   261,    False),
    (1, 'Upperbody',                '2024-01-31T07:34:12',   440,    False),
    (1, 'Upperbody',                '2024-02-03T07:34:12',   322,    False);
  `,
];

export default sqlite_ddl;
