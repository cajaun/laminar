import React, { useRef, type ReactNode } from "react";
import { type StyleProp, type TextStyle, View } from "react-native";
import Animated from "react-native-reanimated";
import { useLeadingAnimation } from "../hooks/use-leading-animation";
import { useNumericLanes } from "../hooks/use-numeric-lanes";
import { isAsciiDigit } from "../model/display-units";
import type {
  LaminarAlign,
  LaminarShadow,
  MotionRecipe,
} from "../types";
import { LeadingElement } from "./leading-element";

const rowStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
} as const;

// keep the layout transition on the wrapper so new glyphs keep their width
const glyphSlotStyle = {
  alignSelf: "flex-start",
} as const;

const rowAlignStyles = {
  left: { alignSelf: "flex-start" },
  center: { alignSelf: "center" },
  right: { alignSelf: "flex-end" },
} as const;

type TickerRunProps = {
  readonly value: string;
  readonly motionRecipe: MotionRecipe;
  readonly align: LaminarAlign;
  readonly fontSize?: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
  readonly leading?: ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap?: number;
  readonly ready?: boolean;
  // keep shadow for api compatibility while ticker values stay crisp
  readonly shadow?: LaminarShadow;
};

// keep ticker lanes inline with crisp replacements
export const TickerRun = React.memo(
  ({
    value,
    motionRecipe,
    align,
    textStyle,
    className,
    leading,
    leadingKey,
    leadingGap = 0,
    ready = true,
  }: Readonly<TickerRunProps>) => {
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
    const { units, leadLength } = useNumericLanes(visibleValue);
    const lastValueRef = useRef(visibleValue);
    const hasAnimatedRef = useRef(false);

    if (visibleValue !== lastValueRef.current || isLeadingChange) {
      hasAnimatedRef.current = true;
      lastValueRef.current = visibleValue;
    }

    const hasAnimated = hasAnimatedRef.current;
    const bodyLength = Math.max(units.length - leadLength, 0);

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
            const bodyIndex = index - leadLength;
            const isDigit = !inLead && isAsciiDigit(unit);
            const laneKey = inLead
              ? `flow:lead:${index}`
              : `flow:${bodyLength - 1 - bodyIndex}`;
            const unitKey = isDigit ? laneKey : `${laneKey}:${unit}`;

            return (
              <Animated.View
                // keep each lane mounted so width changes move following digits
                key={unitKey}
                layout={
                  hasAnimated ? motionRecipe.layoutTransition : undefined
                }
                style={glyphSlotStyle}
              >
                <Animated.Text style={textStyle} className={className}>
                  {unit}
                </Animated.Text>
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
    );
  }
);

TickerRun.displayName = "TickerRun";
