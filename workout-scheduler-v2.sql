CREATE TABLE IF NOT EXISTS "days_of_week" (
  "day" text CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')) NOT NULL
);

CREATE TABLE IF NOT EXISTS "app_user" (
  "id" INTEGER PRIMARY KEY,
  "aws_cognito_sub" uuid UNIQUE NOT NULL,
  "first_name" text,
  "last_name" text,
  "user_name" text,
  "email" text NOT NULL,
  "email_verified" boolean NOT NULL DEFAULT false,
  "image_url" text,
  "creation_date" text NOT NULL,
  "last_signed_in" text NOT NULL,
  "avg_daily_calorie_goal" int,
  "bodyweight_goal" real
);

CREATE TABLE IF NOT EXISTS "exercise_type" (
  "id" INTEGER PRIMARY KEY,
  "title" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "exercise_equipment" (
  "id" INTEGER PRIMARY KEY,
  "title" text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "workout_tag" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "title" text NOT NULL,
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "link_tag_workout" (
  "id" INTEGER PRIMARY KEY,
  "workout_tag_id" bigint NOT NULL,
  "workout_id" bigint NOT NULL,
  FOREIGN KEY ("workout_id") REFERENCES "workout" ("id"),
  FOREIGN KEY ("workout_tag_id") REFERENCES "workout_tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "workout" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "training_day_id" bigint,
  "title" text NOT NULL,
  "list_order" int NOT NULL,
  "last_session" text,
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("training_day_id") REFERENCES "training_day" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "workout_days" (
  "id" INTEGER PRIMARY KEY,
  "workout_id" bigint,
  "day" days_of_week NOT NULL,
  FOREIGN KEY ("workout_id") REFERENCES "workout" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "exercise" (
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
);

CREATE TABLE IF NOT EXISTS "exercise_set" (
  "id" INTEGER PRIMARY KEY,
  "exercise_id" bigint NOT NULL,
  "title" text,
  "list_order" int NOT NULL,
  "reps" int NOT NULL DEFAULT 1,
  "rest_time" int NOT NULL DEFAULT 0,
  FOREIGN KEY ("exercise_id") REFERENCES "exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "resistance_set" (
  "id" INTEGER PRIMARY KEY,
  "exercise_set_id" bigint UNIQUE NOT NULL,
  "total_weight" real,
  FOREIGN KEY ("exercise_set_id") REFERENCES "exercise_set" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "cardio_set" (
  "id" INTEGER PRIMARY KEY,
  "exercise_set_id" bigint UNIQUE NOT NULL,
  "target_distance" real,
  "target_speed" real,
  "target_time" int,
  FOREIGN KEY ("exercise_set_id") REFERENCES "exercise_set" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "workout_session" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "title" text NOT NULL,
  "date" text NOT NULL,
  "calories" int,
  "tied_to_workout" boolean NOT NULL DEFAULT False,
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "exercise_session" (
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
);

CREATE TABLE IF NOT EXISTS "cardio_set_session" (
  "id" INTEGER PRIMARY KEY,
  "set_session_id" bigint NOT NULL,
  "target_distance" real,
  "target_speed" real,
  "target_time" int,
  "actual_distance" real,
  "actual_speed" real,
  "actual_time" int,
  FOREIGN KEY ("set_session_id") REFERENCES "set_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "set_session" (
  "id" INTEGER PRIMARY KEY,
  "exercise_session_id" bigint NOT NULL,
  "title" text,
  "reps" int NOT NULL DEFAULT 1,
  "list_order" int NOT NULL,
  "elapsed_time" int NOT NULL DEFAULT 0,
  "rest_time" int NOT NULL DEFAULT 0,
  FOREIGN KEY ("exercise_session_id") REFERENCES "exercise_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "resistance_set_session" (
  "id" INTEGER PRIMARY KEY,
  "set_session_id" bigint NOT NULL,
  "total_weight" real,
  FOREIGN KEY ("set_session_id") REFERENCES "set_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "user_bodyweight" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "weight" real NOT NULL,
  "date" text NOT NULL,
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "custom_exercise_category" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "title" text NOT NULL,
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "pr_history" (
  "id" INTEGER PRIMARY KEY,
  "weight" real,
  "reps" int,
  "distance" real,
  "speed" real,
  "time" int,
  "date" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "custom_category_pr" (
  "id" INTEGER PRIMARY KEY,
  "custom_category_pr_id" bigint NOT NULL,
  "pr_history_id" bigint UNIQUE NOT NULL,
  FOREIGN KEY ("pr_history_id") REFERENCES "pr_history" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("custom_category_pr_id") REFERENCES "custom_exercise_category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "standard_category_pr" (
  "id" INTEGER PRIMARY KEY,
  "standard_category_pr_id" bigint NOT NULL,
  "pr_history_id" bigint UNIQUE NOT NULL,
  FOREIGN KEY ("pr_history_id") REFERENCES "pr_history" ("id"),
  FOREIGN KEY ("standard_category_pr_id") REFERENCES "standard_exercise_category" ("id")
);

CREATE TABLE IF NOT EXISTS "training_cycle" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "title" text NOT NULL,
  "list_order" int NOT NULL,
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "training_day" (
  "id" INTEGER PRIMARY KEY,
  "training_cycle_id" bigint NOT NULL,
  "list_order" int NOT NULL,
  FOREIGN KEY ("training_cycle_id") REFERENCES "training_cycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "standard_exercise_category" (
  "id" INTEGER PRIMARY KEY,
  "title" text NOT NULL
);

INSERT INTO days_of_week values 
  ('Monday'), 
  ('Tuesday'), 
  ('Wednesday'), 
  ('Thursday'), 
  ('Friday'), 
  ('Saturday'), 
  ('Sunday');

INSERT INTO app_user (aws_cognito_sub, first_name, last_name, user_name, email, email_verified, image_url, creation_date, last_signed_in, avg_daily_calorie_goal, bodyweight_goal)
  VALUES
	('c8bf7e34-7dcf-11ee-b962-0242ac120002', 'David', 'Shcherbina', 'kalashnikov', 'davidshcherbina@gmail.com', true, null, '2022-05-07T14:12:34.000Z', '2023-11-07T19:12:34.000Z', 150, 270);

INSERT INTO training_cycle (app_user_id, title, list_order)
    VALUES
    (1, 'Weekly Workout Cycle', 1);

INSERT INTO training_day (training_cycle_id, list_order)
    VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 5),
    (1, 6),
    (1, 7);

INSERT INTO workout (app_user_id, training_day_id, title, list_order, last_session)
    VALUES
    (1, NULL,   'Upperbody',                1,  '2023-11-28T22:40:00.000Z'),
    (1, NULL,   'Legday workout + core',    2,  '2023-12-02T17:15:00.000Z'),
    (1, NULL,   'Warmup Stretches',         3,  '2022-11-28T22:40:00.000Z'),

    (1, 2,      'Warmup Stretches',         1,  '2022-11-28T22:40:00.000Z'),
    (1, 2,      'Upperbody',                2,  '2023-11-28T22:40:00.000Z'),
    (1, 6,      'Warmup Stretches',         1,  '2022-11-28T23:30:00.000Z'),
    (1, 6,      'Legday workout + core',    2,  '2023-12-02T17:15:00.000Z');


INSERT INTO workout_tag (app_user_id, title)
    VALUES
    (1, 'Upper Body'),
    (1, 'Lower Body');

INSERT INTO link_tag_workout (workout_tag_id, workout_id)
    VALUES
    (1, 1),
    (1, 3),
    (2, 2),
    (2, 3),
    (2, 4);

INSERT INTO exercise_type (title)
    VALUES
    ('Resistance'),
    ('Cardiovascular');

INSERT INTO exercise_equipment (title)
    VALUES
    ('Dumbbell'),
    ('Adjustable Barbell'),
    ('Fixed-Weight Barbell'),
    ('Machine'),
    ('Bodyweight');

INSERT INTO standard_exercise_category (title)
    VALUES
    ('Bench'),
    ('Squat'),
    ('Deadlift');

INSERT INTO custom_exercise_category (app_user_id, title)
    VALUES
    (1, 'Tricep Extensions');

INSERT INTO pr_history (weight, reps, distance, speed, time, date)
    VALUES
    (220, 1, NULL, NULL, NULL, '2022-11-07T14:12:34.000Z'),
    (240, 1, NULL, NULL, NULL, '2023-11-07T19:12:34.000Z'),

    (255, 1, NULL, NULL, NULL, '2022-11-07T14:12:34.000Z'),
    (285, 1, NULL, NULL, NULL, '2023-11-07T19:12:34.000Z'),

    (355, 1, NULL, NULL, NULL, '2022-11-07T14:12:34.000Z'),
    (395, 1, NULL, NULL, NULL, '2023-11-07T19:12:34.000Z'),

    (30, 12, NULL, NULL, NULL, '2022-11-07T14:12:34.000Z');

INSERT INTO standard_category_pr (standard_category_pr_id, pr_history_id)
    VALUES
    (1, 1),
    (1, 2),

    (2, 3),
    (2, 4),

    (3, 5),
    (3, 6);

INSERT INTO custom_category_pr (custom_category_pr_id, pr_history_id)
    VALUES
    (1, 7);

INSERT INTO exercise (standard_exercise_category_id, custom_exercise_category_id, workout_id, exercise_type_id, exercise_equipment_id, title, list_order, initial_weight, notes)
    VALUES
    (1,     NULL,   1,  1,  2,      'Bench',                1,  45,     ''),
    (NULL,  NULL,   1,  1,  5,      'Chin-Ups',             2,  NULL,   ''),
    (NULL,  NULL,   1,  1,  1,      'Overhead Press',       3,  NULL,   ''),
    (NULL,  NULL,   1,  1,  1,      'Bicep Curls',          4,  NULL,   ''),
    (NULL,  NULL,   1,  1,  4,      'Rows',                 5,  NULL,   ''),
    (NULL,  1,      1,  1,  4,      'Tricep Extensions',    6,  NULL,   'Extended down varient'),
    
    (NULL,  NULL,   2,  1,  4,      'Leg Curls',            1,  NULL,   'Try to hit 12 reps'),
    (NULL,  NULL,   2,  1,  4,      'Calf Raises',          2,  20,     ''),
    (NULL,  NULL,   2,  1,  4,      'Core push-ins',        3,  20,     ''),
    (NULL,  NULL,   2,  1,  4,      'Leg Press',            4,  50,     'Bruh'),
    (2,     NULL,   2,  1,  2,      'Squats',               5,  45,     ''),
    (NULL,  NULL,   2,  2,  NULL,   'Jog',                  6,  NULL,   ''),

    (NULL,  NULL,   3,  2,  NULL,   'ALL STRETCHES',        1,  NULL,   ''),

    (NULL,  NULL,   3,  2,  NULL,   'ALL STRETCHES',        1,  NULL,   ''),

    (1,     NULL,   1,  1,  2,      'Bench',                1,  45,     ''),
    (NULL,  NULL,   1,  1,  5,      'Chin-Ups',             2,  NULL,   ''),
    (NULL,  NULL,   1,  1,  1,      'Overhead Press',       3,  NULL,   ''),
    (NULL,  NULL,   1,  1,  1,      'Bicep Curls',          4,  NULL,   ''),
    (NULL,  NULL,   1,  1,  4,      'Rows',                 5,  NULL,   ''),
    (NULL,  1,      1,  1,  4,      'Tricep Extensions',    6,  NULL,   'Extended down varient'),

    (NULL,  NULL,   3,  2,  NULL,   'ALL STRETCHES',        1,  NULL,   ''),
    
    (NULL,  NULL,   2,  1,  4,      'Leg Curls',            1,  NULL,   'Try to hit 12 reps'),
    (NULL,  NULL,   2,  1,  4,      'Calf Raises',          2,  20,     ''),
    (NULL,  NULL,   2,  1,  4,      'Core push-ins',        3,  20,     ''),
    (NULL,  NULL,   2,  1,  4,      'Leg Press',            4,  50,     'Bruh'),
    (2,     NULL,   2,  1,  2,      'Squats',               5,  45,     ''),
    (NULL,  NULL,   2,  2,  NULL,   'Jog',                  6,  NULL,   '');

    

INSERT INTO "exercise_set" (exercise_id, title, list_order, reps, rest_time)
    VALUES
    
    (1,     'Warm-Up',      1,  5,      180),
    (1,     'Main Set',     2,  12,     180),
    (2,     'Main Set',     1,  15,     180),
    (3,     'Main Set',     1,  10,     180),
    (4,     'Main Set',     1,  12,     180),
    (5,     'Main Set',     1,  12,     180),
    (6,     'Main Set',     1,  16,     0),

    /* --- */

    (7,     'Main Set',     1,  12,     180),
    (8,     'Main Set',     1,  10,     180),
    (9,     'Main Set',     1,  16,     180),
    (10,    'Warm-Up',      1,  5,      180),
    (10,    'Main Set',     2,  12,     180),
    (11,    'Warm-Up',      1,  5,      180),
    (11,    'Main Set',     2,  12,     180),
    (12,    'Cool-Down',    1,  1,    0),

    (13,    '',             1,  1,    0),
    (14,    '',             1,  1,    0),

    (15,    'Warm-Up',      1,  5,      180),
    (15,    'Main Set',     2,  12,     180),
    (16,    'Main Set',     1,  15,     180),
    (17,    'Main Set',     1,  10,     180),
    (18,    'Main Set',     1,  12,     180),
    (19,    'Main Set',     1,  12,     180),
    (20,    'Main Set',     1,  16,     0),

    (21,    '',             1,  1,    0),

    (22,    'Main Set',     1,  12,     180),
    (23,    'Main Set',     1,  10,     180),
    (24,    'Main Set',     1,  16,     180),
    (25,    'Warm-Up',      1,  5,      180),
    (25,    'Main Set',     2,  12,     180),
    (26,    'Warm-Up',      1,  5,      180),
    (26,    'Main Set',     2,  12,     180),
    (27,    'Cool-Down',    1,  1,    0);


INSERT INTO resistance_set (exercise_set_id, total_weight)
    VALUES
    (1,     125),
    (2,     175),
    (3,     162),
    (4,     55),
    (5,     70),
    (6,     150),
    (7,     25),

    (8,     110),
    (9,     120),
    (10,    50),
    (11,    320),
    (12,    560),
    (13,    135),
    (14,    225),

    (18,     125),
    (19,     175),
    (20,     162),
    (21,     55),
    (22,     70),
    (23,     150),
    (24,     25),

    (26,     110),
    (27,     120),
    (28,    50),
    (29,    320),
    (30,    560),
    (31,    135),
    (32,    225);

INSERT INTO cardio_set (exercise_set_id, target_distance, target_speed, target_time)
    VALUES
    (15,    NULL,   NULL,   500),
    (16,    NULL,   NULL,   120),
    (17,    NULL,   NULL,   120),

    (25,    NULL,   NULL,   180),
    (33,    NULL,   NULL,   500);

INSERT INTO user_bodyweight (app_user_id, weight, date)
    VALUES
    (1, 158, '2023-11-07T14:12:34.000Z'),
    (1, 162, '2023-11-15T07:34:12.000Z');

INSERT INTO workout_days (workout_id, day)
    VALUES
    (1,'Tuesday'),
    (2,'Saturday');

INSERT INTO workout_session (app_user_id, title, date, calories, tied_to_workout)
    VALUES
    (1, 'Warmup Stretches',         '2023-11-07T14:12:34.000Z',   34,     False),
    (1, 'Upperbody',                '2023-11-07T16:20:34.000Z',   200,    True),
    (1, 'Legday workout + core',    '2023-11-15T07:34:12.000Z',   200,    True),
    (1, 'Upperbody',                '2023-11-15T03:45:12.000Z',   200,    False),

    (1, 'Daily Jog',                '2023-11-07T08:05:34.000Z',   134,    False),
    (1, 'Daily Jog',                '2023-11-11T17:05:03.000Z',   120,    False);

INSERT INTO exercise_session (workout_session_id, pr_history_id, exercise_type_id, title, list_order, initial_weight, was_completed)
    VALUES
    (2, 2,      1,  'Bench',                1,  45,     True), /*Upperbody*/
    (2, NULL,   1,  'Pull-Ups',             2,  162,    True),
    (2, NULL,   1,  'Overhead Press',       3,  NULL,   True),
    (2, NULL,   1,  'Bicep Curls',          4,  NULL,   True),
    (2, NULL,   1,  'Rows',                 5,  NULL,   True), 
    (2, 7,      1,  'Tricep Extensions',    6,  NULL,   True),

    (3, NULL,   1,  'Leg Curls',            1,  NULL,   True), /*Legs*/
    (3, NULL,   1,  'Calf Raises',          2,  20,     True),
    (3, NULL,   1,  'Core push-ins',        3,  20,     True),
    (3, NULL,   1,  'Leg Press',            4,  50,     True),
    (3, 4,      1,  'Squats',               5,  45,     True),
    (3, NULL,   2,  'Skipped Jog',          6,  NULL,   False);

INSERT INTO set_session (exercise_session_id, title, reps, list_order, elapsed_time, rest_time)
    VALUES
    (1,     'Warm Up',          5,      1,  18, 192),
    (1,     'Main Set',         12,     2,  47, 180),
    (2,     'Main Set',         15,     1,  63, 180),
    (3,     'Main Set',         10,     1,  52, 180),
    (4,     'Main Set',         12,     1,  49, 180),
    (5,     'Main Set',         12,     1,  72, 180),
    (6,     'Main Set',         16,     1,  174, 0),
    
    /* --- */

    (7,     'Main Set',         12,     1,  84, 180),
    (8,     'Main Set',         10,     1,  42, 180),
    (9,     'Main Set',         16,     1,  57, 180),
    (10,    'Warm-Up',          5,      1,  23, 180),
    (10,    'Main Set',         12,     2,  61, 180),
    (11,    'Warm-Up',          5,      1,  34, 180),
    (11,    'Main Set',         12,     2,  76, 180),
    (12,    'Cool-Down Jog',    420,    1,  0,  0);

INSERT INTO resistance_set_session (set_session_id, total_weight)
    VALUES
    (1,     125),
    (2,     175),
    (3,     162),
    (4,     55),
    (5,     70),
    (6,     150),
    (7,     25),

    (8,     110),
    (9,     120),
    (10,    50),
    (11,    320),
    (12,    560),
    (13,    135),
    (14,    225);

INSERT INTO cardio_set_session (set_session_id, target_distance, target_speed, target_time, actual_distance, actual_speed, actual_time)
    VALUES
    (15,    69, NULL,   69, 6969,   NULL,   6969);