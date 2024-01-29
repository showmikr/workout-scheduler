/*
 * This file was generated by a tool.
 * Rerun sql-ts to regenerate this file.
 */
export interface AppUser {
  avg_daily_calorie_goal?: number | null;
  aws_cognito_sub: string;
  bodyweight_goal?: number | null;
  creation_date: string;
  email: string;
  email_verified?: boolean;
  first_name?: string | null;
  id?: number | null;
  image_url?: string | null;
  last_name?: string | null;
  last_signed_in: string;
  user_name?: string | null;
}
export interface CardioSet {
  exercise_set_id: string;
  id?: number | null;
  target_distance?: number | null;
  target_speed?: number | null;
  target_time?: number | null;
}
export interface CardioSetSession {
  actual_distance?: number | null;
  actual_speed?: number | null;
  actual_time?: number | null;
  id?: number | null;
  set_session_id: string;
  target_distance?: number | null;
  target_speed?: number | null;
  target_time?: number | null;
}
export interface CustomCategoryPr {
  custom_category_pr_id: string;
  id?: number | null;
  pr_history_id: string;
}
export interface CustomExerciseCategory {
  app_user_id: string;
  id?: number | null;
  title: string;
}
export interface DaysOfWeek {
  day: string;
}
export interface Exercise {
  custom_exercise_category_id?: string | null;
  exercise_equipment_id?: string | null;
  exercise_type_id: string;
  id?: number | null;
  initial_weight?: number | null;
  list_order: number;
  notes?: string | null;
  standard_exercise_category_id?: string | null;
  title: string;
  workout_id: string;
}
export interface ExerciseEquipment {
  id?: number | null;
  title: string;
}
export interface ExerciseSession {
  exercise_type_id: string;
  id?: number | null;
  initial_weight?: number | null;
  list_order: number;
  pr_history_id?: string | null;
  title: string;
  was_completed?: boolean;
  workout_session_id: string;
}
export interface ExerciseSet {
  exercise_id: string;
  id?: number | null;
  list_order: number;
  reps?: number;
  rest_time?: number;
  title?: string | null;
}
export interface ExerciseType {
  id?: number | null;
  title: string;
}
export interface LinkTagWorkout {
  id?: number | null;
  workout_id: string;
  workout_tag_id: string;
}
export interface PrHistory {
  date: string;
  distance?: number | null;
  id?: number | null;
  reps?: number | null;
  speed?: number | null;
  time?: number | null;
  weight?: number | null;
}
export interface ResistanceSet {
  exercise_set_id: string;
  id?: number | null;
  total_weight?: number | null;
}
export interface ResistanceSetSession {
  id?: number | null;
  set_session_id: string;
  total_weight?: number | null;
}
export interface SetSession {
  elapsed_time?: number;
  exercise_session_id: string;
  id?: number | null;
  list_order: number;
  reps?: number;
  rest_time?: number;
  title?: string | null;
}
export interface StandardCategoryPr {
  id?: number | null;
  pr_history_id: string;
  standard_category_pr_id: string;
}
export interface StandardExerciseCategory {
  id?: number | null;
  title: string;
}
export interface TrainingCycle {
  app_user_id: string;
  id?: number | null;
  list_order: number;
  title: string;
}
export interface TrainingDay {
  id?: number | null;
  list_order: number;
  training_cycle_id: string;
}
export interface UserBodyweight {
  app_user_id: string;
  date: string;
  id?: number | null;
  weight: number;
}
export interface Workout {
  app_user_id: string;
  id?: number | null;
  last_session?: string | null;
  list_order: number;
  title: string;
  training_day_id?: string | null;
}
export interface WorkoutDays {
  day: any;
  id?: number | null;
  workout_id?: string | null;
}
export interface WorkoutSession {
  app_user_id: string;
  calories?: number | null;
  date: string;
  id?: number | null;
  tied_to_workout?: boolean;
  title: string;
}
export interface WorkoutTag {
  app_user_id: string;
  id?: number | null;
  title: string;
}
