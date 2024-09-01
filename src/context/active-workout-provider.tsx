import { ExerciseClass } from "@/utils/exercise-types";
import { createContext, useContext, useState } from "react";
import { createStore, StoreApi, useStore } from "zustand";

type ActiveSet = {
  id: number;
  reps: number;
  weight: number;
  targetRest: number; // rest time set by the user for a given set
  elapsedRest: number; // for rest timer after checking off set
  isCompleted: boolean;
};

type ActiveExercise = {
  id: number;
  exerciseClass: ExerciseClass;
  sets: readonly ActiveSet[];
};

type ActiveWorkout = {
  title: string;
  elapsedTime: number; // measured in seconds
  restingExercise: {
    exerciseId: number;
    setId: number;
    elapsedRest: number;
  } | null;
  exercises: readonly ActiveExercise[];
};

type ActiveWorkoutActions = {
  startWorkout: (workout: ActiveWorkout) => void;
  cancelWorkout: () => void;
  addExercise: (
    inputExercise: Omit<ActiveExercise, "id" | "sets">,
    inputSet?: Omit<ActiveSet, "id" | "isCompleted">
  ) => void;
  deleteExercise: (exerciseId: number) => void;
  addSet: (
    exerciseId: number,
    inputSet: Omit<ActiveSet, "id" | "isCompleted">
  ) => void;
  deleteSet: (exerciseId: number, setId: number) => void;
  changeReps: (exerciseId: number, setId: number, reps: number) => void;
  changeWeight: (exerciseId: number, setId: number, weight: number) => void;
};

type ActiveWorkoutState = {
  isWorkoutInProgress: boolean;
  activeWorkout: ActiveWorkout;
  actions: ActiveWorkoutActions;
};

function createAutoIncrement(initialValue: number = 0) {
  let currentValue = initialValue;
  return () => currentValue++;
}

const initialActiveWorkout: ActiveWorkout = {
  title: "",
  elapsedTime: 0,
  restingExercise: null,
  exercises: [],
};

const createActiveWorkoutStore = () =>
  createStore<ActiveWorkoutState>()((set, get) => {
    const exerciseIncrement = createAutoIncrement();
    const setIncrement = createAutoIncrement();

    const validateFindExerciseIndex = (exerciseId: number) => {
      const activeWorkout = get().activeWorkout;
      const exerciseIndex = activeWorkout.exercises.findIndex(
        (ex) => ex.id === exerciseId
      );
      if (exerciseIndex === -1) {
        throw new Error("Exercise not found");
      }
      return exerciseIndex;
    };

    return {
      isWorkoutInProgress: false,
      activeWorkout: initialActiveWorkout,
      actions: {
        startWorkout: (workout: ActiveWorkout) => {
          set(() => ({ isWorkoutInProgress: true, activeWorkout: workout }));
        },
        cancelWorkout: () => {
          set(() => ({
            isWorkoutInProgress: false,
            activeWorkout: initialActiveWorkout,
          }));
        },
        addExercise: (
          inputExercise,
          inputSet = {
            reps: 1,
            weight: 20,
            targetRest: 0,
            elapsedRest: 0,
          }
        ) => {
          set((state) => {
            const activeWorkout = state.activeWorkout;
            const initialSets = [
              { ...inputSet, id: setIncrement(), isCompleted: false },
            ];
            const newExercise = {
              ...inputExercise,
              id: exerciseIncrement(),
              sets: initialSets,
            };
            const newExerciseList = [...activeWorkout.exercises, newExercise];
            return {
              activeWorkout: {
                ...activeWorkout,
                exercises: newExerciseList,
              },
            };
          });
        },
        deleteExercise: (exerciseId) => {
          set((state) => {
            const currentWorkout = state.activeWorkout;
            return {
              activeWorkout: {
                ...currentWorkout,
                exercises: currentWorkout.exercises.filter(
                  (ex) => ex.id !== exerciseId
                ),
              },
            };
          });
        },
        addSet: (exerciseId, newSet) => {
          set((state) => {
            const activeWorkout = state.activeWorkout;
            const exerciseIndex = validateFindExerciseIndex(exerciseId);
            const exerciseList = activeWorkout.exercises;
            const exercise = exerciseList[exerciseIndex];
            const newSetList = [
              ...exercise.sets,
              { ...newSet, id: setIncrement(), isCompleted: false },
            ];
            return {
              activeWorkout: {
                ...activeWorkout,
                exercises: [
                  ...exerciseList.slice(0, exerciseIndex),
                  { ...exercise, sets: newSetList },
                  ...exerciseList.slice(exerciseIndex + 1),
                ],
              },
            };
          });
        },
        deleteSet: (exerciseId, setId) => {
          set((state) => {
            const activeWorkout = state.activeWorkout;
            const exerciseIndex = validateFindExerciseIndex(exerciseId);
            const exerciseList = activeWorkout.exercises;
            const exercise = exerciseList[exerciseIndex];
            const newSetList = exercise.sets.filter((set) => set.id !== setId);
            return {
              activeWorkout: {
                ...activeWorkout,
                exercises: [
                  ...exerciseList.slice(0, exerciseIndex),
                  { ...exercise, sets: newSetList },
                  ...exerciseList.slice(exerciseIndex + 1),
                ],
              },
            };
          });
        },
        changeReps: (exerciseId, setId, reps) => {
          set((state) => {
            const activeWorkout = state.activeWorkout;
            const exerciseIndex = validateFindExerciseIndex(exerciseId);
            const exerciseList = activeWorkout.exercises;
            const exercise = exerciseList[exerciseIndex];
            const setIndex = exercise.sets.findIndex((set) => set.id === setId);
            if (setIndex === -1) {
              throw new Error("Set not found");
            }
            const newSetList = [
              ...exercise.sets.slice(0, setIndex),
              { ...exercise.sets[setIndex], reps },
              ...exercise.sets.slice(setIndex + 1),
            ];
            return {
              activeWorkout: {
                ...activeWorkout,
                exercises: [
                  ...exerciseList.slice(0, exerciseIndex),
                  { ...exercise, sets: newSetList },
                  ...exerciseList.slice(exerciseIndex + 1),
                ],
              },
            };
          });
        },
        changeWeight: (exerciseId, setId, weight) => {
          set((state) => {
            const activeWorkout = state.activeWorkout;
            const exerciseIndex = validateFindExerciseIndex(exerciseId);
            const exerciseList = activeWorkout.exercises;
            const exercise = exerciseList[exerciseIndex];
            const setIndex = exercise.sets.findIndex((set) => set.id === setId);
            if (setIndex === -1) {
              throw new Error("Set not found");
            }
            const newSetList = [
              ...exercise.sets.slice(0, setIndex),
              { ...exercise.sets[setIndex], weight },
              ...exercise.sets.slice(setIndex + 1),
            ];
            return {
              activeWorkout: {
                ...activeWorkout,
                exercises: [
                  ...exerciseList.slice(0, exerciseIndex),
                  { ...exercise, sets: newSetList },
                  ...exerciseList.slice(exerciseIndex + 1),
                ],
              },
            };
          });
        },
      },
    } satisfies ActiveWorkoutState;
  });

const ActiveWorkoutContext = createContext<StoreApi<ActiveWorkoutState> | null>(
  null
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

const useIsWorkoutInProgress = () =>
  useActiveWorkoutStore((state) => state.isWorkoutInProgress);

const useActiveWorkoutActions = () =>
  useActiveWorkoutStore((state) => state.actions);

export {
  ActiveWorkoutProvider,
  useActiveWorkout,
  useActiveWorkoutActions,
  useIsWorkoutInProgress,
  ActiveExercise,
};
