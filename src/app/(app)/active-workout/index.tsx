import {
  useActiveWorkoutActions,
  useActiveWorkoutSelectedSet,
  useActiveWorkoutSetWeight,
  useActiveWorkoutStatus,
} from "@/context/active-workout-provider";
import { router } from "expo-router";
import ActiveWorkoutScreen from "@/components/active-workout/ActiveWorkoutScreen";
import React from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { colorBox } from "@/constants/Colors";
import WeightAdjustView from "@/components/WeightAdjustView";
import { View } from "react-native";
import { ThemedText } from "@/components/Themed";

export default function ActiveWorkoutPage() {
  const isActive = useActiveWorkoutStatus();
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const { setBottomSheet, setSelectedSetCell } = useActiveWorkoutActions();

  if (!isActive) {
    // Return to previous page
    router.dismiss();
  }

  // Set bottom sheet ref once React has properly passed the ref to BottomSheetModal
  React.useEffect(() => {
    setBottomSheet(bottomSheetRef.current);
  }, [bottomSheetRef.current]);

  return (
    <>
      <ActiveWorkoutScreen />
      <BottomSheetModal
        ref={bottomSheetRef}
        onDismiss={() => {
          setSelectedSetCell(null);
        }}
        enableDynamicSizing={true}
        backgroundStyle={{ backgroundColor: colorBox.stoneGrey950 }}
        handleIndicatorStyle={{ backgroundColor: colorBox.stoneGrey400 }}
        handleStyle={{
          borderTopColor: colorBox.stoneGrey900,
          borderTopWidth: 1,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
        }}
      >
        <BottomSheetView>
          <BottomSheetContainer />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

const WeightAdjustContainer = ({ setId }: { setId: number }) => {
  const weight = useActiveWorkoutSetWeight(setId);
  return <WeightAdjustView setId={setId} />;
};

const BottomSheetContainer = () => {
  const selectedSet = useActiveWorkoutSelectedSet();
  if (selectedSet) {
    if (selectedSet.param === "weight") {
      return <WeightAdjustContainer setId={selectedSet.setId} />;
    }
  }
  return (
    <View
      style={{
        flex: 1,
        height: 360,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemedText>Under Construction...</ThemedText>
    </View>
  );
};
