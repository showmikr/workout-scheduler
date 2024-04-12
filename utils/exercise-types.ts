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

// Represent generic exercise with unknown type (i.e unknown if Resistance of Cardio)
export type ExerciseParams = {
  exercise_type_id: ExerciseEnums[keyof ExerciseEnums];
  exercise_id: number;
  title: string;
};

export type ResistanceSection = {
  exerciseType: ExerciseEnums["RESISTANCE_ENUM"];
  exercise: ExerciseParams;
  data: UnifiedResistanceSet[];
};
export type CardioSection = {
  exerciseType: ExerciseEnums["CARDIO_ENUM"];
  exercise: ExerciseParams;
  data: UnifiedCardioSet[];
};
export type ExerciseSection = ResistanceSection | CardioSection;
