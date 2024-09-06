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
};

type ActiveWorkout = {
  title: string;
  elapsedTime: number; // measured in seconds
  isPaused: boolean;
  restingSet: {
    exerciseId: number;
    setId: number;
    elapsedRest: number;
  } | null;
  exercises: {
    ids: Array<number>;
    entities: { [id: number]: ActiveExercise };
  };
  sets: {
    ids: Array<number>;
    entities: { [id: number]: ActiveSet };
  };
  exerciseSets: { [exerciseId: number]: Array<number> };
};

type ActiveWorkoutActions = {
  startWorkout: (inputWorkout: InputWorkout) => void;
  toggleWorkoutTimer: () => void;
  cancelWorkout: () => void;
  addExercise: (
    inputExercise: Omit<ActiveExercise, "id">,
    inputSet?: Omit<ActiveSet, "id">
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
  isActive: boolean;
  actions: ActiveWorkoutActions;
};

function createAutoIncrement(initialValue: number = 0) {
  let currentValue = initialValue;
  return () => currentValue++;
}

const initialActiveWorkout: ActiveWorkout = {
  title: "",
  elapsedTime: 0,
  isPaused: true,
  restingSet: null,
  exercises: { ids: [], entities: {} },
  sets: { ids: [], entities: {} },
  exerciseSets: {},
};

type InputWorkout = {
  title: string;
  exercises: Array<{
    exerciseClassId: number;
    sets: Array<{
      reps: number;
      weight: number;
      targetRest: number;
    }>;
  }>;
};

function createTimer(callback: () => void) {
  let timerInterval: NodeJS.Timeout | null = null;
  const timer = {
    togglePlayPause: (isPaused: boolean) => {
      if (isPaused) {
        timerInterval = setInterval(callback, 1000);
      } else {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }
    },
  };
  return timer;
}

const useActiveWorkoutStore = create<ActiveWorkoutState>()((set, get) => {
  const exerciseIncrement = createAutoIncrement();
  const setIncrement = createAutoIncrement();

  const workoutTimer = createTimer(() => {
    set((state) => ({
      elapsedTime: state.elapsedTime + 1,
    }));
  });

  return {
    isActive: false,
    ...initialActiveWorkout,
    actions: {
      startWorkout: (inputWorkout: InputWorkout) => {
        const allExerciseIds: Array<number> = [];
        const allSetIds: Array<number> = [];
        const exerciseSets = {} as { [exerciseId: number]: Array<number> };
        const myExercises = {} as { [id: number]: ActiveExercise };
        const mySets = {} as { [id: number]: ActiveSet };

        for (const exercise of inputWorkout.exercises) {
          const setIds = exercise.sets.map((set) => setIncrement());
          const nextExerciseId = exerciseIncrement();
          myExercises[nextExerciseId] = {
            id: exerciseIncrement(),
            exerciseClassId: exercise.exerciseClassId,
          };
          exerciseSets[nextExerciseId] = setIds;
          allExerciseIds.push(nextExerciseId);
          for (let i = 0; i < setIds.length; i++) {
            allSetIds.push(setIds[i]);

            mySets[setIds[i]] = {
              id: setIds[i],
              reps: exercise.sets[i].reps,
              weight: exercise.sets[i].weight,
              targetRest: exercise.sets[i].targetRest,
              elapsedRest: 0,
              isCompleted: false,
            };
          }
        }

        set((state) => {
          workoutTimer.togglePlayPause(state.isPaused);
          return {
            ...inputWorkout,
            isActive: true,
            exercises: {
              ids: allExerciseIds,
              entities: myExercises,
            },
            sets: {
              ids: allSetIds,
              entities: mySets,
            },
            exerciseSets,
            restingSet: null,
            elapsedTime: 0,
            isPaused: !state.isPaused,
          };
        });
      },
      toggleWorkoutTimer: () => {
        set((state) => {
          workoutTimer.togglePlayPause(state.isPaused);
          return { isPaused: !state.isPaused };
        });
      },
      cancelWorkout: () => {
        set({ isActive: false, isPaused: true });
      },
      addExercise: (
        inputExercise,
        inputSet = {
          reps: 1,
          weight: 20,
          targetRest: 0,
          elapsedRest: 0,
          isCompleted: false,
        }
      ) => {
        set((state) => {
          const nextSetId = setIncrement();
          const nextExerciseId = exerciseIncrement();
          return {
            exercises: {
              ids: [...state.exercises.ids, nextExerciseId],
              entities: {
                ...state.exercises.entities,
                [nextExerciseId]: {
                  id: nextExerciseId,
                  exerciseClassId: inputExercise.exerciseClassId,
                },
              },
            },
            sets: {
              ids: [...state.sets.ids, nextSetId],
              entities: {
                ...state.sets.entities,
                [nextSetId]: {
                  id: nextSetId,
                  reps: inputSet.reps,
                  weight: inputSet.weight,
                  targetRest: inputSet.targetRest,
                  elapsedRest: inputSet.elapsedRest,
                  isCompleted: inputSet.isCompleted,
                },
              },
            },
            exerciseSets: {
              ...state.exerciseSets,
              [nextExerciseId]: [
                ...state.exerciseSets[nextExerciseId],
                nextSetId,
              ],
            },
          } satisfies Partial<ActiveWorkout>;
        });
      },
      deleteExercise: (exerciseId) => {
        set((state) => {
          delete state.exercises.entities[exerciseId];
          delete state.sets.entities[exerciseId];
          delete state.exerciseSets[exerciseId];
          return {
            exercises: {
              ...state.exercises,
              ids: state.exercises.ids.filter((id) => id !== exerciseId),
            },
            sets: {
              ...state.sets,
              ids: state.sets.ids.filter((id) => id !== exerciseId),
            },
          } satisfies Partial<ActiveWorkout>;
        });
      },
      addSet: (exerciseId, newSet) => {
        set((state) => {
          const nextSetId = setIncrement();
          return {
            exerciseSets: {
              ...state.exerciseSets,
              [exerciseId]: [...state.exerciseSets[exerciseId], nextSetId],
            },
            sets: {
              ids: [...state.sets.ids, nextSetId],
              entities: {
                ...state.sets.entities,
                [nextSetId]: {
                  id: nextSetId,
                  reps: newSet.reps,
                  weight: newSet.weight,
                  targetRest: newSet.targetRest,
                  elapsedRest: newSet.elapsedRest,
                  isCompleted: false,
                },
              },
            },
          } satisfies Partial<ActiveWorkout>;
        });
      },
      deleteSet: (exerciseId, setId) => {
        set((state) => {
          delete state.sets.entities[setId];
          return {
            exerciseSets: {
              ...state.exerciseSets,
              [exerciseId]: state.exerciseSets[exerciseId].filter(
                (set) => set !== setId
              ),
            },
            sets: {
              ...state.sets,
              ids: state.sets.ids.filter((id) => id !== setId),
            },
          } satisfies Partial<ActiveWorkout>;
        });
      },
      changeReps: (exerciseId, setId, reps) => {
        set((state) => {
          return {
            sets: {
              ...state.sets,
              entities: {
                ...state.sets.entities,
                [setId]: {
                  ...state.sets.entities[setId],
                  reps,
                },
              },
            },
          } satisfies Partial<ActiveWorkout>;
        });
      },
      changeWeight: (exerciseId, setId, weight) => {
        set((state) => {
          return {
            sets: {
              ...state.sets,
              entities: {
                ...state.sets.entities,
                [setId]: {
                  ...state.sets.entities[setId],
                  weight,
                },
              },
            },
          } satisfies Partial<ActiveWorkout>;
        });
      },
    },
  } satisfies ActiveWorkoutState;
});

const useActiveWorkoutStatus = () =>
  useActiveWorkoutStore((state) => state.isActive);

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
