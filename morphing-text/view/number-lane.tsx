import React, { useMemo } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";
import Animated from "react-native-reanimated";
import { isAsciiDigit } from "../model/display-units";
import { createShiftTransition } from "../motion/entry-exit-builders";
import type { MotionRecipe, NumericFlowDirection } from "../types";

const laneStyle = {
  position: "relative",
  alignSelf: "flex-start",
} as const;

const laneProbeStyle = {
  opacity: 0,
} as const;

const laneTokenStyle = {
  position: "absolute",
  top: 0,
  left: 0,
} as const;

type NumberLaneProps = {
  readonly unit: string;
  readonly tokenKey: number;
  readonly isLead: boolean;
  readonly hasAnimated: boolean;
  readonly delayMs: number;
  readonly direction: NumericFlowDirection;
  readonly travelDistance: number;
  readonly motionRecipe: MotionRecipe;
  readonly className?: string;
  readonly textStyle?: StyleProp<TextStyle>;
};

export const NumberLane = React.memo(
  ({
    unit,
    tokenKey,
    isLead,
    hasAnimated,
    delayMs,
    direction,
    travelDistance,
    motionRecipe,
    className,
    textStyle,
  }: NumberLaneProps) => {
    const shouldAnimate = hasAnimated && !isLead;
    const usesDigitTravel = isAsciiDigit(unit);
    const verticalOffset =
      direction > 0
        ? travelDistance
        : direction < 0
          ? -travelDistance
          : 0;

    const enterTransition = useMemo(
      () =>
        createShiftTransition({
          delayMs,
          durationMs: motionRecipe.durationMs,
          easing: motionRecipe.easing,
          fromOpacity: 0,
          toOpacity: 1,
          fromTranslateY: usesDigitTravel ? verticalOffset : 0,
          toTranslateY: 0,
          fromScale: 0.6,
          toScale: 1,
        }),
      [
        delayMs,
        motionRecipe.durationMs,
        motionRecipe.easing,
        usesDigitTravel,
        verticalOffset,
      ]
    );

    const exitTransition = useMemo(
      () =>
        createShiftTransition({
          delayMs,
          durationMs: motionRecipe.durationMs,
          easing: motionRecipe.easing,
          fromOpacity: 1,
          toOpacity: 0,
          fromTranslateY: 0,
          toTranslateY: usesDigitTravel ? -verticalOffset : 0,
          fromScale: 1,
          toScale: 0.6,
        }),
      [
        delayMs,
        motionRecipe.durationMs,
        motionRecipe.easing,
        usesDigitTravel,
        verticalOffset,
      ]
    );

    if (!shouldAnimate) {
      return (
        <Text className={className} style={textStyle}>
          {unit}
        </Text>
      );
    }

    return (
      <Animated.View
        layout={motionRecipe.layoutTransition}
        entering={motionRecipe.enterTransition}
        exiting={motionRecipe.exitTransition}
        style={laneStyle}
      >
        {/* this hidden copy owns layout while the animated token swaps on top */}
        <Text className={className} style={[textStyle, laneProbeStyle]}>
          {unit}
        </Text>

        <Animated.Text
          key={`token:${tokenKey}`}
          entering={enterTransition}
          exiting={exitTransition}
          className={className}
          style={[textStyle, laneTokenStyle]}
        >
          {unit}
        </Animated.Text>
      </Animated.View>
    );
  }
);

NumberLane.displayName = "NumberLane";
