import { relations } from "drizzle-orm/relations";
import {
  appUser,
  workoutTag,
  linkTagWorkout,
  workout,
  bodyPart,
  exerciseClass,
  exerciseEquipment,
  exerciseType,
  exercise,
  exerciseSet,
  resistanceSet,
  cardioSet,
  workoutSession,
  exerciseSession,
  setSession,
  userBodyweight,
  prHistory,
} from "./schema";

export const workoutTagRelations = relations(workoutTag, ({ one, many }) => ({
  appUser: one(appUser, {
    fields: [workoutTag.appUserId],
    references: [appUser.id],
  }),
  linkTagWorkouts: many(linkTagWorkout),
}));

export const appUserRelations = relations(appUser, ({ many }) => ({
  workoutTags: many(workoutTag),
  workouts: many(workout),
  exerciseClasses: many(exerciseClass),
  workoutSessions: many(workoutSession),
  userBodyweights: many(userBodyweight),
}));

export const linkTagWorkoutRelations = relations(linkTagWorkout, ({ one }) => ({
  workoutTag: one(workoutTag, {
    fields: [linkTagWorkout.workoutTagId],
    references: [workoutTag.id],
  }),
  workout: one(workout, {
    fields: [linkTagWorkout.workoutId],
    references: [workout.id],
  }),
}));

export const workoutRelations = relations(workout, ({ one, many }) => ({
  linkTagWorkouts: many(linkTagWorkout),
  appUser: one(appUser, {
    fields: [workout.appUserId],
    references: [appUser.id],
  }),
  exercises: many(exercise),
}));

export const exerciseClassRelations = relations(
  exerciseClass,
  ({ one, many }) => ({
    bodyPart: one(bodyPart, {
      fields: [exerciseClass.bodyPartId],
      references: [bodyPart.id],
    }),
    exerciseEquipment: one(exerciseEquipment, {
      fields: [exerciseClass.exerciseEquipmentId],
      references: [exerciseEquipment.id],
    }),
    exerciseType: one(exerciseType, {
      fields: [exerciseClass.exerciseTypeId],
      references: [exerciseType.id],
    }),
    appUser: one(appUser, {
      fields: [exerciseClass.appUserId],
      references: [appUser.id],
    }),
    exercises: many(exercise),
    exerciseSessions: many(exerciseSession),
    prHistories: many(prHistory),
  })
);

export const bodyPartRelations = relations(bodyPart, ({ many }) => ({
  exerciseClasses: many(exerciseClass),
}));

export const exerciseEquipmentRelations = relations(
  exerciseEquipment,
  ({ many }) => ({
    exerciseClasses: many(exerciseClass),
  })
);

export const exerciseTypeRelations = relations(exerciseType, ({ many }) => ({
  exerciseClasses: many(exerciseClass),
}));

export const exerciseRelations = relations(exercise, ({ one, many }) => ({
  exerciseClass: one(exerciseClass, {
    fields: [exercise.exerciseClassId],
    references: [exerciseClass.id],
  }),
  workout: one(workout, {
    fields: [exercise.workoutId],
    references: [workout.id],
  }),
  exerciseSets: many(exerciseSet),
}));

export const exerciseSetRelations = relations(exerciseSet, ({ one }) => ({
  exercise: one(exercise, {
    fields: [exerciseSet.exerciseId],
    references: [exercise.id],
  }),
  resistanceSets: one(resistanceSet),
  cardioSets: one(cardioSet),
}));

export const resistanceSetRelations = relations(resistanceSet, ({ one }) => ({
  exerciseSet: one(exerciseSet, {
    fields: [resistanceSet.exerciseSetId],
    references: [exerciseSet.id],
  }),
}));

export const cardioSetRelations = relations(cardioSet, ({ one }) => ({
  exerciseSet: one(exerciseSet, {
    fields: [cardioSet.exerciseSetId],
    references: [exerciseSet.id],
  }),
}));

export const workoutSessionRelations = relations(
  workoutSession,
  ({ one, many }) => ({
    appUser: one(appUser, {
      fields: [workoutSession.appUserId],
      references: [appUser.id],
    }),
    exerciseSessions: many(exerciseSession),
  })
);

export const exerciseSessionRelations = relations(
  exerciseSession,
  ({ one, many }) => ({
    exerciseClass: one(exerciseClass, {
      fields: [exerciseSession.exerciseClassId],
      references: [exerciseClass.id],
    }),
    workoutSession: one(workoutSession, {
      fields: [exerciseSession.workoutSessionId],
      references: [workoutSession.id],
    }),
    setSessions: many(setSession),
  })
);

export const setSessionRelations = relations(setSession, ({ one }) => ({
  exerciseSession: one(exerciseSession, {
    fields: [setSession.exerciseSessionId],
    references: [exerciseSession.id],
  }),
}));

export const userBodyweightRelations = relations(userBodyweight, ({ one }) => ({
  appUser: one(appUser, {
    fields: [userBodyweight.appUserId],
    references: [appUser.id],
  }),
}));

export const prHistoryRelations = relations(prHistory, ({ one }) => ({
  exerciseClass: one(exerciseClass, {
    fields: [prHistory.exerciseClassId],
    references: [exerciseClass.id],
  }),
}));
