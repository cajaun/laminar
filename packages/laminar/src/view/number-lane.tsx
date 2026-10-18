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
  readonly direction: NumericFlowDirection;
  readonly travelDistance: number;
  readonly motionRecipe: MotionRecipe;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

// render one place value lane with a layout probe and animated token
export const NumberLane = React.memo(
  ({
    unit,
    tokenKey,
    isLead,
    hasAnimated,
    direction,
    travelDistance,
    motionRecipe,
    textStyle,
    className,
  }: NumberLaneProps) => {
    // keep punctuation in place while digits follow numeric direction
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
        motionRecipe.durationMs,
        motionRecipe.easing,
        usesDigitTravel,
        verticalOffset,
      ]
    );

    const exitTransition = useMemo(
      () =>
        createShiftTransition({
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
        motionRecipe.durationMs,
        motionRecipe.easing,
        usesDigitTravel,
        verticalOffset,
      ]
    );

    // keep prefix units in the row beside the animated value
    if (isLead) {
      return <Text style={textStyle} className={className}>{unit}</Text>;
    }

    return (
      <Animated.View
        layout={hasAnimated ? motionRecipe.layoutTransition : undefined}
        entering={
          hasAnimated ? motionRecipe.enterTransition : undefined
        }
        exiting={motionRecipe.exitTransition}
        style={laneStyle}
      >
        {/* keep the hidden copy as the lane layout probe */}
        <Text style={[textStyle, laneProbeStyle]}>
          {unit}
        </Text>

        <Animated.Text
          key={`token:${tokenKey}`}
          entering={hasAnimated ? enterTransition : undefined}
          exiting={exitTransition}
          style={[textStyle, laneTokenStyle]}
          className={className}
        >
          {unit}
        </Animated.Text>
      </Animated.View>
    );
  }
);

NumberLane.displayName = "NumberLane";
