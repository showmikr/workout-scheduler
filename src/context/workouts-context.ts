import { createContext, useContext } from "react";
import { TaggedWorkout } from "../app/(app)/(tabs)/workouts";

type WorkoutsAction = { type: "add_new_workout"; newWorkout: TaggedWorkout };

function workoutsReducer(state: TaggedWorkout[], action: WorkoutsAction) {
  switch (action.type) {
    case "add_new_workout":
      return [...state, action.newWorkout];
  }
}

type WorkoutsContextType = {
  workouts: TaggedWorkout[];
  workoutsDispatch: React.Dispatch<WorkoutsAction>;
};
const WorkoutsContext = createContext<WorkoutsContextType | undefined>(
  undefined
);

function useWorkoutsContext() {
  const workoutsContext = useContext(WorkoutsContext);
  if (!workoutsContext) {
    throw Error(
      "useWorkoutsContext must be used within the workout route or in a component nested in a valid WorkoutContext Provider"
    );
  }
  return workoutsContext;
}

export { workoutsReducer, useWorkoutsContext, WorkoutsContext };
