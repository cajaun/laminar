import React, { useMemo, useRef } from "react";
import { type StyleProp, type TextStyle, View } from "react-native";
import { useNumericLanes } from "../hooks/use-numeric-lanes";
import type { MotionRecipe } from "../types";
import { NumberLane } from "./number-lane";

const rowStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
} as const;

type NumberRunProps = {
  readonly value: string;
  readonly motionRecipe: MotionRecipe;
  readonly fontSize?: number;
  readonly className?: string;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly staggerMs: number;
};

export const NumberRun = React.memo(
  ({
    value,
    motionRecipe,
    fontSize,
    className,
    textStyle,
    staggerMs,
  }: Readonly<NumberRunProps>) => {
    const { units, laneKeys, direction, leadLength } = useNumericLanes(value);
    const lastValueRef = useRef(value);
    const hasAnimatedRef = useRef(false);

    // skip enter animations on first paint so the number feels settled
    if (value !== lastValueRef.current) {
      hasAnimatedRef.current = true;
      lastValueRef.current = value;
    }

    const travelDistance = useMemo(
      () => Math.max(8, Math.round((fontSize ?? 16) * 0.4)),
      [fontSize]
    );
    const hasAnimated = hasAnimatedRef.current;

    return (
      <View style={rowStyle}>
        {units.map((unit, index) => {
          const inLead = index < leadLength;
          const laneKey = inLead
            ? `lead:${index}`
            : `lane:${units.length - 1 - index}`;

          return (
            <NumberLane
              key={laneKey}
              unit={unit}
              tokenKey={laneKeys[index]}
              isLead={inLead}
              hasAnimated={hasAnimated}
              delayMs={index * staggerMs}
              direction={direction}
              travelDistance={travelDistance}
              motionRecipe={motionRecipe}
              className={className}
              textStyle={textStyle}
            />
          );
        })}
      </View>
    );
  }
);

NumberRun.displayName = "NumberRun";
