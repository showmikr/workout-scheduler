-- ENFORCE FOREIGN KEY CONSTRAINTS --
PRAGMA foreign_keys = ON;

-- CREATE STATEMENTS BEGIN HERE --

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
  "creation_date" text NOT NULL, -- (represents ISO Date as string)
  "last_signed_in" text NOT NULL, -- (represents ISO Date as string)
  "avg_daily_calorie_goal" int,
  "bodyweight_goal" real,
  "user_height" real
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
  "last_session" text, -- (represents ISO Date as string)
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
  "exercise_class_id" bigint,
  "workout_id" bigint NOT NULL,
  "exercise_equipment_id" bigint,
  "list_order" int NOT NULL,
  "initial_weight" real,
  "notes" text,
  FOREIGN KEY ("exercise_equipment_id") REFERENCES "exercise_equipment" ("id"),
  FOREIGN KEY ("workout_id") REFERENCES "workout" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("exercise_class_id") REFERENCES "exercise_class" ("id") ON DELETE CASCADE
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
  "target_time" int,
  FOREIGN KEY ("exercise_set_id") REFERENCES "exercise_set" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "workout_session" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "title" text NOT NULL,
  "date" text NOT NULL, -- (represents ISO Date as string)
  "calories" int,
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "exercise_session" (
  "id" INTEGER PRIMARY KEY,
  "workout_session_id" bigint NOT NULL,
  "pr_history_id" bigint,
  "exercise_class_id" bigint NOT NULL,
  "list_order" int NOT NULL,
  "initial_weight" real,
  "was_completed" boolean NOT NULL DEFAULT false,
  FOREIGN KEY ("workout_session_id") REFERENCES "workout_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("pr_history_id") REFERENCES "pr_history" ("id") ON DELETE SET NULL,
  FOREIGN KEY ("exercise_class_id") REFERENCES "exercise_class" ("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "cardio_set_session" (
  "id" INTEGER PRIMARY KEY,
  "set_session_id" bigint NOT NULL,
  "target_distance" real,
  "target_time" int,
  "actual_distance" real,
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
  "date" text NOT NULL, -- (represents ISO Date as string)
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "exercise_class" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "exercise_type_id" bigint NOT NULL,
  "is_archived" boolean NOT NULL DEFAULT false,
  "title" text NOT NULL,
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("exercise_type_id") REFERENCES "exercise_type" ("id")
);

CREATE TABLE IF NOT EXISTS "pr_history" (
  "id" INTEGER PRIMARY KEY,
  "exercise_class_id" bigint NOT NULL,
  "weight" real,
  "reps" int,
  "distance" real,
  "time" int,
  "date" text NOT NULL, -- (represents ISO Date as string)
  FOREIGN KEY ("exercise_class_id") REFERENCES "exercise_class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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

-- END OF CREATE STATEMENTS --


-- INSERTS BEGIN HERE --

INSERT INTO days_of_week values 
  ('Monday'), 
  ('Tuesday'), 
  ('Wednesday'), 
  ('Thursday'), 
  ('Friday'), 
  ('Saturday'), 
  ('Sunday');

INSERT INTO app_user (aws_cognito_sub, first_name, last_name, user_name, email, email_verified, image_url, creation_date, last_signed_in, avg_daily_calorie_goal, bodyweight_goal, user_height)
  VALUES
	('c8bf7e34-7dcf-11ee-b962-0242ac120002', 'David', 'Shcherbina', 'kalashnikov', 'davidshcherbina@gmail.com', true, null, '2022-05-07T14:12:34.000Z', '2023-11-07T19:12:34.000Z', 150, 79.37866, 1.8288);

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

INSERT INTO exercise_class (app_user_id, exercise_type_id, title)
    VALUES
    (1, 1, 'Bench Press'),
    (1, 1, 'Chin-Ups'),
    (1, 1, 'Overhead Press'),
    (1, 1, 'Bicep Curls'),
    (1, 1, 'Rows'),
    (1, 1, 'Tricep Extensions'),
    (1, 1, 'Leg Curls'),
    (1, 1, 'Calf Raises'),
    (1, 1, 'Core Push-Ins'),
    (1, 1, 'Deadlift'),
    (1, 1, 'Squat'),
    (1, 2, 'Jog'),
    (1, 2, 'Stretches'),
    (1, 1, 'Leg Press');

INSERT INTO exercise_equipment (title)
    VALUES
    ('Dumbbell'),
    ('Adjustable Barbell'),
    ('Fixed-Weight Barbell'),
    ('Machine'),
    ('Bodyweight');

INSERT INTO pr_history (weight, reps, distance, time, date, exercise_class_id)
    VALUES
    (92.98644, 1, NULL, NULL, '2022-01-07T14:12:34.000Z', 1), -- should be Bench Press exercise_class
    (97.52236, 1, NULL, NULL, '2022-06-07T14:12:34.000Z', 1), -- should be Bench Press exercise_class
    (99.79032, 1, NULL, NULL, '2022-11-07T14:12:34.000Z', 1), -- should be Bench Press exercise_class
    (108.8622, 1, NULL, NULL, '2023-11-07T19:12:34.000Z', 1), -- should be Bench Press exercise_class

    (106.5942, 1, NULL, NULL, '2022-01-07T14:12:34.000Z', 11), -- should be Squat exercise_class
    (109.7694, 1, NULL, NULL, '2022-06-07T14:12:34.000Z', 11), -- should be Squat exercise_class
    (115.6661, 1, NULL, NULL, '2022-11-07T14:12:34.000Z', 11), -- should be Squat exercise_class
    (129.2738, 1, NULL, NULL, '2023-11-07T19:12:34.000Z', 11), -- should be Squat exercise_class

    (142.8816, 1, NULL, NULL, '2022-01-07T14:12:34.000Z', 10), -- should be Deadlift exercise_class
    (147.4175, 1, NULL, NULL, '2022-06-07T14:12:34.000Z', 10), -- should be Deadlift exercise_class
    (161.0253, 1, NULL, NULL, '2022-11-07T14:12:34.000Z', 10), -- should be Deadlift exercise_class
    (179.169, 1, NULL, NULL, '2023-11-07T19:12:34.000Z', 10), -- should be Deadlift exercise_class

    (13.60777, 12, NULL, NULL, '2022-11-07T14:12:34.000Z', 4); -- should be Bicep Curls exercise_class

INSERT INTO exercise (exercise_class_id, workout_id, exercise_equipment_id, list_order, initial_weight, notes)
    VALUES
    ( 1,  1,  2,     1,  45,    ''),
    ( 2,  1,  5,     2,  NULL,  ''),
    ( 3,  1,  1,     3,  NULL,  ''),
    ( 4,  1,  1,     4,  NULL,  ''),
    ( 5,  1,  4,     5,  NULL,  ''),
    ( 6,  1,  4,     6,  NULL,  'Extended down variant'),
    ( 7,  2,  4,     1,  NULL,  'Try to hit 12 reps'),
    ( 8,  2,  4,     2,  20,    ''),
    ( 9,  2,  4,     3,  20,    ''),
    (10,  2,  4,     4,  50,    'Bruh'),
    (11,  2,  2,     5,  45,    ''),
    (12,  2,  NULL,  6,  NULL,  ''),
    (13,  3,  NULL,  1,  NULL,  '');

INSERT INTO "exercise_set" (exercise_id, title, list_order, reps, rest_time)
    VALUES
    
    (1,     'Warm-Up',      1,  5,      180),
    (1,     'Main Set',     2,  12,     180),

    (2,     'Main Set',     1,  15,     180),
    (3,     'Main Set',     1,  10,     180),
    (4,     'Main Set',     1,  12,     180),
    (5,     'Main Set',     1,  12,     180),
    (6,     'Main Set',     1,  16,       0),
    (7,     'Main Set',     1,  12,     180),
    (8,     'Main Set',     1,  10,     180),
    (9,     'Main Set',     1,  16,     180),

    (10,    'Warm-Up',      1,  5,      180),
    (10,    'Main Set',     2,  12,     180),

    (11,    'Warm-Up',      1,  5,      180),
    (11,    'Main Set',     2,  12,     180),

    (12,    'Cool-Down',    1,  1,        0),
    (13,    '',             1,  1,        0);

INSERT INTO resistance_set (exercise_set_id, total_weight)
    VALUES
    (1,     56.69905),
    (2,     79.37866),
    (3,     73.48196),
    (4,     24.94758),
    (5,     31.75147),
    (6,     68.03886),
    (7,     11.33981),
    (8,     49.89516),
    (9,     54.43108),
    (10,    22.67962),
    (11,    145.1496),
    (12,    254.0117),
    (13,    61.23497),
    (14,    102.0583);

INSERT INTO cardio_set (exercise_set_id, target_distance, target_time)
    VALUES
    (12,    NULL,   500),
    (13,    NULL,   180);

INSERT INTO user_bodyweight (app_user_id, weight, date)
    VALUES
    (1, 74.38915,'2022-01-02T07:34:12'),
    (1, 76.65711,'2022-01-07T07:34:12'),
    (1, 75.74993,'2022-01-12T07:34:12'),
    (1, 72.57478,'2022-01-17T07:34:12'),
    (1, 76.65711,'2022-01-25T07:34:12'),
    (1, 73.93556,'2022-01-29T07:34:12'),
    (1, 72.12119,'2022-01-31T07:34:12'),
	
	  (1, 73.93556,'2022-02-02T07:34:12'),
    (1, 81.64663,'2022-02-07T07:34:12'),
    (1, 81.64663,'2022-02-12T07:34:12'),
    (1, 72.12119,'2022-02-17T07:34:12'),
    (1, 81.19303,'2022-02-25T07:34:12'),
    (1, 76.20352,'2022-02-29T07:34:12'),
    (1, 79.37866,'2022-02-31T07:34:12'),
	
	  (1, 79.83226,'2022-03-02T07:34:12'),
    (1, 80.28585,'2022-03-07T07:34:12'),
    (1, 76.20352,'2022-03-12T07:34:12'),
    (1, 80.73944,'2022-03-17T07:34:12'),
    (1, 74.38915,'2022-03-25T07:34:12'),
    (1, 75.74993,'2022-03-29T07:34:12'),
    (1, 80.73944,'2022-03-31T07:34:12'),
	
	  (1, 71.66759,'2022-04-02T07:34:12'),
    (1, 77.5643,'2022-04-07T07:34:12'),
    (1, 69.85322,'2022-04-12T07:34:12'),
    (1, 76.65711,'2022-04-17T07:34:12'),
    (1, 74.84274,'2022-04-25T07:34:12'),
    (1, 74.84274,'2022-04-29T07:34:12'),
    (1, 73.02837,'2022-04-31T07:34:12'),
	
	  (1, 71.214,'2022-05-02T07:34:12'),
    (1, 70.30682,'2022-05-07T07:34:12'),
    (1, 73.48196,'2022-05-12T07:34:12'),
    (1, 70.76041,'2022-05-17T07:34:12'),
    (1, 70.30682,'2022-05-25T07:34:12'),
    (1, 69.85322,'2022-05-29T07:34:12'),
    (1, 72.12119,'2022-05-31T07:34:12'),
	
	  (1, 73.48196,'2022-06-02T07:34:12'),
    (1, 71.66759,'2022-06-07T07:34:12'),
    (1, 73.48196,'2022-06-12T07:34:12'),
    (1, 71.66759,'2022-06-17T07:34:12'),
    (1, 73.02837,'2022-06-25T07:34:12'),
    (1, 73.48196,'2022-06-29T07:34:12'),
    (1, 72.12119,'2022-06-31T07:34:12'),
	
    (1, 72.57478,'2022-07-02T07:34:12'),
    (1, 73.48196,'2022-07-07T07:34:12'),
    (1, 72.57478,'2022-07-12T07:34:12'),
    (1, 72.57478,'2022-07-17T07:34:12'),
    (1, 72.57478,'2022-07-25T07:34:12'),
    (1, 73.93556,'2022-07-29T07:34:12'),
    (1, 74.38915,'2022-07-31T07:34:12'),
	
	  (1, 73.02837,'2022-08-02T07:34:12'),
    (1, 74.84274,'2022-08-07T07:34:12'),
    (1, 73.93556,'2022-08-12T07:34:12'),
    (1, 72.12119,'2022-08-17T07:34:12'),
    (1, 73.93556,'2022-08-25T07:34:12'),
    (1, 72.12119,'2022-08-29T07:34:12'),
    (1, 73.93556,'2022-08-31T07:34:12'),
	
	  (1, 73.48196,'2022-09-02T07:34:12'),
    (1, 75.74993,'2022-09-07T07:34:12'),
    (1, 77.1107,'2022-09-12T07:34:12'),
    (1, 76.20352,'2022-09-17T07:34:12'),
    (1, 75.74993,'2022-09-25T07:34:12'),
    (1, 76.20352,'2022-09-29T07:34:12'),
    (1, 76.65711,'2022-09-31T07:34:12'),
	
	  (1, 75.74993,'2022-10-02T07:34:12'),
    (1, 75.74993,'2022-10-07T07:34:12'),
    (1, 77.1107,'2022-10-12T07:34:12'),
    (1, 72.57478,'2022-10-17T07:34:12'),
    (1, 77.1107,'2022-10-25T07:34:12'),
    (1, 73.02837,'2022-10-29T07:34:12'),
    (1, 74.84274,'2022-10-31T07:34:12'),
	
	  (1, 73.93556,'2022-11-02T07:34:12'),
    (1, 76.65711,'2022-11-07T07:34:12'),
    (1, 73.02837,'2022-11-12T07:34:12'),
    (1, 77.1107,'2022-11-17T07:34:12'),
    (1, 73.93556,'2022-11-25T07:34:12'),
    (1, 73.93556,'2022-11-29T07:34:12'),
    (1, 73.48196,'2022-11-31T07:34:12'),
	
	  (1, 75.74993,'2022-12-02T07:34:12'),
    (1, 77.1107,'2022-12-07T07:34:12'),
    (1, 77.5643,'2022-12-12T07:34:12'),
    (1, 75.29633,'2022-12-17T07:34:12'),
    (1, 74.84274,'2022-12-25T07:34:12'),
    (1, 75.29633,'2022-12-29T07:34:12'),
    (1, 76.65711,'2022-12-31T07:34:12'),

	  (1, 75.74993,'2023-01-02T07:34:12'),
    (1, 77.5643,'2023-01-07T07:34:12'),
    (1, 75.29633,'2023-01-12T07:34:12'),
    (1, 78.01789,'2023-01-17T07:34:12'),
    (1, 77.1107,'2023-01-25T07:34:12'),
    (1, 77.1107,'2023-01-29T07:34:12'),
    (1, 75.74993,'2023-01-31T07:34:12'),
	
	  (1, 74.38915,'2023-02-02T07:34:12'),
    (1, 73.93556,'2023-02-07T07:34:12'),
    (1, 74.38915,'2023-02-12T07:34:12'),
    (1, 73.02837,'2023-02-17T07:34:12'),
    (1, 73.02837,'2023-02-25T07:34:12'),
    (1, 73.02837,'2023-02-29T07:34:12'),
    (1, 73.48196,'2023-02-31T07:34:12'),
	
	  (1, 74.38915,'2023-03-02T07:34:12'),
    (1, 73.48196,'2023-03-07T07:34:12'),
    (1, 72.12119,'2023-03-12T07:34:12'),
    (1, 73.48196,'2023-03-17T07:34:12'),
    (1, 72.12119,'2023-03-25T07:34:12'),
    (1, 73.48196,'2023-03-29T07:34:12'),
    (1, 73.02837,'2023-03-31T07:34:12'),
	
	  (1, 72.57478,'2023-04-02T07:34:12'),
    (1, 73.48196,'2023-04-07T07:34:12'),
    (1, 73.02837,'2023-04-12T07:34:12'),
    (1, 71.66759,'2023-04-17T07:34:12'),
    (1, 72.57478,'2023-04-25T07:34:12'),
    (1, 73.02837,'2023-04-29T07:34:12'),
    (1, 72.57478,'2023-04-31T07:34:12'),
	
	  (1, 69.85322,'2023-05-02T07:34:12'),
    (1, 71.214,'2023-05-07T07:34:12'),
    (1, 71.214,'2023-05-12T07:34:12'),
    (1, 69.39963,'2023-05-17T07:34:12'),
    (1, 67.58526,'2023-05-25T07:34:12'),
    (1, 68.03886,'2023-05-29T07:34:12'),
    (1, 72.12119,'2023-05-31T07:34:12'),
	
	  (1, 68.49245,'2023-06-02T07:34:12'),
    (1, 69.85322,'2023-06-07T07:34:12'),
    (1, 72.57478,'2023-06-12T07:34:12'),
    (1, 68.94604,'2023-06-17T07:34:12'),
    (1, 69.85322,'2023-06-25T07:34:12'),
    (1, 70.76041,'2023-06-29T07:34:12'),
    (1, 71.214,'2023-06-31T07:34:12'),
	
	  (1, 69.85322,'2023-07-02T07:34:12'),
    (1, 68.94604,'2023-07-07T07:34:12'),
    (1, 69.85322,'2023-07-12T07:34:12'),
    (1, 73.48196,'2023-07-17T07:34:12'),
    (1, 73.48196,'2023-07-25T07:34:12'),
    (1, 72.57478,'2023-07-29T07:34:12'),
    (1, 69.85322,'2023-07-31T07:34:12'),
	
	  (1, 71.66759,'2023-08-02T07:34:12'),
    (1, 71.66759,'2023-08-07T07:34:12'),
    (1, 70.30682,'2023-08-12T07:34:12'),
    (1, 73.02837,'2023-08-17T07:34:12'),
    (1, 71.66759,'2023-08-25T07:34:12'),
    (1, 70.76041,'2023-08-29T07:34:12'),
    (1, 69.85322,'2023-08-31T07:34:12'),
	
	  (1, 71.214,'2023-09-02T07:34:12'),
    (1, 72.57478,'2023-09-07T07:34:12'),
    (1, 74.84274,'2023-09-12T07:34:12'),
    (1, 73.93556,'2023-09-17T07:34:12'),
    (1, 72.57478,'2023-09-25T07:34:12'),
    (1, 74.84274,'2023-09-29T07:34:12'),
    (1, 73.48196,'2023-09-31T07:34:12'),
	
	  (1, 75.29633,'2023-10-02T07:34:12'),
    (1, 74.84274,'2023-10-07T07:34:12'),
    (1, 72.57478,'2023-10-12T07:34:12'),
    (1, 75.29633,'2023-10-17T07:34:12'),
    (1, 72.12119,'2023-10-25T07:34:12'),
    (1, 72.57478,'2023-10-29T07:34:12'),
    (1, 74.84274,'2023-10-31T07:34:12'),
    
    (1, 74.84274,'2023-11-07T14:12:34'),
    (1, 75.74993,'2023-11-07T14:12:34'),
    (1, 75.74993,'2023-11-15T07:34:12'),
    (1, 74.38915,'2023-11-15T07:34:12'),
    (1, 74.84274,'2023-11-07T14:12:34'),
    (1, 76.20352,'2023-11-11T17:05:03'),
    (1, 74.84274,'2023-11-23T07:34:12'),
    (1, 75.29633,'2023-11-28T07:34:12'),

    (1, 76.65711,'2023-12-02T07:34:12'),
    (1, 73.93556,'2023-12-07T07:34:12'),
    (1, 73.93556,'2023-12-12T07:34:12'),
    (1, 73.48196,'2023-12-17T07:34:12'),
    (1, 73.93556,'2023-12-25T07:34:12'),
    (1, 73.02837,'2023-12-29T07:34:12'),
    (1, 75.74993,'2023-12-31T07:34:12'),

    (1, 77.5643,'2024-01-03T07:34:12'),
    (1, 77.1107,'2024-01-10T07:34:12'),
    (1, 77.5643,'2024-01-13T07:34:12'),
    (1, 73.93556,'2024-01-17T07:34:12'),
    (1, 77.5643,'2024-01-20T07:34:12'),
    (1, 76.65711,'2024-01-24T07:34:12'),
    (1, 75.74993,'2024-01-27T07:34:12'),
    (1, 73.93556,'2024-01-31T07:34:12'),
    
    (1, 73.02837,'2024-02-03T07:34:12'),
    (1, 77.5643,'2024-02-05T07:34:12'),
    (1, 78.01789,'2024-02-05T09:34:12'),
    (1, 77.5643,'2024-02-07T07:34:12'),
    (1, 76.20352,'2024-02-10T07:34:12'),
    (1, 76.65711,'2024-02-14T07:34:12'),
    (1, 75.74993,'2024-02-17T07:34:12'),
    (1, 75.74993,'2024-02-22T07:34:12'),
    (1, 75.1149,'2024-02-28T07:34:12'),
    (1, 74.93346,'2024-03-11T07:34:12'),
    (1, 75.93136,'2024-03-21T07:34:12'),
    (1, 76.02208,'2024-03-22T07:34:12'),
    (1, 74.02627,'2024-04-02T07:34:12'),
    (1, 75.38705,'2024-04-05T07:34:12'),
    (1, 74.6613,'2024-04-05T07:34:12');

INSERT INTO workout_days (workout_id, day)
    VALUES
    (1,'Tuesday'),
    (2,'Saturday');

INSERT INTO workout_session (app_user_id, title, date, calories)
    VALUES
    (1, 'Upperbody',                '2022-01-02T07:34:12',   306),
    (1, 'Upperbody',                '2022-01-07T07:34:12',   142),
    (1, 'Upperbody',                '2022-01-12T07:34:12',   263),
    (1, 'Upperbody',                '2022-01-17T07:34:12',   384),
    (1, 'Upperbody',                '2022-01-25T07:34:12',   373),
    (1, 'Upperbody',                '2022-01-29T07:34:12',   147),
    (1, 'Upperbody',                '2022-01-31T07:34:12',   278),
	
	  (1, 'Upperbody',                '2022-02-02T07:34:12',   279),
    (1, 'Upperbody',                '2022-02-07T07:34:12',   103),
    (1, 'Upperbody',                '2022-02-12T07:34:12',   343),
    (1, 'Upperbody',                '2022-02-17T07:34:12',   339),
    (1, 'Upperbody',                '2022-02-25T07:34:12',   347),
    (1, 'Upperbody',                '2022-02-29T07:34:12',   236),
    (1, 'Upperbody',                '2022-02-31T07:34:12',    93),
	
	  (1, 'Upperbody',                '2022-03-02T07:34:12',   281),
    (1, 'Upperbody',                '2022-03-07T07:34:12',   316),
    (1, 'Upperbody',                '2022-03-12T07:34:12',   300),
    (1, 'Upperbody',                '2022-03-17T07:34:12',   386),
    (1, 'Upperbody',                '2022-03-25T07:34:12',   214),
    (1, 'Upperbody',                '2022-03-29T07:34:12',   247),
    (1, 'Upperbody',                '2022-03-31T07:34:12',   256),
	
	  (1, 'Upperbody',                '2022-04-02T07:34:12',   305),
    (1, 'Upperbody',                '2022-04-07T07:34:12',   394),
    (1, 'Upperbody',                '2022-04-12T07:34:12',   344),
    (1, 'Upperbody',                '2022-04-17T07:34:12',   238),
    (1, 'Upperbody',                '2022-04-25T07:34:12',   116),
    (1, 'Upperbody',                '2022-04-29T07:34:12',    90),
    (1, 'Upperbody',                '2022-04-31T07:34:12',    94),
	
	  (1, 'Upperbody',                '2022-05-02T07:34:12',   359),
    (1, 'Upperbody',                '2022-05-07T07:34:12',   265),
    (1, 'Upperbody',                '2022-05-12T07:34:12',   90),
    (1, 'Upperbody',                '2022-05-17T07:34:12',   341),
    (1, 'Upperbody',                '2022-05-25T07:34:12',   126),
    (1, 'Upperbody',                '2022-05-29T07:34:12',   185),
    (1, 'Upperbody',                '2022-05-31T07:34:12',   392),
	
	  (1, 'Upperbody',                '2022-06-02T07:34:12',   300),
    (1, 'Upperbody',                '2022-06-07T07:34:12',   118),
    (1, 'Upperbody',                '2022-06-12T07:34:12',   329),
    (1, 'Upperbody',                '2022-06-17T07:34:12',   110),
    (1, 'Upperbody',                '2022-06-25T07:34:12',   265),
    (1, 'Upperbody',                '2022-06-29T07:34:12',   158),
    (1, 'Upperbody',                '2022-06-31T07:34:12',   223),
	
	  (1, 'Upperbody',                '2022-07-02T07:34:12',   196),
    (1, 'Upperbody',                '2022-07-07T07:34:12',   201),
    (1, 'Upperbody',                '2022-07-12T07:34:12',   184),
    (1, 'Upperbody',                '2022-07-17T07:34:12',   389),
    (1, 'Upperbody',                '2022-07-25T07:34:12',   315),
    (1, 'Upperbody',                '2022-07-29T07:34:12',   255),
    (1, 'Upperbody',                '2022-07-31T07:34:12',   107),
	
	  (1, 'Upperbody',                '2022-08-02T07:34:12',   167),
    (1, 'Upperbody',                '2022-08-07T07:34:12',   389),
    (1, 'Upperbody',                '2022-08-12T07:34:12',   356),
    (1, 'Upperbody',                '2022-08-17T07:34:12',   312),
    (1, 'Upperbody',                '2022-08-25T07:34:12',   123),
    (1, 'Upperbody',                '2022-08-29T07:34:12',   251),
    (1, 'Upperbody',                '2022-08-31T07:34:12',   310),
	
	  (1, 'Upperbody',                '2022-09-02T07:34:12',   175),
    (1, 'Upperbody',                '2022-09-07T07:34:12',   132),
    (1, 'Upperbody',                '2022-09-12T07:34:12',   239),
    (1, 'Upperbody',                '2022-09-17T07:34:12',   157),
    (1, 'Upperbody',                '2022-09-25T07:34:12',   211),
    (1, 'Upperbody',                '2022-09-29T07:34:12',    87),
    (1, 'Upperbody',                '2022-09-31T07:34:12',   153),
	
	  (1, 'Upperbody',                '2022-10-02T07:34:12',   156),
    (1, 'Upperbody',                '2022-10-07T07:34:12',   298),
    (1, 'Upperbody',                '2022-10-12T07:34:12',   184),
    (1, 'Upperbody',                '2022-10-17T07:34:12',   277),
    (1, 'Upperbody',                '2022-10-25T07:34:12',    91),
    (1, 'Upperbody',                '2022-10-29T07:34:12',    99),
    (1, 'Upperbody',                '2022-10-31T07:34:12',   293),
	
	  (1, 'Upperbody',                '2022-11-02T07:34:12',   257),
    (1, 'Upperbody',                '2022-11-07T07:34:12',   271),
    (1, 'Upperbody',                '2022-11-12T07:34:12',   157),
    (1, 'Upperbody',                '2022-11-17T07:34:12',   223),
    (1, 'Upperbody',                '2022-11-25T07:34:12',   278),
    (1, 'Upperbody',                '2022-11-29T07:34:12',   128),
    (1, 'Upperbody',                '2022-11-31T07:34:12',    86),
	
	  (1 , 'Upperbody',                '2022-12-02T07:34:12',  237),
    (1, 'Upperbody',                '2022-12-07T07:34:12',   179),
    (1, 'Upperbody',                '2022-12-12T07:34:12',   145),
    (1, 'Upperbody',                '2022-12-17T07:34:12',   116),
    (1, 'Upperbody',                '2022-12-25T07:34:12',   204),
    (1, 'Upperbody',                '2022-12-29T07:34:12',   103),
    (1, 'Upperbody',                '2022-12-31T07:34:12',   281),

	  (1, 'Upperbody',                '2023-01-02T07:34:12',   115),
    (1, 'Upperbody',                '2023-01-07T07:34:12',   202),
    (1, 'Upperbody',                '2023-01-12T07:34:12',   182),
    (1, 'Upperbody',                '2023-01-17T07:34:12',   239),
    (1, 'Upperbody',                '2023-01-25T07:34:12',   227),
    (1, 'Upperbody',                '2023-01-29T07:34:12',   287),
    (1, 'Upperbody',                '2023-01-31T07:34:12',   170),
	
	  (1, 'Upperbody',                '2023-02-02T07:34:12',   152),
    (1, 'Upperbody',                '2023-02-07T07:34:12',   235),
    (1, 'Upperbody',                '2023-02-12T07:34:12',   282),
    (1, 'Upperbody',                '2023-02-17T07:34:12',   234),
    (1, 'Upperbody',                '2023-02-25T07:34:12',   296),
    (1, 'Upperbody',                '2023-02-29T07:34:12',   248),
    (1, 'Upperbody',                '2023-02-31T07:34:12',   343),
	
	  (1, 'Upperbody',                '2023-03-02T07:34:12',   330),
    (1, 'Upperbody',                '2023-03-07T07:34:12',   240),
    (1, 'Upperbody',                '2023-03-12T07:34:12',   283),
    (1, 'Upperbody',                '2023-03-17T07:34:12',   156),
    (1, 'Upperbody',                '2023-03-25T07:34:12',   331),
    (1, 'Upperbody',                '2023-03-29T07:34:12',   153),
    (1, 'Upperbody',                '2023-03-31T07:34:12',   290),
	
	  (1, 'Upperbody',                '2023-04-02T07:34:12',   151),
    (1, 'Upperbody',                '2023-04-07T07:34:12',   244),
    (1, 'Upperbody',                '2023-04-12T07:34:12',   180),
    (1, 'Upperbody',                '2023-04-17T07:34:12',   341),
    (1, 'Upperbody',                '2023-04-25T07:34:12',   234),
    (1, 'Upperbody',                '2023-04-29T07:34:12',   261),
    (1, 'Upperbody',                '2023-04-31T07:34:12',   318),
	
	  (1, 'Upperbody',                '2023-05-02T07:34:12',   179),
    (1, 'Upperbody',                '2023-05-07T07:34:12',   213),
    (1, 'Upperbody',                '2023-05-12T07:34:12',   182),
    (1, 'Upperbody',                '2023-05-17T07:34:12',   297),
    (1, 'Upperbody',                '2023-05-25T07:34:12',   243),
    (1, 'Upperbody',                '2023-05-29T07:34:12',   223),
    (1, 'Upperbody',                '2023-05-31T07:34:12',   337),
	
	  (1, 'Upperbody',                '2023-06-02T07:34:12',   177),
    (1, 'Upperbody',                '2023-06-07T07:34:12',   277),
    (1, 'Upperbody',                '2023-06-12T07:34:12',   180),
    (1, 'Upperbody',                '2023-06-17T07:34:12',   319),
    (1, 'Upperbody',                '2023-06-25T07:34:12',   420),
    (1, 'Upperbody',                '2023-06-29T07:34:12',   238),
    (1, 'Upperbody',                '2023-06-31T07:34:12',   287),
	
	  (1, 'Upperbody',                '2023-07-02T07:34:12',   187),
    (1, 'Upperbody',                '2023-07-07T07:34:12',   204),
    (1, 'Upperbody',                '2023-07-12T07:34:12',   230),
    (1, 'Upperbody',                '2023-07-17T07:34:12',   305),
    (1, 'Upperbody',                '2023-07-25T07:34:12',   302),
    (1, 'Upperbody',                '2023-07-29T07:34:12',   327),
    (1, 'Upperbody',                '2023-07-31T07:34:12',   238),
	
	  (1, 'Upperbody',                '2023-08-02T07:34:12',   345),
    (1, 'Upperbody',                '2023-08-07T07:34:12',   170),
    (1, 'Upperbody',                '2023-08-12T07:34:12',   188),
    (1, 'Upperbody',                '2023-08-17T07:34:12',   181),
    (1, 'Upperbody',                '2023-08-25T07:34:12',   324),
    (1, 'Upperbody',                '2023-08-29T07:34:12',   278),
    (1, 'Upperbody',                '2023-08-31T07:34:12',   213),
	
	  (1, 'Upperbody',                '2023-09-02T07:34:12',   223),
    (1, 'Upperbody',                '2023-09-07T07:34:12',   224),
    (1, 'Upperbody',                '2023-09-12T07:34:12',   150),
    (1, 'Upperbody',                '2023-09-17T07:34:12',   295),
    (1, 'Upperbody',                '2023-09-25T07:34:12',   260),
    (1, 'Upperbody',                '2023-09-29T07:34:12',   169),
    (1, 'Upperbody',                '2023-09-31T07:34:12',   288),
	
	  (1, 'Upperbody',                '2023-10-02T07:34:12',   296),
    (1, 'Upperbody',                '2023-10-07T07:34:12',   261),
    (1, 'Upperbody',                '2023-10-12T07:34:12',   198),
    (1, 'Upperbody',                '2023-10-17T07:34:12',   318),
    (1, 'Upperbody',                '2023-10-25T07:34:12',   190),
    (1, 'Upperbody',                '2023-10-29T07:34:12',   183),
    (1, 'Upperbody',                '2023-10-31T07:34:12',   310),
    
    (1, 'Warmup Stretches',         '2023-11-07T14:12:34',    34),
    (1, 'Upperbody',                '2023-11-07T14:12:34',   205), /* id: 156 */
    (1, 'Daily Jog',                '2023-11-07T14:12:34',   134),
    (1, 'Daily Jog',                '2023-11-11T17:05:03',   120),
    (1, 'Legday workout + core',    '2023-11-15T07:34:12',   204), /* id: 159 */
    (1, 'Upperbody',                '2023-11-15T07:34:12',   203),
    (1, 'Upperbody',                '2023-11-23T07:34:12',   296),
    (1, 'Upperbody',                '2023-11-28T07:34:12',   274),

    (1, 'Upperbody',                '2023-12-02T07:34:12',   203),
    (1, 'Upperbody',                '2023-12-07T07:34:12',   108),
    (1, 'Upperbody',                '2023-12-12T07:34:12',   253),
    (1, 'Upperbody',                '2023-12-17T07:34:12',   393),
    (1, 'Upperbody',                '2023-12-25T07:34:12',   169),
    (1, 'Upperbody',                '2023-12-29T07:34:12',   222),
    (1, 'Upperbody',                '2023-12-31T07:34:12',   257),

    (1, 'Upperbody',                '2024-01-03T07:34:12',   247),
    (1, 'Upperbody',                '2024-01-10T07:34:12',   332),
    (1, 'Upperbody',                '2024-01-13T07:34:12',   202),
    (1, 'Upperbody',                '2024-01-17T07:34:12',   355),
    (1, 'Upperbody',                '2024-01-20T07:34:12',   509),
    (1, 'Upperbody',                '2024-01-24T07:34:12',   271),
    (1, 'Upperbody',                '2024-01-27T07:34:12',   261),
    (1, 'Upperbody',                '2024-01-31T07:34:12',   440),

    (1, 'Upperbody',                '2024-02-03T07:34:12',   322),
    (1, 'Upperbody',                '2024-02-05T07:34:12',   322),
    (1, 'Upperbody',                '2024-02-05T09:34:12',   402),
    (1, 'Upperbody',                '2024-02-07T07:34:12',   244),
    (1, 'Upperbody',                '2024-02-10T07:34:12',   286),
    (1, 'Upperbody',                '2024-02-14T07:34:12',   329),
    (1, 'Upperbody',                '2024-02-17T07:34:12',   150),
    (1, 'Upperbody',                '2024-02-19T07:34:12',   230), /* id: 185 */
    (1, 'Upperbody',                '2024-02-20T07:34:12',   403), /* id: 186 */
    (1, 'Upperbody',                '2024-02-24T07:34:12',   255),
    (1, 'Upperbody',                '2024-02-28T17:25:12',   313),

    (1, 'Upperbody',                '2024-03-02T17:25:12',   357),
    (1, 'Upperbody',                '2024-03-09T17:25:12',   150),
    (1, 'Upperbody',                '2024-03-12T17:25:12',   222),
    (1, 'Upperbody',                '2024-03-20T17:25:12',   97),
    (1, 'Upperbody',                '2024-03-23T17:25:12',   342),
    (1, 'Upperbody',                '2024-03-27T17:25:12',   186),
    (1, 'Upperbody',                '2024-03-30T17:25:12',   373);

INSERT INTO exercise_session (workout_session_id, pr_history_id, list_order, initial_weight, was_completed, exercise_class_id)
    VALUES
    (156, 2,     1,  20.41166,     True,  1), /*Upperbody*/
    (156, NULL,  2,  NULL,   True,  3),
    (156, NULL,  3,  NULL,   True,  4),
    (156, NULL,  4,  NULL,   True,  5), 
    (156, 7,     5,  NULL,   True,  6),

    (159, NULL,  1,  NULL,   True,  7), /*Legs*/
    (159, NULL,  2,  9.071847,     True,  8),
    (159, NULL,  3,  9.071847,     True,  9),
    (159, NULL,  4,  22.67962,     True,  10),
    (159, 4,     5,  20.41166,     True,  11),
    (159, NULL,  6,  NULL,   False, 12),

    (185, 2,     1,  20.41166,     True,  1), /*Upperbody*/
    (185, NULL,  2,  NULL,   True,  3),
    (185, NULL,  3,  NULL,   True,  4),
    (185, NULL,  4,  NULL,   True,  5), 
    (185, 7,     5,  NULL,   True,  6),
    
    (186, 2,     1,  20.41166,     True,  1), /*Upperbody*/
    (186, NULL,  2,  NULL,   True,  3),
    (186, NULL,  3,  NULL,   True,  4),
    (186, NULL,  4,  NULL,   True,  5), 
    (186, 7,     5,  NULL,   True,  6);

INSERT INTO set_session (exercise_session_id, title, reps, list_order, elapsed_time, rest_time)
    VALUES
    (1,     'Warm Up',          5,      1,  18, 192),
    (1,     'Main Set',         12,     2,  47, 180),
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
    (12,    'Cool-Down Jog',    420,    1,  0,  0),

    (13,     'Warm Up',          5,      1,  18, 192),
    (13,     'Main Set',         12,     2,  47, 180),
    (15,     'Main Set',         10,     1,  52, 180),
    (16,     'Main Set',         12,     1,  49, 180),
    (17,     'Main Set',         12,     1,  72, 180),
    (18,     'Main Set',         16,     1,  174, 0),
    
    (19,     'Warm Up',          5,      1,  18, 192),
    (19,     'Main Set',         12,     2,  47, 180),
    (21,     'Main Set',         10,     1,  52, 180);

INSERT INTO resistance_set_session (set_session_id, total_weight)
    VALUES
    (1,     56.69905),
    (2,     79.37866),
    (3,     73.48196),
    (4,     24.94758),
    (5,     31.75147),
    (6,     68.03886),
    (7,     11.33981),

    (8,     49.89516),
    (9,     54.43108),
    (10,    22.67962),
    (11,    145.1496),
    (12,    254.0117),
    (13,    61.23497),
    (14,    102.0583),

    (16,     56.69905),
    (17,     79.37866),
    (18,     73.48196),
    (19,     24.94758),
    (20,     31.75147),
    (21,     68.03886),
    (22,     11.33981),
    (23,     56.69905);

INSERT INTO cardio_set_session (set_session_id, target_distance, target_time, actual_distance, actual_time)
    VALUES
    (15, 69, 69, 6969, 6969);