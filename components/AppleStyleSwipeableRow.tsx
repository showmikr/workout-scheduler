import React, {
  Component,
  PropsWithChildren,
  useCallback,
  useRef,
} from "react";
import { Animated, StyleSheet, Text, View, I18nManager } from "react-native";

import { RectButton, Swipeable } from "react-native-gesture-handler";

const AppleStyleSwipeableRow: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const swipeableRow = useRef<Swipeable | null>(null);

  const renderLeftActions = useCallback(
    (
      _progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>
    ) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100, 101],
        outputRange: [-50, 0, 0, 1],
        extrapolate: "clamp",
      });
      return (
        <RectButton style={styles.leftAction} onPress={close}>
          <Animated.Text
            style={[
              styles.actionText,
              {
                transform: [{ translateX: trans }],
              },
            ]}
          >
            Archive
          </Animated.Text>
        </RectButton>
      );
    },
    []
  );

  const renderRightAction = useCallback(
    (
      text: string,
      color: string,
      x: number,
      progress: Animated.AnimatedInterpolation<number>
    ) => {
      const trans = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [x, 0],
      });
      const pressHandler = () => {
        close();
        // eslint-disable-next-line no-alert
        window.alert(text);
      };

      return (
        <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
          <RectButton
            style={[styles.rightAction, { backgroundColor: color }]}
            onPress={pressHandler}
          >
            <Text style={styles.actionText}>{text}</Text>
          </RectButton>
        </Animated.View>
      );
    },
    []
  );

  const renderRightActions = useCallback(
    (
      progress: Animated.AnimatedInterpolation<number>,
      dragAnimatedValue: Animated.AnimatedInterpolation<number>,
      swipeable: Swipeable
    ) => (
      <View
        style={{
          width: 192,
          flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
        }}
      >
        {renderRightAction("More", "#C8C7CD", 192, progress)}
        {renderRightAction("Flag", "#ffab00", 128, progress)}
        {renderRightAction("More", "#dd2c00", 64, progress)}
      </View>
    ),
    [renderRightAction]
  );

  const updateRef = useCallback((ref: Swipeable) => {
    swipeableRow.current = ref;
  }, []);

  const close = useCallback(() => {
    swipeableRow.current?.close();
  }, []);

  return (
    <Swipeable
      ref={updateRef}
      friction={1.5}
      enableTrackpadTwoFingerGesture
      leftThreshold={10}
      rightThreshold={10}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        console.log(`Opening swipeable from the ${direction}`);
      }}
      onSwipeableClose={(direction) => {
        console.log(`Closing swipeable to the ${direction}`);
      }}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: "#497AFC",
    justifyContent: "center",
  },
  actionText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "transparent",
    padding: 10,
  },
  rightAction: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});

export default AppleStyleSwipeableRow;
