import React, { useMemo, useRef, type ReactNode } from "react";
import { type StyleProp, type TextStyle, View } from "react-native";
import Animated from "react-native-reanimated";
import { useLeadingAnimation } from "../hooks/use-leading-animation";
import { useNumericLanes } from "../hooks/use-numeric-lanes";
import type { LaminarAlign, MotionRecipe } from "../types";
import { LeadingElement } from "./leading-element";
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
  readonly leading?: ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap?: number;
  readonly ready?: boolean;
};

// arrange numeric lanes from left to right while the hook preserves their identities
export const NumberRun = React.memo(
  ({
    value,
    motionRecipe,
    align,
    fontSize,
    textStyle,
    staggerMs,
    className,
    leading,
    leadingKey,
    leadingGap = 0,
    ready = true,
  }: Readonly<NumberRunProps>) => {
    const hasDisplayedRef = useRef(false);
    const displayedValueRef = useRef(value);
    const displayedLeadingRef = useRef(leading);
    const displayedLeadingKeyRef = useRef(leadingKey);
    const displayedLeadingGapRef = useRef(leadingGap);
    const shouldDisplayTarget = ready || !hasDisplayedRef.current;
    const visibleValue = shouldDisplayTarget
      ? value
      : displayedValueRef.current;
    const visibleLeading = shouldDisplayTarget
      ? leading
      : displayedLeadingRef.current;
    const visibleLeadingKey = shouldDisplayTarget
      ? leadingKey
      : displayedLeadingKeyRef.current;
    const visibleLeadingGap = shouldDisplayTarget
      ? leadingGap
      : displayedLeadingGapRef.current;

    if (shouldDisplayTarget) {
      hasDisplayedRef.current = true;
      displayedValueRef.current = value;
      displayedLeadingRef.current = leading;
      displayedLeadingKeyRef.current = leadingKey;
      displayedLeadingGapRef.current = leadingGap;
    }

    const {
      elementEnterTransition,
      elementExitTransition,
      isLeadingChange,
      isLeadingSwap,
    } = useLeadingAnimation({
      leading: visibleLeading,
      leadingKey: visibleLeadingKey,
      leadingGap: visibleLeadingGap,
      motionRecipe,
    });
    // the hook owns lane identity while this component owns row placement and timing
    const { units, laneKeys, direction, leadLength } =
      useNumericLanes(visibleValue);
    const lastValueRef = useRef(visibleValue);
    const hasAnimatedRef = useRef(false);

    // skip enter animations on first paint so the number feels settled
    if (visibleValue !== lastValueRef.current || isLeadingChange) {
      hasAnimatedRef.current = true;
      lastValueRef.current = visibleValue;
    }

    // scale travel from the font while keeping a minimum visible movement
    const travelDistance = useMemo(
      () => Math.max(8, Math.round((fontSize ?? 16) * 0.4)),
      [fontSize]
    );
    const hasAnimated = hasAnimatedRef.current;

    return (
      <View style={[rowStyle, rowAlignStyles[align]]}>
        <LeadingElement
          leading={visibleLeading}
          leadingKey={visibleLeadingKey}
          leadingGap={visibleLeadingGap}
          enterTransition={
            hasAnimated ? motionRecipe.enterTransition : undefined
          }
          elementEnterTransition={
            isLeadingSwap ? elementEnterTransition : undefined
          }
          exitTransition={motionRecipe.exitTransition}
          elementExitTransition={elementExitTransition}
        />
        <Animated.View
          layout={isLeadingChange ? motionRecipe.layoutTransition : undefined}
          style={rowStyle}
        >
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
        </Animated.View>
      </View>
    );
  }
);

NumberRun.displayName = "NumberRun";
