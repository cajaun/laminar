import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableTabs({
  targetScale = 0.95,
  children,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: {
  targetScale?: number;
  style?: StyleProp<ViewStyle>;
} & Exclude<PressableProps, "onPressIn" | "onPressOut" | "style">) {
  const reducedMotion = useReducedMotion();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPressIn={(e) => {
        "worklet";
        if (onPressIn) {
          runOnJS(onPressIn)(e);
        }
        cancelAnimation(scale);
        scale.value = withTiming(targetScale, { duration: 0.001 });
      }}
      onPressOut={(e) => {
        "worklet";
        if (onPressOut) {
          runOnJS(onPressOut)(e);
        }
        cancelAnimation(scale);
        scale.value = withTiming(1, { duration: 0.001 });
      }}
      style={[!reducedMotion && animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}