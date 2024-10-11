import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
} from "react-native";
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
  exerciseClass: { id: number; title: string };
  setIds: Array<number>;
};

type ActiveWorkout = {
  isActive: boolean;
  workoutStartTime: number; // records snapshot of when the workout first starts (UNIX epoch in milliseconds)
  title: string;
  elapsedTime: number; // measured in seconds
  isPaused: boolean;
  restingSet: {
    setId: number;
    startTime: number; // records snapshot of when rest started (UNIX epoch in milliseconds)
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
};

type ActiveWorkoutActions = {
  startWorkout: (inputWorkout: InputWorkout) => void;
  toggleWorkoutTimer: () => void;
  cancelWorkout: () => void;
  addExercise: (
    inputExercise: ActiveExercise["exerciseClass"],
    inputSet?: Omit<ActiveSet, "id">
  ) => void;
  deleteExercise: (exerciseId: number) => void;
  addSet: (exerciseId: number) => void;
  deleteSet: (exerciseId: number, setId: number) => void;
  changeReps: (setId: number, reps: number) => void;
  changeWeight: (setId: number, weight: number) => void;
  changeRest: (setId: number, targetRest: number) => void;
  toggleSetDone: (setId: number) => void;
};

type ActiveWorkoutStore = ActiveWorkout & {
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
  workoutStartTime: Date.now(),
};

type InputWorkout = {
  title: string;
  exercises: Array<{
    exerciseClass: { id: number; title: string };
    sets: Array<{
      reps: number;
      weight: number;
      targetRest: number;
    }>;
  }>;
};

function createTimer() {
  let intervalId: NodeJS.Timeout | null = null;
  const stopFn = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    } else {
      console.warn("Trying to stop timer when it's not running");
    }
  };
  const startFn = (callback: () => void) => {
    if (!intervalId) {
      intervalId = setInterval(() => callback(), 1000);
    } else {
      console.warn("Trying to start timer when it's already running");
    }
  };
  const timer = { start: startFn, stop: stopFn };
  return timer;
}

const useActiveWorkoutStore = create<ActiveWorkoutStore>()((set, get) => {
  let exerciseIncrement = createAutoIncrement();
  let setIncrement = createAutoIncrement();

  let appStateSubscription: NativeEventSubscription | undefined;

  const workoutTimer = createTimer();
  const workoutTimerCallback = () => {
    set((state) => ({
      elapsedTime: state.elapsedTime + 1,
    }));
  };

  const restTimer = createTimer();
  const restTimerCallback = () => {
    const restingSet = get().restingSet;
    if (!restingSet) {
      console.warn(
        "resting set is null! This shouldn't happen. Stopping timer"
      );
      restTimer.stop();
      return;
    }
    const targetRest = get().sets.entities[restingSet.setId].targetRest;
    if (restingSet.elapsedRest < targetRest) {
      set({
        restingSet: { ...restingSet, elapsedRest: restingSet.elapsedRest + 1 },
      });
    } else {
      set({ restingSet: null });
      restTimer.stop();
    }
  };

  const handleAppStateChange = (newState: AppStateStatus) => {
    if (newState !== "active") return;

    // if app returns to an active state, update the respective timers
    set(({ restingSet, workoutStartTime: startSnapshot }) => {
      return {
        restingSet:
          restingSet ?
            {
              ...restingSet,
              elapsedRest: Math.round(
                (Date.now() - restingSet.startTime) / 1000
              ),
            }
          : null,
        elapsedTime: Math.round((Date.now() - startSnapshot) / 1000),
      };
    });
  };

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
          const setIds = exercise.sets.map(() => setIncrement());
          const nextExerciseId = exerciseIncrement();

          myExercises[nextExerciseId] = {
            id: nextExerciseId,
            exerciseClass: {
              id: exercise.exerciseClass.id,
              title: exercise.exerciseClass.title,
            },
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

        appStateSubscription = AppState.addEventListener(
          "change",
          handleAppStateChange
        );

        set((state) => {
          workoutTimer.start(workoutTimerCallback);
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
            restingSet: null,
            elapsedTime: 0,
            isPaused: !state.isPaused,
            workoutStartTime: Date.now(),
          } satisfies ActiveWorkout;
        });
      },
      toggleWorkoutTimer: () => {
        const isCurrentlyPaused = get().isPaused;
        if (isCurrentlyPaused) {
          workoutTimer.start(workoutTimerCallback);
        } else {
          workoutTimer.stop();
        }
        set({ isPaused: !isCurrentlyPaused } satisfies Pick<
          ActiveWorkout,
          "isPaused"
        >);
      },
      cancelWorkout: () => {
        // reset incrementers
        setIncrement = createAutoIncrement();
        exerciseIncrement = createAutoIncrement();
        if (appStateSubscription) {
          appStateSubscription.remove();
        } else {
          console.warn(
            "trying to unsubscribe from AppState eventListener when it's undefined"
          );
        }
        set((state) => {
          if (!state.isPaused) {
            workoutTimer.stop();
          }
          if (state.restingSet) {
            restTimer.stop();
          }
          return { ...initialActiveWorkout } satisfies ActiveWorkout;
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
                  exerciseClass: {
                    id: inputExercise.id,
                    title: inputExercise.title,
                  },
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
          } satisfies Pick<ActiveWorkout, "exercises" | "sets">;
        });
      },
      deleteExercise: (exerciseId) => {
        set((state) => {
          delete state.exercises.entities[exerciseId];
          delete state.sets.entities[exerciseId];
          return {
            exercises: {
              ...state.exercises,
              ids: state.exercises.ids.filter((id) => id !== exerciseId),
            },
            sets: {
              ...state.sets,
              ids: state.sets.ids.filter((id) => id !== exerciseId),
            },
          } satisfies Pick<ActiveWorkout, "exercises" | "sets">;
        });
      },
      addSet: (exerciseId) => {
        if (get().exercises.entities[exerciseId] === undefined) {
          console.warn("Exercise not found for exerciseId", exerciseId);
          return;
        }
        set((state) => {
          const nextSetId = setIncrement();
          const lastSetId = state.exercises.entities[exerciseId]?.setIds.at(-1);
          const placeHolderSet: ActiveSet =
            lastSetId !== undefined ?
              {
                ...state.sets.entities[lastSetId],
                id: nextSetId,
                isCompleted: false,
              }
            : {
                id: nextSetId,
                reps: 15,
                weight: 45,
                targetRest: 180,
                elapsedRest: 0,
                isCompleted: false,
              };
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
                [nextSetId]: placeHolderSet,
              },
            },
          } satisfies Pick<ActiveWorkout, "exercises" | "sets">;
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
          } satisfies Pick<ActiveWorkout, "exercises" | "sets">;
        });
      },
      changeReps: (setId, reps) => {
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
          } satisfies Pick<ActiveWorkout, "sets">;
        });
      },
      changeWeight: (setId, weight) => {
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
          } satisfies Pick<ActiveWorkout, "sets">;
        });
      },
      changeRest: (setId, targetRest) => {
        set((state) => {
          return {
            sets: {
              ...state.sets,
              entities: {
                ...state.sets.entities,
                [setId]: {
                  ...state.sets.entities[setId],
                  targetRest,
                },
              },
            },
          };
        });
      },
      toggleSetDone: (setId) => {
        const initialState = get();
        const toggledSet = initialState.sets.entities[setId];
        const nextToggleState = {
          sets: {
            ...initialState.sets,
            entities: {
              ...initialState.sets.entities,
              [setId]: {
                ...initialState.sets.entities[setId],
                isCompleted: !toggledSet.isCompleted,
              },
            },
          },
        } satisfies Pick<ActiveWorkout, "sets">;
        const restingSet = initialState.restingSet;

        // if set isn't done (so, if we're marking that set as done)
        if (!toggledSet.isCompleted) {
          if (!restingSet) {
            if (toggledSet.targetRest === 0) {
              set(nextToggleState);
              return;
            }
            // otherwise...
            set({
              ...nextToggleState,
              restingSet: { setId, startTime: Date.now(), elapsedRest: 0 },
            });
            restTimer.start(restTimerCallback);
          } else if (toggledSet.targetRest === 0) {
            set({ ...nextToggleState, restingSet: null });
            restTimer.stop();
          } else if (restingSet.setId !== setId) {
            set({
              ...nextToggleState,
              restingSet: { setId, startTime: Date.now(), elapsedRest: 0 },
            });
          }
        }
        // if set is done (so, if we're marking the set to not done)
        else {
          if (!restingSet || restingSet.setId !== setId) {
            set(nextToggleState);
          } else if (restingSet.setId === setId) {
            restTimer.stop();
            set({ ...nextToggleState, restingSet: null });
          }
        }
      },
    },
  } satisfies ActiveWorkoutStore;
});

const useActiveWorkoutStatus = () =>
  useActiveWorkoutStore((state) => state.isActive);

const useActiveWorkoutActions = () =>
  useActiveWorkoutStore((state) => state.actions);

const useActiveWorkoutTitle = () =>
  useActiveWorkoutStore((state) => state.title);

const useActiveWorkoutElapsedTime = () =>
  useActiveWorkoutStore((state) => state.elapsedTime);

const useActiveWorkoutRestingSetId = () =>
  useActiveWorkoutStore((state) => state.restingSet?.setId);

const useActiveWorkoutRestingTime = () =>
  useActiveWorkoutStore((state) => state.restingSet?.elapsedRest);

const useActiveWorkoutExerciseIds = () =>
  useActiveWorkoutStore((state) => state.exercises.ids);

const useActiveWorkoutExercise = (exerciseId: number) => {
  return useActiveWorkoutStore((state) => state.exercises.entities[exerciseId]);
};

// getters for exercise set properties
const useActiveWorkoutSetReps = (setId: number) =>
  useActiveWorkoutStore((state) => state.sets.entities[setId].reps);

const useActiveWorkoutSetWeight = (setId: number) =>
  useActiveWorkoutStore((state) => state.sets.entities[setId].weight);

const useActiveWorkoutSetTargetRest = (setId: number) =>
  useActiveWorkoutStore((state) => state.sets.entities[setId].targetRest);

const useActiveWorkoutSetIsCompleted = (setId: number) =>
  useActiveWorkoutStore((state) => state.sets.entities[setId].isCompleted);

const useActiveWorkoutStartTime = () =>
  useActiveWorkoutStore((state) => state.workoutStartTime);

export type { ActiveSet };

export {
  InputWorkout,
  initialActiveWorkout,
  useActiveWorkoutActions,
  useActiveWorkoutStatus,
  useActiveWorkoutTitle,
  useActiveWorkoutElapsedTime,
  useActiveWorkoutRestingSetId,
  useActiveWorkoutRestingTime,
  useActiveWorkoutExerciseIds,
  useActiveWorkoutExercise,
  useActiveWorkoutSetReps,
  useActiveWorkoutSetWeight,
  useActiveWorkoutSetTargetRest,
  useActiveWorkoutSetIsCompleted,
  useActiveWorkoutStartTime,
};
