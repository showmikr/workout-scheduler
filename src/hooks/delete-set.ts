import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SQLiteDatabase } from "expo-sqlite";

type DeleteSetResult = {
  exerciseSetId: number;
  positionsModified: number;
};
const deleteSet = async ({
  db,
  exerciseSetId,
}: {
  db: SQLiteDatabase;
  exerciseSetId: number;
}) => {
  let result: DeleteSetResult | null = null;
  await db.withTransactionAsync(async () => {
    const removedSet = await db.getFirstAsync<{
      exercise_id: number;
      deleted_pos: number;
    }>(
      `
      DELETE FROM exercise_set 
      WHERE id = ?
      RETURNING exercise_id, list_order AS deleted_pos; 
      `,
      [exerciseSetId]
    );
    if (!removedSet) {
      throw new Error("Could not delete row from exercise_set table");
    }
    const updateResult = await db.runAsync(
      `
      UPDATE exercise_set
      SET list_order = list_order - 1
      WHERE exercise_id = ? 
        AND list_order > ?;
      `,
      [removedSet.exercise_id, removedSet.deleted_pos]
    );
    result = { exerciseSetId, positionsModified: updateResult.changes };
  });
  return result as DeleteSetResult | null;
};

const useDeleteSet = (workoutId: number, exerciseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSet,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (result) => {
      console.log(
        "Deleted exercise set: %s, positions modified: %s",
        result?.exerciseSetId,
        result?.positionsModified
      );
      queryClient.invalidateQueries({
        queryKey: ["workout-section", workoutId],
      });
    },
  });
};

export { useDeleteSet };
