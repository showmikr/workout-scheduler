import { useDrizzle } from "@/db/drizzle-context";
import {
  exercise,
  exerciseClass,
  exerciseSet,
  resistanceSet,
} from "@/db/schema";
import { DrizzleDatabase } from "@/db/drizzle-context";
import { useQuery } from "@tanstack/react-query";
import { eq, sql, and } from "drizzle-orm";

async function getExercisesAndSets(db: DrizzleDatabase, workoutId: number) {
  const exerciseList = await db
    .select({
      id: exercise.id,
      listOrder: exercise.listOrder,
      title: exerciseClass.title,
      exerciseClassId: exerciseClass.id,
    })
    .from(exercise)
    .innerJoin(exerciseClass, eq(exercise.exerciseClassId, exerciseClass.id))
    .where(
      and(
        eq(exercise.workoutId, workoutId),
        eq(exerciseClass.exerciseTypeId, 1)
      )
    )
    .orderBy(exercise.listOrder);

  const exerciseIdList = exerciseList.map((ex) => ex.id);

  const preparedExerciseSetListQuery = db
    .select({
      id: exerciseSet.id,
      listOrder: exerciseSet.listOrder,
      restTime: exerciseSet.restTime,
      reps: exerciseSet.reps,
      totalWeight: resistanceSet.totalWeight,
    })
    .from(exerciseSet)
    .innerJoin(resistanceSet, eq(exerciseSet.id, resistanceSet.exerciseSetId))
    .where(eq(exerciseSet.exerciseId, sql.placeholder("exerciseId")))
    .orderBy(exerciseSet.listOrder)
    .prepare();

  const setListSections = await Promise.all(
    exerciseList.map((ex) =>
      preparedExerciseSetListQuery.all({ exerciseId: ex.id })
    )
  );

  type ExerciseAndEntityTuple = [
    exerciseId: number,
    exerciseEntity: (typeof exerciseList)[number] & {
      setIds: Array<number>;
    },
  ];
  const exerciseAndEntityTuples: Array<ExerciseAndEntityTuple> =
    exerciseList.map((ex, idx) => [
      // we can use the `idx` b/c we've sorted the exerciseList and setListSections to line up exercises to their corresponing sets
      ex.id,
      {
        ...ex,
        setIds: setListSections[idx].map((set) => set.id),
      },
    ]);

  const exerciseEntities = Object.fromEntries(exerciseAndEntityTuples);

  const exerciseTable = {
    ids: exerciseIdList,
    entities: exerciseEntities,
  };

  const setTable = {
    ids: setListSections.flatMap((setSection) =>
      setSection.map((set) => set.id)
    ),
    entities: Object.fromEntries(
      setListSections
        .flatMap((setSection) => setSection)
        .map((set) => [set.id, set] as [number, typeof set])
    ),
  };

  return { exercises: exerciseTable, exerciseSets: setTable };
}

type IndividualWorkout = Awaited<ReturnType<typeof getExercisesAndSets>>;

const individualWorkoutKey = (workoutId: number) => [
  "individual-workout",
  workoutId,
];

const useWorkoutDrizzle = <T = IndividualWorkout>(
  workoutId: number,
  select?: (workout: IndividualWorkout) => T
) => {
  const db = useDrizzle();
  return useQuery({
    queryKey: individualWorkoutKey(workoutId),
    queryFn: () => getExercisesAndSets(db, workoutId),
    select,
  });
};

const exerciseSectionsTransform = (
  workout: Awaited<ReturnType<typeof getExercisesAndSets>>
) =>
  workout.exercises.ids.map((id) => ({
    exerciseId: id,
    data: workout.exercises.entities[id].setIds,
  }));

const useExerciseSectionsDrizzle = (workoutId: number) => {
  return useWorkoutDrizzle(workoutId, exerciseSectionsTransform);
};

export { useWorkoutDrizzle, useExerciseSectionsDrizzle, individualWorkoutKey };
export type { IndividualWorkout };
