import { createContext, useContext, useState } from "react";

type ActiveWorkout = {
  title: string;
  count: number;
};

type ActiveWorkoutContextType = (
  | {
      inProgress: false;
      activeWorkout: null;
    }
  | {
      inProgress: true;
      activeWorkout: ActiveWorkout;
    }
) & { setActiveWorkout: (workout: ActiveWorkout | null) => void };

const ActiveWorkoutContext = createContext<ActiveWorkoutContextType>({
  inProgress: false,
  activeWorkout: null,
  setActiveWorkout: (_workout) => {
    throw new Error("setActiveWorkoutContext not initialized");
  },
});

const ActiveWorkoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(
    null
  );
  const [inProgress, setInProgress] = useState(false);

  const contextSetter = (workout: ActiveWorkout | null): void => {
    if (workout === null) {
      setInProgress(false);
      setActiveWorkout(null);
      return;
    } else {
      setInProgress(true);
      setActiveWorkout(workout);
      return;
    }
  };

  return (
    <ActiveWorkoutContext.Provider
      value={
        {
          inProgress,
          activeWorkout,
          setActiveWorkout: contextSetter,
        } as ActiveWorkoutContextType
      }
    >
      {children}
    </ActiveWorkoutContext.Provider>
  );
};

const useActiveWorkout = () => useContext(ActiveWorkoutContext);

export { ActiveWorkoutProvider, useActiveWorkout };
