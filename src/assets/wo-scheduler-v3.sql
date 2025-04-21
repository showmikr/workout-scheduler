-- ENFORCE FOREIGN KEY CONSTRAINTS --
PRAGMA foreign_keys = ON;

-- CREATE STATEMENTS BEGIN HERE --

CREATE TABLE IF NOT EXISTS "app_user" (
  "id" INTEGER PRIMARY KEY,
  "aws_cognito_sub" uuid UNIQUE NOT NULL,
  "first_name" text,
  "last_name" text,
  "user_name" text,
  "email" text NOT NULL,
  "email_verified" boolean NOT NULL DEFAULT false,
  "image_url" text,
  "creation_date" text NOT NULL, -- represents ISO 8601 date YYYY-MM-DDTHH:MM:SS.SSSZ
  "last_signed_in" text NOT NULL, -- represents ISO 8601 date YYYY-MM-DDTHH:MM:SS.SSSZ
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

CREATE TABLE IF NOT EXISTS "body_part" (
  "id" INTEGER PRIMARY KEY,
  "title" text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "workout_tag" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "title" text UNIQUE NOT NULL,
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
  "title" text NOT NULL,
  "list_order" int NOT NULL,
  "last_session" text, -- represents ISO 8601 date YYYY-MM-DDTHH:MM:SS.SSSZ
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "exercise_class" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "exercise_type_id" bigint NOT NULL,
  "exercise_equipment_id" bigint NOT NULL,
  "body_part_id" bigint,
  "is_archived" boolean NOT NULL DEFAULT false,
  "title" text NOT NULL,
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("exercise_type_id") REFERENCES "exercise_type" ("id"),
  FOREIGN KEY ("exercise_equipment_id") REFERENCES "exercise_equipment" ("id"),
  FOREIGN KEY ("body_part_id") REFERENCES "body_part" ("id")
);

CREATE TABLE IF NOT EXISTS "exercise" (
  "id" INTEGER PRIMARY KEY,
  "exercise_class_id" bigint NOT NULL,
  "workout_id" bigint NOT NULL,
  "list_order" int NOT NULL,
  "initial_weight" real,
  "notes" text,
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
  "title" text NOT NULL DEFAULT 'Custom Workout',
  "started_on" text NOT NULL, -- represents ISO 8601 date YYYY-MM-DDTHH:MM:SS.SSSZ
  "ended_on" text NOT NULL, -- represents ISO 8601 date YYYY-MM-DDTHH:MM:SS.SSSZ
  "calories" int,
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "exercise_session" (
  "id" INTEGER PRIMARY KEY,
  "workout_session_id" bigint NOT NULL,
  "exercise_class_id" bigint NOT NULL,
  FOREIGN KEY ("workout_session_id") REFERENCES "workout_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("exercise_class_id") REFERENCES "exercise_class" ("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "set_session" (
  "id" INTEGER PRIMARY KEY,
  "exercise_session_id" bigint NOT NULL,
  "reps" int NOT NULL DEFAULT 1,
  "rest_time" int NOT NULL DEFAULT 0,
  "completed" boolean NOT NULL DEFAULT false,
  "set_type" int NOT NULL, -- 1 = resistance, 2 = cardio
  "total_weight" real,
  "target_distance" real,
  "target_time" int,
  "actual_distance" real,
  "actual_time" int,
  CHECK (
    (set_type = 1 AND total_weight IS NOT NULL)
    OR
    (set_type = 2 AND total_weight IS NULL)
  ),
  FOREIGN KEY ("exercise_session_id") REFERENCES "exercise_session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "user_bodyweight" (
  "id" INTEGER PRIMARY KEY,
  "app_user_id" bigint NOT NULL,
  "weight" real NOT NULL,
  "date" text NOT NULL, -- represents ISO 8601 date YYYY-MM-DDTHH:MM:SS.SSSZ
  FOREIGN KEY ("app_user_id") REFERENCES "app_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "pr_history" (
  "id" INTEGER PRIMARY KEY,
  "exercise_class_id" bigint NOT NULL,
  "weight" real,
  "reps" int,
  "distance" real,
  "time" int,
  "date" text NOT NULL, -- represents ISO 8601 date YYYY-MM-DDTHH:MM:SS.SSSZ
  FOREIGN KEY ("exercise_class_id") REFERENCES "exercise_class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- END OF CREATE STATEMENTS --


-- INSERTS BEGIN HERE --

INSERT INTO app_user (aws_cognito_sub, first_name, last_name, user_name, email, email_verified, image_url, creation_date, last_signed_in, avg_daily_calorie_goal, bodyweight_goal, user_height)
  VALUES
	('c8bf7e34-7dcf-11ee-b962-0242ac120002', 'David', 'Shcherbina', 'kalashnikov', 'davidshcherbina@gmail.com', true, null, '2022-05-07T14:12:34.000Z', '2023-11-07T19:12:34.000Z', 150, 79.37866, 1.8288);

INSERT INTO workout (app_user_id, title, list_order, last_session)
    VALUES
    (1, 'Upperbody',                1,  '2023-11-28T22:40:00.000Z'),
    (1, 'Legday workout + core',    2,  '2023-12-02T17:15:00.000Z'),
    (1, 'Warmup Stretches',         3,  '2022-11-28T22:40:00.000Z');

INSERT INTO workout_tag (app_user_id, title)
    VALUES
    (1, 'Upper Body'),
    (1, 'Lower Body');

INSERT INTO link_tag_workout (workout_tag_id, workout_id)
    VALUES
    (1, 1),
    (1, 3),
    (2, 2),
    (2, 3);

INSERT INTO exercise_type (title)
    VALUES
    ('Resistance'),
    ('Cardiovascular');

INSERT INTO exercise_equipment (title)
    VALUES
    ('Barbell'),
    ('Dumbbell'),
    ('Machine'),
    ('Bodyweight'),
    ('Other');

INSERT INTO body_part (title)
    VALUES
    ('Chest'),
    ('Arms'),
    ('Back'),
    ('Legs'),
    ('Shoulders'),
    ('Core'),
    ('Full Body'),
    ('Other');

INSERT INTO exercise_class (app_user_id, exercise_type_id, exercise_equipment_id, body_part_id, title)
    VALUES
    (1, 1, 1, 1, 'Bench Press'),
    (1, 1, 4, 3, 'Chin-Ups'),
    (1, 1, 1, 5, 'Overhead Press'),
    (1, 1, 2, 2, 'Bicep Curls'),
    (1, 1, 1, 3, 'Rows'),
    (1, 1, 3, 2, 'Tricep Extensions'),
    (1, 1, 3, 4, 'Leg Curls'),
    (1, 1, 3, 4, 'Calf Raises'),
    (1, 1, 4, 6, 'Core Push-Ins'),
    (1, 1, 1, 7, 'Deadlift'),
    (1, 1, 1, 4, 'Squat'),
    (1, 2, 4, 8, 'Jog'),
    (1, 2, 4, 8, 'Stretches'),
    (1, 1, 3, 4, 'Leg Press');

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

INSERT INTO exercise (exercise_class_id, workout_id, list_order, initial_weight, notes)
    VALUES
    ( 1,  1,  1,  45,    NULL),
    ( 2,  1,  2,  NULL,  NULL),
    ( 3,  1,  3,  NULL,  NULL),
    ( 4,  1,  4,  NULL,  NULL),
    ( 5,  1,  5,  NULL,  NULL),
    ( 6,  1,  6,  NULL,  'Extended down variant'),
    ( 7,  2,  1,  NULL,  'Try to hit 12 reps'),
    ( 8,  2,  2,  20,    NULL),
    ( 9,  2,  3,  20,    NULL),
    (10,  2,  4,  50,    'Bruh'),
    (11,  2,  5,  45,    NULL),
    (12,  2,  6,  NULL,  NULL),
    (13,  3,  1,  NULL,  NULL);

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
    (1, 74.6613,'2024-04-08T07:34:12'),
    (1, 73.84484,'2024-04-10T07:34:12'),
    (1, 72.84693,'2024-04-12T07:34:12'),
    (1, 73.75412,'2024-04-20T07:34:12'),
    (1, 75.1149,'2024-04-22T07:34:12');

-- Create temporary table for dates
CREATE TEMPORARY TABLE dates(date TEXT);

-- Insert dates for the past year
WITH RECURSIVE date_range(date) AS (
  SELECT date('now', '-1 year')
  UNION ALL
  SELECT date(date, '+1 day')
  FROM date_range
  WHERE date < date('now')
)
INSERT INTO dates(date)
SELECT date FROM date_range;

CREATE TEMPORARY TABLE workout_sessions(
    app_user_id INTEGER,
    title_id INTEGER,
    started_on TEXT,
    ended_on TEXT,
    calories INTEGER
);
INSERT INTO workout_sessions
SELECT
    1 as app_user_id,
    (ABS(random()) % 7 + 1) as title_id,
    date as started_on,
    datetime(date, '+' || (20 + ABS(random()) % 161) || ' minutes') as ended_on,
    80 + ABS(random()) % 421 as calories
FROM dates
LIMIT 200;


CREATE TEMPORARY TABLE exercise_sessions(
    workout_session_id INTEGER,
    exercise_class_id INTEGER,
    exercise_order INTEGER
);
INSERT INTO exercise_sessions
SELECT
    ws.rowid as workout_session_id,
    ec.id as exercise_class_id,
    ROW_NUMBER() OVER (PARTITION BY ws.rowid ORDER BY random()) as exercise_order
FROM workout_sessions ws
CROSS JOIN exercise_class ec
WHERE ec.exercise_type_id = 1
AND ec.app_user_id = 1;

CREATE TEMPORARY TABLE set_sessions(
    workout_session_id INTEGER,
    exercise_class_id INTEGER,
    reps INTEGER,
    rest_time INTEGER,
    completed INTEGER,
    set_type INTEGER,
    total_weight REAL,
    set_order INTEGER
);
INSERT INTO set_sessions
SELECT
    es.workout_session_id,
    es.exercise_class_id,
    2 + ABS(random()) % 19 as reps,
    ABS(random()) % 211 as rest_time,
    CASE WHEN random() < 0.1 THEN 0 ELSE 1 END as completed,
    1 as set_type,
    20 + ABS(random()) % 81 as total_weight,
    ROW_NUMBER() OVER (PARTITION BY es.workout_session_id, es.exercise_class_id ORDER BY random()) as set_order
FROM exercise_sessions es
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) nums;

-- Insert workout sessions
INSERT INTO workout_session (app_user_id, title, started_on, ended_on, calories)
SELECT
    app_user_id,
    CASE title_id
        WHEN 1 THEN 'Full Body'
        WHEN 2 THEN 'Custom Workout'
        WHEN 3 THEN 'Back Day'
        WHEN 4 THEN 'Chest Day'
        WHEN 5 THEN 'Leg Day'
        WHEN 6 THEN 'Arm Day'
        WHEN 7 THEN 'Power Lifting'
    END as title,
    started_on,
    ended_on,
    calories
FROM workout_sessions;

-- Insert exercise sessions
INSERT INTO exercise_session (workout_session_id, exercise_class_id)
SELECT workout_session_id, exercise_class_id
FROM exercise_sessions
WHERE exercise_order <= 3 + ABS(random()) % 3;

-- Insert set sessions
INSERT INTO set_session (exercise_session_id, reps, rest_time, completed, set_type, total_weight)
SELECT
    es.id,
    ss.reps,
    ss.rest_time,
    ss.completed,
    ss.set_type,
    ss.total_weight
FROM set_sessions ss
JOIN exercise_session es ON ss.workout_session_id = es.workout_session_id AND ss.exercise_class_id = es.exercise_class_id
WHERE ss.set_order <= 3 + ABS(random()) % 3;

-- Drop temporary tables
DROP TABLE dates;
DROP TABLE workout_sessions;
DROP TABLE exercise_sessions;
DROP TABLE set_sessions;

