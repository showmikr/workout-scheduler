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
  setIds: Array<number>;
};

type ActiveWorkout = {
  isActive: boolean;
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
  exerciseSets: { [exerciseId: number]: Array<ActiveSet> }; // derived state the represents actual sets for each exercise
};

type ActiveWorkoutActions = {
  startWorkout: (inputWorkout: InputWorkout) => void;
  toggleWorkoutTimer: () => void;
  cancelWorkout: () => void;
  addExercise: (
    inputExercise: Omit<ActiveExercise, "id" | "setIds">,
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
  actions: ActiveWorkoutActions;
};

function createAutoIncrement(initialValue: number = 0) {
  let currentValue = initialValue;
  return () => currentValue++;
}

const initialActiveWorkout: ActiveWorkout = {
  isActive: false,
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
  let exerciseIncrement = createAutoIncrement();
  let setIncrement = createAutoIncrement();

  const workoutTimer = createTimer(() => {
    set((state) => ({
      elapsedTime: state.elapsedTime + 1,
    }));
  });

  return {
    ...initialActiveWorkout,
    actions: {
      startWorkout: (inputWorkout: InputWorkout) => {
        const allExerciseIds: Array<number> = [];
        const allSetIds: Array<number> = [];
        const myExercises: { [id: number]: ActiveExercise } = {};
        const mySets: { [id: number]: ActiveSet } = {};
        const myExerciseSets: { [exerciseId: number]: ActiveSet[] } = {};

        for (const exercise of inputWorkout.exercises) {
          const setIds = exercise.sets.map((set) => setIncrement());
          const nextExerciseId = exerciseIncrement();

          myExercises[nextExerciseId] = {
            id: nextExerciseId,
            exerciseClassId: exercise.exerciseClassId,
            setIds,
          };

          allExerciseIds.push(nextExerciseId);

          myExerciseSets[nextExerciseId] = [];

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

            myExerciseSets[nextExerciseId].push(mySets[setIds[i]]);
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
            exerciseSets: myExerciseSets,
            restingSet: null,
            elapsedTime: 0,
            isPaused: !state.isPaused,
          } satisfies ActiveWorkout;
        });
      },
      toggleWorkoutTimer: () => {
        set((state) => {
          workoutTimer.togglePlayPause(state.isPaused);
          return { isPaused: !state.isPaused };
        });
      },
      cancelWorkout: () => {
        // reset incremmenters
        setIncrement = createAutoIncrement();
        exerciseIncrement = createAutoIncrement();
        set((state) => {
          workoutTimer.togglePlayPause(state.isPaused);
          return { ...initialActiveWorkout };
        });
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
                  setIds: [nextSetId],
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
                {
                  id: nextSetId,
                  reps: inputSet.reps,
                  weight: inputSet.weight,
                  targetRest: inputSet.targetRest,
                  elapsedRest: inputSet.elapsedRest,
                  isCompleted: inputSet.isCompleted,
                },
              ],
            },
          } satisfies Partial<ActiveWorkoutState>;
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
          } satisfies Partial<ActiveWorkoutState>;
        });
      },
      addSet: (exerciseId, newSet) => {
        set((state) => {
          const nextSetId = setIncrement();
          return {
            exercises: {
              ...state.exercises,
              entities: {
                ...state.exercises.entities,
                [exerciseId]: {
                  ...state.exercises.entities[exerciseId],
                  setIds: [
                    ...state.exercises.entities[exerciseId].setIds,
                    nextSetId,
                  ],
                },
              },
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
            exerciseSets: {
              ...state.exerciseSets,
              [exerciseId]: [
                ...state.exerciseSets[exerciseId],
                {
                  id: nextSetId,
                  reps: newSet.reps,
                  weight: newSet.weight,
                  targetRest: newSet.targetRest,
                  elapsedRest: newSet.elapsedRest,
                  isCompleted: false,
                },
              ],
            },
          } satisfies Partial<ActiveWorkoutState>;
        });
      },
      deleteSet: (exerciseId, setId) => {
        set((state) => {
          delete state.sets.entities[setId];
          return {
            exercises: {
              ...state.exercises,
              entities: {
                ...state.exercises.entities,
                [exerciseId]: {
                  ...state.exercises.entities[exerciseId],
                  setIds: state.exercises.entities[exerciseId].setIds.filter(
                    (id) => id !== setId
                  ),
                },
              },
            },
            sets: {
              ...state.sets,
              ids: state.sets.ids.filter((id) => id !== setId),
            },
            exerciseSets: {
              ...state.exerciseSets,
              [exerciseId]: state.exerciseSets[exerciseId].filter(
                (set) => set.id !== setId
              ),
            },
          } satisfies Partial<ActiveWorkoutState>;
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
            exerciseSets: {
              ...state.exerciseSets,
              [exerciseId]: state.exerciseSets[exerciseId].map((exerciseSet) =>
                exerciseSet.id === setId ?
                  { ...exerciseSet, reps }
                : exerciseSet
              ),
            },
          } satisfies Partial<ActiveWorkoutState>;
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
            exerciseSets: {
              ...state.exerciseSets,
              [exerciseId]: state.exerciseSets[exerciseId].map((exerciseSet) =>
                exerciseSet.id === setId ?
                  { ...exerciseSet, weight }
                : exerciseSet
              ),
            },
          } satisfies Partial<ActiveWorkoutState>;
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

const useActiveWorkoutExerciseIds = () =>
  useActiveWorkoutStore((state) => state.exercises.ids);

const useActiveWorkoutExercise = (exerciseId: number) => {
  return useActiveWorkoutStore((state) => state.exercises.entities[exerciseId]);
};

const useActiveWorkoutSets = (exerciseId: number) => {
  return useActiveWorkoutStore((state) => state.exerciseSets[exerciseId]);
};

export type { ActiveExercise };

export {
  InputWorkout,
  initialActiveWorkout,
  useActiveWorkoutActions,
  useActiveWorkoutStatus,
  useActiveWorkoutTitle,
  useActiveWorkoutElapsedTime,
  useActiveWorkoutRestingSet,
  useActiveWorkoutExerciseIds,
  useActiveWorkoutExercise,
  useActiveWorkoutSets,
};
