/**
 * Represents the UI for when you are creating exercises for a workout,
 * but it's for the template workout UI, not the active workout UI.
 */

import React, { useMemo } from "react";
import {
  ExerciseHeader,
  exerciseHeaderStyles,
  RepsCellDisplay,
  RestInputDisplay,
  SetSwipeable,
  WeightCellDisplay,
} from "./SharedUI";
import { useDrizzle } from "@/db/drizzle-context";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { eq } from "drizzle-orm";
import { immediateDebounce } from "@/utils/debounce-utils";
import { exercise, exerciseClass } from "@/db/schema";
import { DeleteUnderlay } from "../CardUnderlay";
import { ThemedText } from "../Themed";
import {
  useIndividualSet,
  useRepsMutation,
  useRestMutation,
  useWeightMutation,
} from "@/hooks/sets/individual-set";
import { useDeleteSet } from "@/hooks/sets/exercise-sets";

const TemplateExerciseHeader = ({ exerciseId }: { exerciseId: number }) => {
  const db = useDrizzle();
  const { data, error } = useLiveQuery(
    db
      .select({ title: exerciseClass.title })
      .from(exercise)
      .innerJoin(exerciseClass, eq(exercise.exerciseClassId, exerciseClass.id))
      .where(eq(exercise.id, exerciseId))
  );
  if (error) {
    console.error(error);
    return null;
  }
  if (!data || data.length === 0) {
    return null;
  }
  const title = data[0].title;
  return (
    <ExerciseHeader title={title}>
      <ThemedText style={exerciseHeaderStyles.columnLabel}>Rest</ThemedText>
      <ThemedText style={exerciseHeaderStyles.columnLabel}>Kg</ThemedText>
      <ThemedText style={exerciseHeaderStyles.columnLabel}>Reps</ThemedText>
    </ExerciseHeader>
  );
};

const TemplateExerciseSet = ({
  workoutId,
  exerciseId,
  setId,
}: {
  workoutId: number;
  exerciseId: number;
  setId: number;
}) => {
  const db = useDrizzle();
  const { data } = useIndividualSet(workoutId, setId);

  const { reps, restTime, totalWeight } = data ?? {
    reps: 0,
    restTime: 0,
    totalWeight: 0,
  };

  const restMutation = useRestMutation(workoutId, setId);
  const repsMutation = useRepsMutation(workoutId, setId);
  const weightMutation = useWeightMutation(workoutId, setId);
  const deleteSetMutation = useDeleteSet(workoutId, exerciseId, setId);

  const updateHandlers = useMemo(
    () => ({
      onChangeRest: (totalSeconds: number) =>
        restMutation.mutate({ db, newRest: totalSeconds, setId }),
      onChangeWeight: (newWeight: number) =>
        weightMutation.mutate({ db, setId, newWeight }),
      onChangeReps: (newReps: number) =>
        repsMutation.mutate({ db, exerciseSetId: setId, newReps }),
      onDeleteSet: immediateDebounce(
        () => deleteSetMutation.mutate({ db, exerciseId, setId }),
        200
      ),
    }),
    [setId]
  );

  return (
    <SetSwipeable
      renderRightActions={(_progress, drag) => (
        <DeleteUnderlay drag={drag} onPress={updateHandlers.onDeleteSet} />
      )}
    >
      <RestInputDisplay
        totalSeconds={restTime}
        onUpdate={updateHandlers.onChangeReps}
        key={"rst" + restTime}
      />
      <WeightCellDisplay
        weight={totalWeight}
        onUpdate={updateHandlers.onChangeWeight}
        key={"wgt" + totalWeight}
      />
      <RepsCellDisplay
        reps={reps}
        onUpdate={updateHandlers.onChangeReps}
        key={"rps" + reps}
      />
    </SetSwipeable>
  );
};

const MemoizedTemplateExerciseSet = React.memo(TemplateExerciseSet);

export {
  TemplateExerciseHeader,
  MemoizedTemplateExerciseSet as TemplateExerciseSet,
};
