import { ExerciseClass } from "@/utils/exercise-types";
import { createContext, useContext, useState } from "react";
import { createStore, StoreApi, useStore } from "zustand";

type ActiveSet = {
  id: number;
  reps: number;
  weight: number;
  targetRest: number; // rest time set by the user for a given set
  elapsedRest: number; // for rest timer after checking off set
  isDone: boolean;
};

type ActiveExercise = {
  exerciseClass: ExerciseClass;
  sets: ActiveSet[];
};

type ActiveWorkout = {
  title: string;
  elapsedTime: number; // measured in seconds
  restingSetId: number | null;
  exercises: ActiveExercise[];
};

type ActiveWorkoutActions = {
  startWorkout: (workout: ActiveWorkout) => void;
  cancelWorkout: () => void;
};

type ActiveWorkoutState = {
  activeWorkout: ActiveWorkout | null;
  actions: ActiveWorkoutActions;
};

const ActiveWorkoutContext = createContext<StoreApi<ActiveWorkoutState> | null>(
  null
);

const createActiveWorkoutStore = () =>
  createStore<ActiveWorkoutState>()(
    (set) =>
      ({
        activeWorkout: null,
        actions: {
          startWorkout: (workout: ActiveWorkout) => {
            set(() => ({ activeWorkout: workout }));
          },
          cancelWorkout: () => {
            set(() => ({ activeWorkout: null }));
          },
        },
      }) satisfies ActiveWorkoutState
  );

const ActiveWorkoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState(createActiveWorkoutStore);
  return (
    <ActiveWorkoutContext.Provider value={store}>
      {children}
    </ActiveWorkoutContext.Provider>
  );
};

const useActiveWorkoutStore = <T,>(
  selector: (state: ActiveWorkoutState) => T
) => {
  const store = useContext(ActiveWorkoutContext);
  if (!store) {
    throw new Error(
      "useActiveWorkout must be used within an ActiveWorkoutProvider"
    );
  }
  return useStore(store, selector);
};

const useActiveWorkout = () =>
  useActiveWorkoutStore((state) => state.activeWorkout);
const useActiveWorkoutActions = () =>
  useActiveWorkoutStore((state) => state.actions);

export { ActiveWorkoutProvider, useActiveWorkout, useActiveWorkoutActions };
