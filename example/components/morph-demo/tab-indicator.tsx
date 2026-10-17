import React, { FC } from "react";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";

type Props = {
  indexDecimal: SharedValue<number>;
  tabWidths: SharedValue<number[]>;
  tabHeights: SharedValue<number[]>;
  tabOffsets: SharedValue<number[]>;
  inputRange: number[];
  measurementsReady: SharedValue<boolean>;
  isPagerScrolling: SharedValue<boolean>;
  hasPagerInteraction: SharedValue<boolean>;
  backgroundColor: string;
  shadowColor: string;
};

export const TabIndicator: FC<Props> = ({
  indexDecimal,
  tabWidths,
  tabHeights,
  tabOffsets,
  inputRange,
  measurementsReady,
  isPagerScrolling,
  hasPagerInteraction,
  backgroundColor,
  shadowColor,
}) => {
  const rIndicatorStyle = useAnimatedStyle(() => {
    const progress = Math.min(
      Math.max(indexDecimal.value, inputRange[0] ?? 0),
      inputRange[inputRange.length - 1] ?? 0,
    );
    const activeIndex = Math.min(
      Math.max(Math.round(indexDecimal.value), 0),
      inputRange.length - 1,
    );
    const activeWidth = tabWidths.value[activeIndex] ?? 0;
    const activeHeight = tabHeights.value[activeIndex] ?? 0;
    const activeOffset = tabOffsets.value[activeIndex] ?? 0;

    return {
      width: isPagerScrolling.value
        ? interpolate(
            progress,
            inputRange,
            tabWidths.value,
            Extrapolation.CLAMP,
          )
        : hasPagerInteraction.value
          ? withSpring(activeWidth, { stiffness: 1200, damping: 120 })
          : activeWidth,
      height: isPagerScrolling.value
        ? interpolate(
            progress,
            inputRange,
            tabHeights.value,
            Extrapolation.CLAMP,
          )
        : hasPagerInteraction.value
          ? withSpring(activeHeight, { stiffness: 1200, damping: 120 })
          : activeHeight,
      opacity: measurementsReady.value ? 1 : 0,
      transform: [
        {
          translateX: isPagerScrolling.value
            ? interpolate(
                progress,
                inputRange,
                tabOffsets.value,
                Extrapolation.CLAMP,
              )
            : hasPagerInteraction.value
              ? withSpring(activeOffset, { stiffness: 1200, damping: 120 })
              : activeOffset,
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.indicator,
        { backgroundColor, shadowColor },
        rIndicatorStyle,
      ]}
      pointerEvents="none"
    />
  );
};

const styles = {
  indicator: {
    position: "absolute" as const,
    left: 0,
    borderRadius: 24,
    zIndex: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
};
