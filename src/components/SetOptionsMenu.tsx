import React, { forwardRef, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { twColors } from "@/constants/Colors";
import { UnifiedResistanceSet } from "@/utils/exercise-types";
import { deleteSet } from "@/utils/query-sets";
import { useSQLiteContext } from "expo-sqlite";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import GenericBottomSheet from "./GenericBottomSheet";

const SetOptionsMenu = forwardRef(
  (
    props: {
      workoutId: number;
      exerciseId: number;
      exerciseSet: UnifiedResistanceSet;
    },
    ref: React.Ref<BottomSheetModal>
  ) => {
    const { workoutId, exerciseId, exerciseSet } = props;
    const snapPoints = useMemo(() => ["25%"], []);
    const db = useSQLiteContext();
    const thisModal = useBottomSheetModal();
    const queryClient = useQueryClient();
    const deleteSetMutation = useMutation({
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
    return (
      <GenericBottomSheet ref={ref} snapPoints={snapPoints}>
        <BottomSheetView style={styles.container}>
          <Pressable
            style={styles.deleteButton}
            onPress={() => {
              thisModal.dismiss();
              deleteSetMutation.mutate({
                db,
                exerciseSetId: exerciseSet.exercise_set_id,
              });
            }}
          >
            <Text style={styles.deleteTitle}>Delete Set</Text>
          </Pressable>
        </BottomSheetView>
      </GenericBottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: twColors.neutral800,
    alignItems: "center",
  },
  deleteTitle: {
    fontSize: 1.25 * 14,
    color: "#f66",
  },
  deleteButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "red",
    marginTop: "5%",
  },
});

export default SetOptionsMenu;
