// hard coded constants based on the sqlite db table "exercise_type"
export const exerciseEnums = {
  RESISTANCE_ENUM: 1,
  CARDIO_ENUM: 2,
} as const;

export type ExerciseEnums = typeof exerciseEnums;

export type ExerciseSetParams = {
  exercise_set_id: number;
  list_order: number;
  reps: number;
  rest_time: number;
  title: string | null;
};
export type ResistanceSetParams = {
  resistance_set_id: number;
  total_weight: number;
};
export type CardioSetParams = {
  cardio_set_id: number;
  target_distance: number | null;
  target_time: number | null;
};
export type UnifiedResistanceSet = ExerciseSetParams & ResistanceSetParams;
export type UnifiedCardioSet = ExerciseSetParams & CardioSetParams;

export type ResistanceSection = {
  exercise_type_id: ExerciseEnums["RESISTANCE_ENUM"];
  exercise_class_id: number;
  exercise_id: number;
  title: string;
  sets: UnifiedResistanceSet[];
};

export type CardioSection = {
  exercise_type_id: ExerciseEnums["CARDIO_ENUM"];
  exercise_class_id: number;
  exercise_id: number;
  title: string;
  sets: UnifiedCardioSet[];
};
