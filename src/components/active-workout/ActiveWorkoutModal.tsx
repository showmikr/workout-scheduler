import { Modal, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ThemedText, ThemedView } from "../Themed";
import {
  useActiveWorkoutActions,
  useIsActiveWorkoutVisible,
} from "@/context/active-workout-provider";
import ActiveWorkoutList from "./ActiveWorkoutList";
import { figmaColors } from "@/constants/Colors";

const ActiveWorkoutModal = () => {
  const isModalVisible = useIsActiveWorkoutVisible();
  const { setModalVisible } = useActiveWorkoutActions();

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isModalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      <ThemedView style={styles.closeButtonView}>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <ThemedText style={{ fontSize: 36 }}>Close</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={{ backgroundColor: figmaColors.primaryBlack }}>
        <ActiveWorkoutList />
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeButtonView: {
    height: 100,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 12,
  },
});

export default ActiveWorkoutModal;
