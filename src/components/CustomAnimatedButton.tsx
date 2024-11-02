import { useMemo } from "react";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/**
 * @param style controls the style of the button view that holds the child elements. Think of it as the button view that gets animated
 * @param contentContainerStyle controls the style of the view outside the button. Think of it as the view outside of the animated button
 * @param activeOpacity opacity between 0 and 1. Ex: 0.5 means half opacity when pressed. Defaults to 0.6
 */
const CustomAnimatedButton = ({
  onPress,
  style,
  contentContainerStyle,
  activeOpacity = 0.6,
  children,
}: {
  onPress: () => void;
  contentContainerStyle?: PressableProps["style"];
  activeOpacity?: number;
  style?: ViewStyle;
  children: React.ReactElement;
}) => {
  // Create a shared value for scale
  const scale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);
  const idiotProofOpacity = useMemo(
    () => Math.min(1, Math.max(0, activeOpacity)),
    [activeOpacity]
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: (1 - scale.value) * 50 },
      ],
      opacity: buttonOpacity.value,
    };
  });

  const onPressIn = () => {
    scale.value = withTiming(0.95, {
      duration: 50,
      easing: Easing.in(Easing.quad),
    });
    buttonOpacity.value = withTiming(idiotProofOpacity, {
      duration: 100,
      easing: Easing.in(Easing.quad),
    });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { mass: 0.1, stiffness: 100, damping: 10 });
    buttonOpacity.value = withTiming(1, {
      duration: 50,
      easing: Easing.in(Easing.quad),
    });
  };

  return (
    <Pressable
      unstable_pressDelay={25}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={contentContainerStyle}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

export default CustomAnimatedButton;
