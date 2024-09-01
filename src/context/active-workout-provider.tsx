import { ExerciseClass } from "@/utils/exercise-types";
import { create } from "zustand";

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
  exerciseClassId: number;
  sets: readonly ActiveSet[];
};

type ActiveWorkout = {
  title: string;
  elapsedTime: number; // measured in seconds
  restingSet: {
    exerciseId: number;
    setId: number;
    elapsedRest: number;
  } | null;
  exercises: readonly ActiveExercise[];
};

type ActiveWorkoutActions = {
  startWorkout: (inputWorkout: InputWorkout) => void;
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

type ActiveWorkoutState = ActiveWorkout & {
  inProgress: boolean;
  actions: ActiveWorkoutActions;
};

function createAutoIncrement(initialValue: number = 0) {
  let currentValue = initialValue;
  return () => currentValue++;
}

const initialActiveWorkout: ActiveWorkout = {
  title: "",
  elapsedTime: 0,
  restingSet: null,
  exercises: [],
};

type InputWorkout = {
  [K in keyof Omit<ActiveWorkout, "elapsedTime" | "restingSet">]: K extends (
    "exercises"
  ) ?
    {
      [L in keyof Omit<ActiveExercise, "id">]: L extends "sets" ?
        Omit<ActiveSet, "id">[]
      : ActiveExercise[L];
    }[]
  : ActiveWorkout[K];
};

const useActiveWorkoutStore = create<ActiveWorkoutState>()((set, get) => {
  const exerciseIncrement = createAutoIncrement();
  const setIncrement = createAutoIncrement();

  const validateFindExerciseIndex = (exerciseId: number) => {
    const exerciseIndex = get().exercises.findIndex(
      (ex) => ex.id === exerciseId
    );
    if (exerciseIndex === -1) {
      throw new Error("Exercise not found");
    }
    return exerciseIndex;
  };

  return {
    inProgress: false,
    ...initialActiveWorkout,
    actions: {
      startWorkout: (inputWorkout: InputWorkout) => {
        const activeExercises = inputWorkout.exercises.map((exercise) => ({
          ...exercise,
          id: exerciseIncrement(),
          sets: exercise.sets.map((set) => ({
            ...set,
            id: setIncrement(),
          })),
        }));
        set({
          inProgress: true,
          ...inputWorkout,
          exercises: activeExercises,
          restingSet: null,
          elapsedTime: 0,
        });
      },
      cancelWorkout: () => {
        set({ inProgress: false });
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
          const initialSets = [
            { ...inputSet, id: setIncrement(), isCompleted: false },
          ];
          const newExercise = {
            ...inputExercise,
            id: exerciseIncrement(),
            sets: initialSets,
          };
          const newExerciseList = [...state.exercises, newExercise];
          return {
            exercises: newExerciseList,
          };
        });
      },
      deleteExercise: (exerciseId) => {
        set((state) => {
          return {
            exercises: state.exercises.filter((ex) => ex.id !== exerciseId),
          };
        });
      },
      addSet: (exerciseId, newSet) => {
        set((state) => {
          const exerciseIndex = validateFindExerciseIndex(exerciseId);
          const exerciseList = state.exercises;
          const exercise = exerciseList[exerciseIndex];
          const newSetList = [
            ...exercise.sets,
            { ...newSet, id: setIncrement(), isCompleted: false },
          ];
          return {
            exercises: [
              ...exerciseList.slice(0, exerciseIndex),
              { ...exercise, sets: newSetList },
              ...exerciseList.slice(exerciseIndex + 1),
            ],
          };
        });
      },
      deleteSet: (exerciseId, setId) => {
        set((state) => {
          const exerciseIndex = validateFindExerciseIndex(exerciseId);
          const exerciseList = state.exercises;
          const exercise = exerciseList[exerciseIndex];
          const newSetList = exercise.sets.filter((set) => set.id !== setId);
          return {
            exercises: [
              ...exerciseList.slice(0, exerciseIndex),
              { ...exercise, sets: newSetList },
              ...exerciseList.slice(exerciseIndex + 1),
            ],
          };
        });
      },
      changeReps: (exerciseId, setId, reps) => {
        set((state) => {
          const exerciseIndex = validateFindExerciseIndex(exerciseId);
          const exerciseList = state.exercises;
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
            exercises: [
              ...exerciseList.slice(0, exerciseIndex),
              { ...exercise, sets: newSetList },
              ...exerciseList.slice(exerciseIndex + 1),
            ],
          };
        });
      },
      changeWeight: (exerciseId, setId, weight) => {
        set((state) => {
          const exerciseIndex = validateFindExerciseIndex(exerciseId);
          const exerciseList = state.exercises;
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
            exercises: [
              ...exerciseList.slice(0, exerciseIndex),
              { ...exercise, sets: newSetList },
              ...exerciseList.slice(exerciseIndex + 1),
            ],
          };
        });
      },
    },
  } satisfies ActiveWorkoutState;
});

const useActiveWorkoutStatus = () =>
  useActiveWorkoutStore((state) => state.inProgress);

const useActiveWorkoutActions = () =>
  useActiveWorkoutStore((state) => state.actions);

const useActiveWorkoutTitle = () =>
  useActiveWorkoutStore((state) => state.title);

const useActiveWorkoutElapsedTime = () =>
  useActiveWorkoutStore((state) => state.elapsedTime);

const useActiveWorkoutRestingSet = () =>
  useActiveWorkoutStore((state) => state.restingSet);

const useActiveWorkoutExercises = () =>
  useActiveWorkoutStore((state) => state.exercises);

export type { ActiveExercise };

export {
  InputWorkout,
  initialActiveWorkout,
  useActiveWorkoutActions,
  useActiveWorkoutStatus,
  useActiveWorkoutTitle,
  useActiveWorkoutElapsedTime,
  useActiveWorkoutRestingSet,
  useActiveWorkoutExercises,
};
