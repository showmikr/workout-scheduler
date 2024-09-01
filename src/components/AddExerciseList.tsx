import {
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AddCustomExerciseCard from "./AddCustomExerciseCard";
import { ExerciseClass } from "@/utils/exercise-types";
import ExerciseClassCard from "./ExerciseClassCard";
import { useState } from "react";
import { ThemedText } from "./Themed";
import { figmaColors } from "@/constants/Colors";
import { useExerciseClasses } from "@/hooks/exercises/exercise-classes";

export default function AddExerciseList({
  onPress,
}: {
  onPress: (exerciseClass: ExerciseClass) => void;
}) {
  const { data: exerciseClasses, isLoading } = useExerciseClasses();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!exerciseClasses || isLoading) {
    return (
      <View style={[styles.wrapper, { flex: 1, flexDirection: "row" }]}>
        <ActivityIndicator style={styles.loadingSpinner} />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={exerciseClasses}
        contentContainerStyle={{
          marginTop: 16,
          gap: 1 * 16,
        }}
        renderItem={({ item }) => (
          <ExerciseClassCard
            title={item.title}
            equipmentId={item.exercise_equipment_id}
            onPress={() => onPress(item)}
          />
        )}
        ListFooterComponent={
          <View style={styles.footerSection}>
            <ThemedText style={styles.footerHeader}>
              Not finding what you're looking for?
            </ThemedText>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <ThemedText style={styles.customExerciseBtn}>
                Add Custom Exercise
              </ThemedText>
            </TouchableOpacity>
          </View>
        }
      />
      <Modal
        animationType="fade"
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
          onPress={() => {
            setIsModalVisible(false);
            console.log("Pressed outside modal");
          }}
        >
          <AddCustomExerciseCard
            dismissModal={() => setIsModalVisible(false)}
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
  },
  loadingSpinner: { paddingRight: 14, height: 2.25 * 14 },
  loadingText: {
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
  footerSection: {
    marginTop: 16,
    marginBottom: 128,
    alignItems: "center",
    gap: 16,
  },
  footerHeader: { color: figmaColors.greyLighter, fontSize: 16 },
  customExerciseBtn: { color: figmaColors.addGreen, fontSize: 24 },
});
