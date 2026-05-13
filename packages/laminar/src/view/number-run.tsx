import React, { useMemo, useRef } from "react";
import { type StyleProp, type TextStyle, View } from "react-native";
import { useNumericLanes } from "../hooks/use-numeric-lanes";
import type { LaminarAlign, MotionRecipe } from "../types";
import { NumberLane } from "./number-lane";

const rowStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
} as const;

const rowAlignStyles = {
  left: { alignSelf: "flex-start" },
  center: { alignSelf: "center" },
  right: { alignSelf: "flex-end" },
} as const;

type NumberRunProps = {
  readonly value: string;
  readonly motionRecipe: MotionRecipe;
  readonly align: LaminarAlign;
  readonly fontSize?: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly staggerMs: number;
  readonly className?: string;
};

export const NumberRun = React.memo(
  ({
    value,
    motionRecipe,
    align,
    fontSize,
    textStyle,
    staggerMs,
    className,
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
      <View style={[rowStyle, rowAlignStyles[align]]}>
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
              textStyle={textStyle}
              className={className}
            />
          );
        })}
      </View>
    );
  }
);

NumberRun.displayName = "NumberRun";
