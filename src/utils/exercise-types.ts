// hard coded constants based on the sqlite db table "exercise_type"
export const exerciseEnums = {
  RESISTANCE_ENUM: 1,
  CARDIO_ENUM: 2,
} as const;

// hard coded constants based on the sqlite db table "exercise_equipment"
export const equipmentEnums = {
  barbell: 1,
  dumbbell: 2,
  machine: 3,
  bodyweight: 4,
  other: 5,
} as const;

export const equipmentType = {
  1: "Barbell",
  2: "Dumbbell",
  3: "Machine",
  4: "Bodyweight",
  5: "Other",
} as const;

/// hard coded constants based on the sqlite db table "body_part"
export const bodyPartEnums = {
  chest: 1,
  arms: 2,
  back: 3,
  legs: 4,
  shoulders: 5,
  core: 6,
  fullBody: 7,
  other: 8,
} as const;

export const bodyPartType = {
  1: "Chest",
  2: "Arms",
  3: "Back",
  4: "Legs",
  5: "Shoulders",
  6: "Core",
  7: "Full Body",
  8: "Other",
} as const;

export type Workout = { id: number; title: string };

export type WorkoutStats = {
  totalExercises: number;
  totalSets: number;
};

export type ExerciseEnums = typeof exerciseEnums;

export type ExerciseClass = {
  id: number;
  exercise_type_id: number;
  exercise_equipment_id: number;
  body_part_id: number | null;
  title: string;
};

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
