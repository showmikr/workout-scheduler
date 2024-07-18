import { twColors } from "@/constants/Colors";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";

/**
 * A custom backdrop component for the BottomSheetModal with some sensible default styling
 * that can be overriden. This backdrop has the following properties set as defaults:
 * - `disappearsOnIndex`: The index at which the backdrop should disappear (-1 means it will always be visible).
 * - `appearsOnIndex`: The index at which the backdrop should appear (0 means it will always be visible).
 * - `opacity`: The opacity of the backdrop (0.5 in this case).
 * - `pressBehavior`: The behavior when the backdrop is pressed ('close' means the bottom sheet will close).
 */
const GenericBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.5} // Customize backdrop opacity
    pressBehavior="close" // 'close' | 'collapse' | 'none'
    {...props}
  />
);

/**
 * A reusable bottom sheet modal component that provides some good default styling
 * that can be overridden. It uses the `@gorhom/bottom-sheet` library to create a bottom sheet modal with
 * a custom backdrop. The bottom sheet modal can be customized through the provided props.
 *
 * @param props - The props for the bottom sheet modal.
 * @param props.onDismiss - A callback function that is called when the bottom sheet is dismissed.
 * @param props.index - The initial index of the bottom sheet.
 * @param props.handleStyle - The style for the bottom sheet handle.
 * @param props.handleIndicatorStyle - The style for the bottom sheet handle indicator.
 * @param props.backdropComponent - The component to use for the backdrop.
 * @param props.snapPoints - The snap points for the bottom sheet.
 * @param ref - A ref to the bottom sheet modal.
 * @returns The bottom sheet modal component.
 */
const GenericBottomSheet = forwardRef(
  (props: BottomSheetModalProps, ref: React.Ref<BottomSheetModal>) => {
    const snapPoints = useMemo(() => ["25%", "90%"], []);
    return (
      <BottomSheetModal
        // onDismiss={ref?.current?.close}
        ref={ref}
        index={0}
        handleStyle={{
          backgroundColor: twColors.neutral800,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
        handleIndicatorStyle={{
          backgroundColor: twColors.neutral400,
        }}
        backdropComponent={(props) => <GenericBackdrop {...props} />}
        snapPoints={snapPoints}
        {...props}
      />
    );
  }
);

export default GenericBottomSheet;
