import { View, Text, Pressable, StyleSheet, Button } from "react-native";
import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

export default function ModalExample() {
  const [modal, setModal] = useState(false);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["25%", "50%"], []);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <BottomSheetModalProvider>
      <View
        style={{
          alignItems: "center",
          marginTop: 10,
          backgroundColor: "#0D0D0D",
        }}
      >
        <Pressable
          style={{
            backgroundColor: modal ? "#343434" : "#1C1C1C",
            alignItems: "center",
            width: 200,
            padding: 10,
            borderRadius: 5,
          }}
          onPress={() => {
            setModal(!modal);
            handlePresentModalPress;
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: modal ? "bold" : "300",
            }}
          >
            {modal ? "Modal Active" : "Modal Deactive"}
          </Text>
        </Pressable>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
        >
          <BottomSheetView style={styles.contentContainer}>
            <Text>Awesome 🎉</Text>
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});
