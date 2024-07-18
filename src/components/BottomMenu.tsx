import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { twColors } from "@/constants/Colors";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.5} // Customize backdrop opacity
    pressBehavior="close" // 'close' | 'collapse' | 'none'
  />
);

const BottomMenu = ({
  children,
  ref,
}: {
  children: BottomSheetModalProps["children"];
  ref?: React.RefObject<BottomSheetModalMethods>;
}) => {
  const snapPoints = useMemo(() => ["50%", "85%"], []);

  return (
    <BottomSheetModal
      // onDismiss={ref?.current?.close}
      index={0}
      ref={ref}
      handleStyle={{
        backgroundColor: twColors.neutral900,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      }}
      handleIndicatorStyle={{
        backgroundColor: twColors.neutral200,
      }}
      backdropComponent={Backdrop}
      snapPoints={snapPoints}
    >
      {children}
      {/* <BottomSheetFlatList
          data={data}
          keyExtractor={(i) => i}
          renderItem={renderItem}
          style={{ backgroundColor: twColors.neutral900 }}
        /> */}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    borderRadius: 10,
    padding: 6,
    margin: 6,
    backgroundColor: twColors.neutral700,
  },
});

export default BottomMenu;
