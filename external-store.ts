import { create } from "zustand";
import { TaggedWorkout } from "./app/(app)/(tabs)/workout-list";

type WorkoutStore = {
  workouts: null | TaggedWorkout[];
  addWorkout: (workout: TaggedWorkout) => void;
  setWorkouts: (workoutList: TaggedWorkout[]) => void;
};

const useWorkoutStore = create<WorkoutStore>()((set, get) => ({
  workouts: null,
  addWorkout: (wo) => {
    const currentWorkouts = get().workouts;
    if (!currentWorkouts) {
      return;
    }
    set({ workouts: [...currentWorkouts, wo] });
  },
  setWorkouts: (woList) => {
    set({ workouts: woList });
  },
}));

export { useWorkoutStore };
