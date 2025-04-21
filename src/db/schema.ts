import {
  sqliteTable,
  text,
  integer,
  numeric,
  real,
} from "drizzle-orm/sqlite-core";

export const appUser = sqliteTable("app_user", {
  id: integer().primaryKey(),
  awsCognitoSub: numeric("aws_cognito_sub", { mode: "string" })
    .unique()
    .notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  userName: text("user_name"),
  email: text().notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  imageUrl: text("image_url"),
  creationDate: text("creation_date").notNull(),
  lastSignedIn: text("last_signed_in").notNull(),
  avgDailyCalorieGoal: integer("avg_daily_calorie_goal"),
  bodyweightGoal: real("bodyweight_goal"),
  userHeight: real("user_height"),
});

export const exerciseType = sqliteTable("exercise_type", {
  id: integer().primaryKey(),
  title: text().notNull(),
});

export const exerciseEquipment = sqliteTable("exercise_equipment", {
  id: integer().primaryKey(),
  title: text().notNull(),
});

export const bodyPart = sqliteTable("body_part", {
  id: integer().primaryKey(),
  title: text().notNull(),
});

export const workoutTag = sqliteTable("workout_tag", {
  id: integer().primaryKey(),
  appUserId: integer("app_user_id")
    .notNull()
    .references(() => appUser.id, { onDelete: "cascade", onUpdate: "cascade" }),
  title: text().notNull(),
});

export const linkTagWorkout = sqliteTable("link_tag_workout", {
  id: integer().primaryKey(),
  workoutTagId: integer("workout_tag_id")
    .notNull()
    .references(() => workoutTag.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workout.id),
});

export const workout = sqliteTable("workout", {
  id: integer().primaryKey(),
  appUserId: integer("app_user_id")
    .notNull()
    .references(() => appUser.id, { onDelete: "cascade", onUpdate: "cascade" }),
  title: text().notNull(),
  listOrder: integer("list_order").notNull(),
  lastSession: text("last_session"),
});

export const exerciseClass = sqliteTable("exercise_class", {
  id: integer().primaryKey(),
  appUserId: integer("app_user_id")
    .notNull()
    .references(() => appUser.id, { onDelete: "cascade", onUpdate: "cascade" }),
  exerciseTypeId: integer("exercise_type_id")
    .notNull()
    .references(() => exerciseType.id),
  exerciseEquipmentId: integer("exercise_equipment_id")
    .notNull()
    .references(() => exerciseEquipment.id),
  bodyPartId: integer("body_part_id").references(() => bodyPart.id),
  isArchived: integer("is_archived", { mode: "boolean" })
    .notNull()
    .default(false),
  title: text().notNull(),
});

export const exercise = sqliteTable("exercise", {
  id: integer().primaryKey(),
  exerciseClassId: integer("exercise_class_id")
    .notNull()
    .references(() => exerciseClass.id, { onDelete: "cascade" }),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workout.id, { onDelete: "cascade", onUpdate: "cascade" }),
  listOrder: integer("list_order").notNull(),
  initialWeight: real("initial_weight"),
  notes: text(),
});

export const exerciseSet = sqliteTable("exercise_set", {
  id: integer().primaryKey(),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercise.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  title: text(),
  listOrder: integer("list_order").notNull(),
  reps: integer().default(1).notNull(),
  restTime: integer("rest_time").default(0).notNull(),
});

export const resistanceSet = sqliteTable("resistance_set", {
  id: integer().primaryKey(),
  exerciseSetId: integer("exercise_set_id")
    .notNull()
    .references(() => exerciseSet.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  totalWeight: real("total_weight"),
});

export const cardioSet = sqliteTable("cardio_set", {
  id: integer().primaryKey(),
  exerciseSetId: integer("exercise_set_id")
    .notNull()
    .references(() => exerciseSet.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  targetDistance: real("target_distance"),
  targetTime: integer("target_time"),
});

export const workoutSession = sqliteTable("workout_session", {
  id: integer().primaryKey(),
  appUserId: integer("app_user_id")
    .notNull()
    .references(() => appUser.id, { onDelete: "cascade", onUpdate: "cascade" }),
  title: text().default("Custom Workout").notNull(),
  startedOn: text("started_on").notNull(),
  endedOn: text("ended_on").notNull(),
  calories: integer(),
});

export const exerciseSession = sqliteTable("exercise_session", {
  id: integer().primaryKey(),
  workoutSessionId: integer("workout_session_id")
    .notNull()
    .references(() => workoutSession.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  exerciseClassId: integer("exercise_class_id")
    .notNull()
    .references(() => exerciseClass.id, { onDelete: "set null" }),
});

export const setSession = sqliteTable("set_session", {
  id: integer().primaryKey(),
  exerciseSessionId: integer("exercise_session_id")
    .notNull()
    .references(() => exerciseSession.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  reps: integer().default(1).notNull(),
  restTime: integer("rest_time").default(0).notNull(),
  completed: integer({ mode: "boolean" }).notNull(),
  setType: integer("set_type").notNull(),
  totalWeight: real("total_weight"),
  targetDistance: real("target_distance"),
  targetTime: integer("target_time"),
  actualDistance: real("actual_distance"),
  actualTime: integer("actual_time"),
});

export const userBodyweight = sqliteTable("user_bodyweight", {
  id: integer().primaryKey(),
  appUserId: integer("app_user_id")
    .notNull()
    .references(() => appUser.id, { onDelete: "cascade", onUpdate: "cascade" }),
  weight: real().notNull(),
  date: text().notNull(),
});

export const prHistory = sqliteTable("pr_history", {
  id: integer().primaryKey(),
  exerciseClassId: integer("exercise_class_id")
    .notNull()
    .references(() => exerciseClass.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  weight: real(),
  reps: integer(),
  distance: real(),
  time: integer(),
  date: text().notNull(),
});
