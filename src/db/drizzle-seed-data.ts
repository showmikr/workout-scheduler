import { DrizzleDatabase } from "./drizzle-context";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { asc, eq, and } from "drizzle-orm";
import { SQLiteDatabase } from "expo-sqlite";
import {
  appUser,
  bodyPart,
  exercise,
  exerciseClass,
  exerciseEquipment,
  exerciseSet,
  exerciseType,
  linkTagWorkout,
  resistanceSet,
  workout,
  workoutTag,
} from "./schema";

const exerciseTypeList = ["Resistance", "Cardiovascular"] as const;
type ExerciseType = (typeof exerciseTypeList)[number];

const bodyPartList = [
  "Chest",
  "Arms",
  "Back",
  "Legs",
  "Shoulders",
  "Core",
  "Full Body",
  "Other",
] as const;
type BodyPart = (typeof bodyPartList)[number];

const exerciseEquipmentList = [
  "Barbell",
  "Dumbbell",
  "Machine",
  "Bodyweight",
  "Other",
] as const;
type ExerciseEquipment = (typeof exerciseEquipmentList)[number];

const exerciseClassTitleList = [
  "Bench Press",
  "Chin-Ups",
  "Overhead Press",
  "Bicep Curls",
  "Rows",
  "Tricep Extensions",
  "Leg Curls",
  "Calf Raises",
  "Core Push-Ins",
  "Deadlift",
  "Squat",
  "Jog",
  "Stretches",
  "Leg Press",
  "Pull-Down",
] as const;
type ExerciseClassTitle = (typeof exerciseClassTitleList)[number];

type ExerciseClass = {
  title: ExerciseClassTitle;
  exerciseType: ExerciseType;
  equipment: ExerciseEquipment;
  bodyPart: BodyPart;
};
const exerciseClassList: Array<ExerciseClass> = [
  {
    title: "Bench Press",
    exerciseType: "Resistance",
    equipment: "Barbell",
    bodyPart: "Chest",
  },
  {
    title: "Chin-Ups",
    exerciseType: "Resistance",
    equipment: "Bodyweight",
    bodyPart: "Back",
  },
  {
    title: "Overhead Press",
    exerciseType: "Resistance",
    equipment: "Barbell",
    bodyPart: "Shoulders",
  },
  {
    title: "Bicep Curls",
    exerciseType: "Resistance",
    equipment: "Dumbbell",
    bodyPart: "Arms",
  },
  {
    title: "Rows",
    exerciseType: "Resistance",
    equipment: "Machine",
    bodyPart: "Back",
  },
  {
    title: "Tricep Extensions",
    exerciseType: "Resistance",
    equipment: "Dumbbell",
    bodyPart: "Arms",
  },
  {
    title: "Leg Curls",
    exerciseType: "Resistance",
    equipment: "Machine",
    bodyPart: "Legs",
  },
  {
    title: "Calf Raises",
    exerciseType: "Resistance",
    equipment: "Machine",
    bodyPart: "Legs",
  },
  {
    title: "Core Push-Ins",
    exerciseType: "Resistance",
    equipment: "Bodyweight",
    bodyPart: "Core",
  },
  {
    title: "Deadlift",
    exerciseType: "Resistance",
    equipment: "Barbell",
    bodyPart: "Back",
  },
  {
    title: "Squat",
    exerciseType: "Resistance",
    equipment: "Barbell",
    bodyPart: "Legs",
  },
  {
    title: "Jog",
    exerciseType: "Cardiovascular",
    equipment: "Machine",
    bodyPart: "Other",
  },
  {
    title: "Stretches",
    exerciseType: "Cardiovascular",
    equipment: "Bodyweight",
    bodyPart: "Other",
  },
  {
    title: "Leg Press",
    exerciseType: "Cardiovascular",
    equipment: "Machine",
    bodyPart: "Legs",
  },
  {
    title: "Pull-Down",
    exerciseType: "Resistance",
    equipment: "Machine",
    bodyPart: "Back",
  },
];

const testUser = {
  awsCognitoSub: "c8bf7e34-7dcf-11ee-b962-0242ac120002",
  firstName: "David",
  lastName: "Shcherbina",
  userName: "kalashnikov",
  email: "davidshcherbina@gmail.com",
  emailVerified: true,
  creationDate: "2022-05-07T14:12:34.000Z",
  lastSignedIn: "2023-11-07T19:12:34.000Z",
  avgDailyCalorieGoal: 150,
  bodyweightGoal: 79.37866,
  userHeight: 1.8288,
};

const lbsToKg = (lbs: number) => Math.round(lbs * 0.453592);

function zipArrays<T, U>(arr1: Array<T>, arr2: Array<U>): Array<[T, U]> {
  const shortestArray = arr1.length < arr2.length ? arr1 : arr2;
  return shortestArray.map((_, index) => [arr1[index], arr2[index]]);
}

async function generateSeedData(expoDb: SQLiteDatabase) {
  const db = drizzle(expoDb);

  await db.insert(appUser).values(testUser);

  await db.insert(workoutTag).values([
    { appUserId: 1, title: "Upper Body" },
    { appUserId: 1, title: "Lower Body" },
  ]);

  await db.insert(linkTagWorkout).values([
    { workoutTagId: 1, workoutId: 1 },
    { workoutTagId: 1, workoutId: 3 },
    { workoutTagId: 2, workoutId: 2 },
    { workoutTagId: 2, workoutId: 3 },
  ]);

  await db
    .insert(exerciseType)
    .values(exerciseTypeList.map((type) => ({ title: type })));
  const exerciseTypeIdList = (
    await db.select().from(exerciseType).orderBy(asc(exerciseType.id))
  ).map(({ title, id }) => [title, id]);
  const exerciseTypeIdMap = Object.fromEntries(exerciseTypeIdList) as Record<
    (typeof exerciseTypeList)[number],
    number
  >;

  await db
    .insert(exerciseEquipment)
    .values(exerciseEquipmentList.map((title) => ({ title })));
  const exerciseEquipmentIdList = await db
    .select()
    .from(exerciseEquipment)
    .orderBy(asc(exerciseEquipment.id));
  const exerciseEquipmentIdMap = Object.fromEntries(
    exerciseEquipmentIdList.map(({ title, id }) => [title, id])
  ) as Record<(typeof exerciseEquipmentList)[number], number>;

  await db.insert(bodyPart).values(bodyPartList.map((title) => ({ title })));
  const bodyPartIdList = await db
    .select()
    .from(bodyPart)
    .orderBy(asc(bodyPart.id));
  const bodyPartIdMap = Object.fromEntries(
    bodyPartIdList.map(({ title, id }) => [title, id])
  ) as Record<(typeof bodyPartList)[number], number>;

  const testUserId = (
    await db
      .select({ id: appUser.id })
      .from(appUser)
      .where(eq(appUser.userName, testUser.userName))
  ).at(0)?.id;

  if (!testUserId) {
    throw Error("test user not correctly inserted in test db while seeding");
  }

  await db.insert(exerciseClass).values(
    exerciseClassList.map((exClass) => ({
      appUserId: testUserId,
      title: exClass.title,
      exerciseTypeId: exerciseTypeIdMap[exClass.exerciseType],
      exerciseEquipmentId: exerciseEquipmentIdMap[exClass.equipment],
      bodyPartId: bodyPartIdMap[exClass.bodyPart],
    }))
  );

  const exerciseClassIdList = await db
    .select({ id: exerciseClass.id, title: exerciseClass.title })
    .from(exerciseClass)
    .orderBy(asc(exerciseClass.id));
  const exerciseClassMap = Object.fromEntries(
    zipArrays(
      exerciseClassIdList.map(({ title }) => title),
      exerciseClassList.map((exClass, index) => ({
        ...exClass,
        id: exerciseClassIdList[index].id,
      }))
    )
  ) as Record<
    (typeof exerciseClassList)[number]["title"],
    (typeof exerciseClassList)[number] & { id: number }
  >;

  type WorkoutItem = {
    title: string;
    exercises: Array<{
      exerciseClass: ExerciseClassTitle;
      sets: Array<{ reps: number; restTime: number; weight: number }>;
    }>;
  };
  const workoutList: Array<WorkoutItem> = [
    {
      title: "Upperbody",
      exercises: [
        {
          exerciseClass: "Bench Press",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(45) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(45 + 25 * 2) },
            { reps: 8, restTime: 60 * 4, weight: lbsToKg(45 + 45 * 2) },
          ],
        },
        {
          exerciseClass: "Bicep Curls",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(25) },
            { reps: 12, restTime: 60 * 2, weight: lbsToKg(45) },
            { reps: 8, restTime: 60 * 4, weight: lbsToKg(60) },
          ],
        },
        {
          exerciseClass: "Overhead Press",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(45) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(45 + 25 * 2) },
            { reps: 8, restTime: 60 * 4, weight: lbsToKg(45 + 45 * 2) },
          ],
        },
        {
          exerciseClass: "Chin-Ups",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(165) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(165 + 25) },
            { reps: 8, restTime: 60 * 4, weight: lbsToKg(165 + 45) },
          ],
        },
      ],
    },
    {
      title: "Leg Day",
      exercises: [
        {
          exerciseClass: "Leg Curls",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(50) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(75) },
            { reps: 8, restTime: 60 * 4, weight: lbsToKg(100) },
          ],
        },
        {
          exerciseClass: "Calf Raises",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(50) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(75) },
            { reps: 8, restTime: 60 * 4, weight: lbsToKg(100) },
          ],
        },
        {
          exerciseClass: "Squat",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(45 + 25 * 2) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(45 + 45 * 2) },
            {
              reps: 8,
              restTime: 60 * 4,
              weight: lbsToKg(45 + 45 * 2 + 25 * 2),
            },
          ],
        },
        {
          exerciseClass: "Deadlift",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(45 + 25 * 2) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(45 + 35 * 2) },
            {
              reps: 8,
              restTime: 60 * 4,
              weight: lbsToKg(45 + 45 * 2),
            },
          ],
        },
      ],
    },
    {
      title: "Full Body",
      exercises: [
        {
          exerciseClass: "Pull-Down",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(60) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(110) },
            { reps: 8, restTime: 60 * 4, weight: lbsToKg(160) },
          ],
        },
        {
          exerciseClass: "Squat",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(45 + 25 * 2) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(45 + 45 * 2) },
            {
              reps: 8,
              restTime: 60 * 4,
              weight: lbsToKg(45 + 45 * 2 + 25 * 2),
            },
          ],
        },
        {
          exerciseClass: "Bench Press",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(45) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(45 + 25 * 2) },
            { reps: 8, restTime: 60 * 4, weight: lbsToKg(45 + 45 * 2) },
          ],
        },
        {
          exerciseClass: "Deadlift",
          sets: [
            { reps: 18, restTime: 60 * 2, weight: lbsToKg(45 + 25 * 2) },
            { reps: 12, restTime: 60 * 3, weight: lbsToKg(45 + 35 * 2) },
            {
              reps: 8,
              restTime: 60 * 4,
              weight: lbsToKg(45 + 45 * 2),
            },
          ],
        },
      ],
    },
  ];

  await db.insert(workout).values(
    workoutList.map((wo, index) => ({
      appUserId: 1,
      title: wo.title,
      listOrder: index + 1,
      lastSession: null,
    }))
  );

  const workoutIdList = await db
    .select({ id: workout.id, title: workout.title })
    .from(workout)
    .orderBy(asc(workout.id));
  const workoutMap = Object.fromEntries(
    zipArrays(
      workoutIdList.map(({ title }) => title),
      workoutList.map((wo, index) => ({ ...wo, id: workoutIdList[index].id }))
    )
  );

  for (const wo of workoutList) {
    const workoutId = workoutMap[wo.title].id;
    await db.insert(exercise).values(
      wo.exercises.map((ex, index) => ({
        workoutId,
        exerciseClassId: exerciseClassMap[ex.exerciseClass].id,
        listOrder: index + 1,
        initialWeight: lbsToKg(45),
      }))
    );
    const exerciseIdList = await db
      .select({ id: exercise.id })
      .from(exercise)
      .where(eq(exercise.workoutId, workoutId))
      .orderBy(asc(exercise.id));
    const exerciseIdToSetsMap = Object.fromEntries(
      zipArrays(
        exerciseIdList.map(({ id }) => id),
        wo.exercises.map((ex) => ({
          sets: ex.sets,
          exerciseClass: ex.exerciseClass,
        }))
      )
    );
    for (const exerciseId of exerciseIdList.map(({ id }) => id)) {
      await db.insert(exerciseSet).values(
        exerciseIdToSetsMap[exerciseId].sets.map((set, index) => ({
          exerciseId,
          listOrder: index + 1,
          reps: set.reps,
          restTime: set.restTime,
          weight: set.weight,
        }))
      );
      if (
        exerciseClassMap[exerciseIdToSetsMap[exerciseId].exerciseClass]
          .exerciseType === "Resistance"
      ) {
        const resistanceEligibleSetIdList = await db
          .select({ id: exerciseSet.id })
          .from(exerciseSet)
          .where(eq(exerciseSet.exerciseId, exerciseId))
          .orderBy(asc(exerciseSet.id));
        const resistanceEligibleSetMap = Object.fromEntries(
          zipArrays(
            resistanceEligibleSetIdList.map(({ id }) => id),
            exerciseIdToSetsMap[exerciseId].sets
          )
        );
        await db.insert(resistanceSet).values(
          resistanceEligibleSetIdList.map(({ id }) => ({
            exerciseSetId: id,
            totalWeight: resistanceEligibleSetMap[id].weight,
          }))
        );
      }
    }
  }
}

/**
 * Currently not used, but will be used in the future to seed the database with
 */
const prHistoryList = [
  {
    weight: 92.98644,
    reps: 1,
    distance: null,
    time: null,
    date: "2022-01-07T14:12:34.000Z",
    exerciseClassId: 1,
  },
  {
    weight: 97.52236,
    reps: 1,
    distance: null,
    time: null,
    date: "2022-06-07T14:12:34.000Z",
    exerciseClassId: 1,
  },
  {
    weight: 99.79032,
    reps: 1,
    distance: null,
    time: null,
    date: "2022-11-07T14:12:34.000Z",
    exerciseClassId: 1,
  },
  {
    weight: 108.8622,
    reps: 1,
    distance: null,
    time: null,
    date: "2023-11-07T19:12:34.000Z",
    exerciseClassId: 1,
  },
  {
    weight: 106.5942,
    reps: 1,
    distance: null,
    time: null,
    date: "2022-01-07T14:12:34.000Z",
    exerciseClassId: 11,
  },
  {
    weight: 109.7694,
    reps: 1,
    distance: null,
    time: null,
    date: "2022-06-07T14:12:34.000Z",
    exerciseClassId: 11,
  },
  {
    weight: 115.6661,
    reps: 1,
    distance: null,
    time: null,
    date: "2022-11-07T14:12:34.000Z",
    exerciseClassId: 11,
  },
  {
    weight: 129.2738,
    reps: 1,
    distance: null,
    time: null,
    date: "2023-11-07T19:12:34.000Z",
    exerciseClassId: 11,
  },
  {
    weight: 142.8816,
    reps: 1,
    distance: null,
    time: null,
    date: "2022-01-07T14:12:34.000Z",
    exerciseClassId: 10,
  },
  {
    weight: 147.4175,
    reps: 1,
    distance: null,
    time: null,
    date: "2022-06-07T14:12:34.000Z",
    exerciseClassId: 10,
  },
  {
    weight: 161.0253,
    reps: 1,
    distance: null,
    time: null,
    date: "2022-11-07T14:12:34.000Z",
    exerciseClassId: 10,
  },
  {
    weight: 179.169,
    reps: 1,
    distance: null,
    time: null,
    date: "2023-11-07T19:12:34.000Z",
    exerciseClassId: 10,
  },
  {
    weight: 13.60777,
    reps: 12,
    distance: null,
    time: null,
    date: "2022-11-07T14:12:34.000Z",
    exerciseClassId: 4,
  },
];

const realReadTestDb = async (db: DrizzleDatabase) => {
  // building out a query to test if we can get all seeded workouts and their exercises
  const res = await db
    .select({
      title: exerciseClass.title,
      exerciseType: exerciseType.title,
      exerciseEquipment: exerciseEquipment.title,
      bodyPart: bodyPart.title,
      workoutId: workout.id,
      reps: exerciseSet.reps,
      totalWeight: resistanceSet.totalWeight,
    })
    .from(workout)
    .innerJoin(exercise, eq(exercise.workoutId, workout.id))
    .innerJoin(exerciseClass, eq(exerciseClass.id, exercise.exerciseClassId))
    .innerJoin(
      exerciseEquipment,
      eq(exerciseEquipment.id, exerciseClass.exerciseEquipmentId)
    )
    .innerJoin(bodyPart, eq(bodyPart.id, exerciseClass.bodyPartId))
    .innerJoin(exerciseType, eq(exerciseType.id, exerciseClass.exerciseTypeId))
    .innerJoin(exerciseSet, eq(exerciseSet.exerciseId, exercise.id))
    .innerJoin(resistanceSet, eq(resistanceSet.exerciseSetId, exerciseSet.id))
    .where(
      and(
        eq(workout.appUserId, 1),
        eq(workout.id, 2),
        eq(exerciseType.title, "Resistance")
      )
    );

  return res;
};

const seedData = { generate: generateSeedData, read: realReadTestDb };

export { seedData };
