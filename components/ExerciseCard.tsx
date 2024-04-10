import { Link } from "expo-router";
import {
  UnifiedCardioSet,
  UnifiedResistanceSet,
} from "../app/(app)/(tabs)/workouts/[workoutId]";
import { StyleSheet, Pressable, Text } from "react-native";
import { twColors } from "../constants/Colors";

// const ResistanceExerciseCard = ({
//   workoutId,
//   exerciseId,
//   title,
//   sets,
// }: {
//   workoutId: number;
//   exerciseId: number;
//   title: string;
//   sets: UnifiedResistanceSet[];
// }) => {
//   return (
//     <Link
//       asChild
//       style={exerciseStyles.exerciseCard}
//       href={`/(app)/(tabs)/workouts/${workoutId}/${exerciseId}`}
//     >
//       <Pressable>
//         <Text className="text-3xl font-bold text-black dark:text-white">
//           {title}
//         </Text>
//         {sets.map((set) => (
//           <Text key={set.exercise_set_id} className="text-xl dark:text-white">
//             Reps: {set.reps}
//             {"    "}
//             Rest: {set.rest_time}s{"    "}
//             {set.total_weight}kg
//           </Text>
//         ))}
//       </Pressable>
//     </Link>
//   );
// };

// const CardioExerciseCard = ({
//   workoutId,
//   exerciseId,
//   title,
//   sets,
// }: {
//   workoutId: number;
//   exerciseId: number;
//   title: string;
//   sets: UnifiedCardioSet[];
// }) => {
//   return (
//     <Link
//       asChild
//       style={exerciseStyles.exerciseCard}
//       href={`/(app)/(tabs)/workouts/${workoutId}/${exerciseId}`}
//     >
//       <Pressable
//         style={[
//           exerciseStyles.exerciseCard,
//           { borderWidth: 1, borderColor: "green" },
//         ]}
//       >
//         <Text className=" text-3xl font-bold text-black dark:text-white">
//           {title}
//         </Text>
//         <CardioSetList sets={sets} />
//       </Pressable>
//     </Link>
//   );
// };

//export { ResistanceSetList, CardioSetList };
