import { create } from "zustand";
import { TaggedWorkout } from "./app/(app)/(tabs)/workout-list";

type ExternalStore = {
  workouts: null | TaggedWorkout[];
  addWorkout: (workout: TaggedWorkout) => void;
  setWorkouts: (workoutList: TaggedWorkout[]) => void;
};

const useExternalStore = create<ExternalStore>()((set, get) => ({
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

export { useExternalStore };
