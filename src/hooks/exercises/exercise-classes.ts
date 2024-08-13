import { useSession } from "@/context/session-provider";
import { ExerciseClass } from "@/utils/exercise-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";

const getExerciseClasses = async (db: SQLiteDatabase) => {
  return await db.getAllAsync<ExerciseClass>(
    `
    SELECT id, exercise_type_id, exercise_equipment_id, body_part_id, title 
    FROM exercise_class 
    WHERE app_user_id = 1 AND is_archived = ?
    `,
    [false]
  );
};

type AddExerciseClassParams = {
  title: string;
  exerciseTypeId: number;
  bodyPartId: number | null;
  equipmentId: number;
};
const addExerciseClass = async ({
  db,
  subjectClaim,
  exerciseTypeId,
  bodyPartId,
  equipmentId,
  title,
}: AddExerciseClassParams & {
  db: SQLiteDatabase;
  subjectClaim: string;
}) => {
  const appUser = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM app_user WHERE aws_cognito_sub = ?;`,
    [subjectClaim]
  );
  if (!appUser) {
    throw new Error(
      "No app_user id found when searching db by aws_cognito_sub, cannot add exercise class"
    );
  }
  return db.runAsync(
    `
    INSERT INTO exercise_class (app_user_id, exercise_type_id, exercise_equipment_id, body_part_id, title)
    VALUES (?, ?, ?, ?, ?);
    `,
    [appUser.id, exerciseTypeId, equipmentId, bodyPartId, title]
  );
};

const useAddExerciseClass = () => {
  const queryClient = useQueryClient();
  const db = useSQLiteContext();
  const { session } = useSession();

  if (!session) {
    throw new Error("No session, cannot add exercise class");
  }
  return useMutation({
    mutationFn: ({
      title,
      exerciseTypeId,
      bodyPartId,
      equipmentId,
    }: AddExerciseClassParams) =>
      addExerciseClass({
        db,
        subjectClaim: session.subjectClaim,
        title,
        exerciseTypeId,
        bodyPartId,
        equipmentId,
      }),
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exercise-classes"],
      });
    },
  });
};

const useExerciseClasses = () => {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ["exercise-classes"],
    queryFn: () => getExerciseClasses(db),
  });
};

export { useExerciseClasses, useAddExerciseClass };
