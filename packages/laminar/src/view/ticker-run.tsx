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

// The wrapper owns the changing layout box. Keeping the Text itself out of
// the layout transition prevents a newly rendered glyph from being clipped by
// the previous glyph's narrower bounds.
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
  readonly staggerMs: number;
  readonly className?: string;
  readonly leading?: ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap?: number;
  readonly ready?: boolean;
  /** accepted for API compatibility; flow values stay crisp and unmasked */
  readonly shadow?: LaminarShadow;
};

// Render the data-ticker behavior from the reference: stable inline lanes and
// crisp in-place replacements. There is deliberately no reel, vertical travel,
// opacity fade, or viewport mask in this renderer.
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
                // Keep each digit lane mounted across updates. Replacing the
                // node here makes the glyph snap to its new width; a stable
                // lane lets Reanimated interpolate that width and the
                // positions of the following glyphs, which is the subtle
                // horizontal movement in the reference ticker.
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
