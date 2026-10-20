import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";

type AnimatedSliderProps = {
  readonly progress: SharedValue<number>;
  readonly pickerSize?: number;
  readonly color?: string;
  readonly trackColor?: string;
  readonly style: StyleProp<
    Omit<ViewStyle, "width" | "height"> & { width: number; height?: number }
  >;
  readonly initialProgress?: number;
};

export const AnimatedSlider = React.memo(function AnimatedSlider({
  progress,
  pickerSize = 35,
  color = "white",
  trackColor = "rgba(0, 0, 0, 0.1)",
  style,
  initialProgress = 0,
}: AnimatedSliderProps) {
  const flattenedStyle = useMemo(() => StyleSheet.flatten(style), [style]);
  const sliderHeight = flattenedStyle?.height ?? 4;
  const sliderWidth = Math.max(0, flattenedStyle?.width ?? 0);
  const defaultPickerBorderRadius = pickerSize / 2;
  const defaultScale = 0.8;

  const translateX = useSharedValue(initialProgress * sliderWidth);
  const contextX = useSharedValue(0);
  const scale = useSharedValue(defaultScale);

  const clampedTranslateX = useDerivedValue(() =>
    clamp(translateX.get(), 0, sliderWidth),
  );

  useDerivedValue(() => {
    progress.set(
      sliderWidth === 0 ? 0 : clampedTranslateX.get() / sliderWidth,
    );
  });

  const gesture = Gesture.Pan()
    .hitSlop(20)
    .onBegin(() => {
      scale.set(withSpring(1));
      contextX.set(clampedTranslateX.get());
    })
    .onUpdate((event) => {
      translateX.set(contextX.get() + event.translationX);
    })
    .onFinalize(() => {
      scale.set(withSpring(defaultScale));
    });

  const pickerStyle = useAnimatedStyle(() => ({
    borderRadius: defaultPickerBorderRadius,
    transform: [
      { translateX: clampedTranslateX.get() - pickerSize / 2 },
      { scale: scale.get() },
    ],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: clampedTranslateX.get(),
  }));

  return (
    <Animated.View
      style={{
        borderRadius: sliderHeight / 2,
        backgroundColor: trackColor,
        ...flattenedStyle,
        height: sliderHeight,
        width: sliderWidth,
        borderCurve: "continuous",
      }}
    >
      <Animated.View
        style={[
          {
            backgroundColor: color,
            borderRadius: sliderHeight / 2,
            borderCurve: "continuous",
          },
          styles.progressBar,
          progressBarStyle,
        ]}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              height: pickerSize,
              top: -pickerSize / 2 + sliderHeight / 2,
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
            },
            styles.picker,
            pickerStyle,
          ]}
        />
      </GestureDetector>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  picker: {
    aspectRatio: 1,
    backgroundColor: "white",
    borderCurve: "continuous",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  progressBar: {
    borderCurve: "continuous",
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
  },
});
