import React, { useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  View,
} from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useLeadingAnimation } from "../hooks/use-leading-animation";
import { useNumericLanes } from "../hooks/use-numeric-lanes";
import { isAsciiDigit } from "../model/display-units";
import type {
  LaminarAlign,
  LaminarShadow,
  MotionRecipe,
  NumericFlowDirection,
} from "../types";
import { LeadingElement } from "./leading-element";
import { SlotShadow } from "./slot-shadow";

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

const slotFrameStyle = {
  position: "relative",
  alignSelf: "flex-start",
  overflow: "hidden",
} as const;

const slotProbeStyle = {
  opacity: 0,
} as const;

const slotDigitStyle = {
  textAlign: "center",
} as const;

const REEL_MIN = -12;
const REEL_MAX = 22;
const REEL_POSITIONS = Array.from({ length: 30 }, (_, index) => index - 10);

// wrap reel positions so a bounded strip can represent an endless digit wheel
const mod = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

type SlotReelProps = {
  readonly current: SharedValue<number>;
  readonly slotHeight: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

// compare flattened style values without treating a new array as a visual change
const equalStyleValue = (left: unknown, right: unknown) =>
  left === right ||
  (Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((value, index) => value === right[index]));

// prevent every parent update from rebuilding the bounded reel
const areSlotReelPropsEqual = (
  previous: SlotReelProps,
  next: SlotReelProps
) => {
  if (
    previous.current !== next.current ||
    previous.slotHeight !== next.slotHeight ||
    previous.className !== next.className
  ) {
    return false;
  }

  const previousStyle = StyleSheet.flatten(previous.textStyle) ?? {};
  const nextStyle = StyleSheet.flatten(next.textStyle) ?? {};
  const previousKeys = Object.keys(previousStyle) as (keyof TextStyle)[];
  const nextKeys = Object.keys(nextStyle);

  return (
    previousKeys.length === nextKeys.length &&
    previousKeys.every((key) =>
      equalStyleValue(previousStyle[key], nextStyle[key])
    )
  );
};

const SlotReel = React.memo(function SlotReel({
  current,
  slotHeight,
  textStyle,
  className,
}: SlotReelProps) {
  // translate one bounded reel instead of mounting a new animated digit per update
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: (-10 - current.value) * slotHeight }],
    }),
    [slotHeight]
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        },
        animatedStyle,
      ]}
    >
      {REEL_POSITIONS.map((position, index) => (
        <Text
          key={position}
          numberOfLines={1}
          style={[
            textStyle,
            slotDigitStyle,
            {
              position: "absolute",
              top: index * slotHeight,
              left: 0,
              right: 0,
              height: slotHeight,
              lineHeight: slotHeight,
            },
          ]}
          className={className}
        >
          {mod(position, 10)}
        </Text>
      ))}
    </Animated.View>
  );
}, areSlotReelPropsEqual);

type SlotColumnProps = {
  readonly digit: number;
  readonly direction: NumericFlowDirection;
  readonly delayMs: number;
  readonly animateIn: boolean;
  readonly motionRecipe: MotionRecipe;
  readonly slotHeight: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
  readonly shadow?: LaminarShadow;
};

function SlotColumn({
  digit,
  direction,
  delayMs,
  animateIn,
  motionRecipe,
  slotHeight,
  textStyle,
  className,
  shadow = false,
}: SlotColumnProps) {
  // cumulative positions let the reel move across digit wraparound without jumps
  const spinInDistance = Math.max(digit, 1);
  const initialDirection = direction || 1;
  const initialValue = animateIn
    ? digit - spinInDistance * initialDirection
    : digit;
  const current = useSharedValue(initialValue);
  const cumulativeRef = useRef(digit);
  const previousDigitRef = useRef(digit);
  const initialRef = useRef(true);
  const exitStateRef = useRef({
    digit,
    direction,
    motionRecipe,
    target: digit,
  });
  const shadowOptions =
    shadow !== null && typeof shadow === "object"
      ? shadow
      : shadow
        ? {}
        : undefined;
  if (digit !== previousDigitRef.current) {
    const previousDigit = previousDigitRef.current;
    let digitDelta: number;

    if (direction > 0) {
      digitDelta =
        digit >= previousDigit
          ? digit - previousDigit
          : 10 - previousDigit + digit;
    } else if (direction < 0) {
      digitDelta =
        previousDigit >= digit
          ? -(previousDigit - digit)
          : -(10 - digit + previousDigit);
    } else {
      digitDelta = digit - previousDigit;
    }

    cumulativeRef.current += digitDelta;
    previousDigitRef.current = digit;
  }

  exitStateRef.current = {
    digit,
    direction,
    motionRecipe,
    target: cumulativeRef.current,
  };

  useEffect(() => {
    // continue the current reel from its last committed target when the column exits
    return () => {
      const exitState = exitStateRef.current;
      const spinOutDistance = Math.max(exitState.digit, 1);
      const exitDirection = exitState.direction || 1;

      current.value = exitState.motionRecipe.driveNumber(
        exitState.target + spinOutDistance * exitDirection
      );
    };
  }, [current]);

  useEffect(() => {
    // keep the reel bounded by recentring after enough cumulative turns
    if (initialRef.current) {
      initialRef.current = false;

      if (!animateIn) {
        return;
      }
    }

    let target = cumulativeRef.current;

    if (target < REEL_MIN + 4 || target > REEL_MAX - 4) {
      const shift = Math.trunc(target / 10) * 10;

      if (shift !== 0) {
        target -= shift;
        cumulativeRef.current = target;
        current.value -= shift;
      }
    }

    exitStateRef.current = {
      digit,
      direction,
      motionRecipe,
      target,
    };

    current.value = motionRecipe.driveNumber(target, delayMs);
  }, [animateIn, current, delayMs, digit, direction, motionRecipe]);

  const reel = (
    <SlotReel
      current={current}
      slotHeight={slotHeight}
      textStyle={textStyle}
      className={className}
    />
  );

  return (
    <View style={[slotFrameStyle, { height: slotHeight }]}>
      <Text
        style={[textStyle, slotProbeStyle, { lineHeight: slotHeight }]}
        className={className}
      >
        0
      </Text>
      {shadowOptions ? (
        <SlotShadow
          slotHeight={slotHeight}
          viewportHeight={slotHeight}
          color={shadowOptions.color}
          size={shadowOptions.size}
        >
          {reel}
        </SlotShadow>
      ) : (
        reel
      )}
    </View>
  );
}

type SlotsRunProps = {
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
  readonly shadow?: LaminarShadow;
};

// render text prefixes beside reusable digit reels
export const SlotsRun = React.memo(
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
    shadow = false,
  }: Readonly<SlotsRunProps>) => {
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
    // numeric lane identity decides which columns stay mounted as values change
    const { units, direction, leadLength } = useNumericLanes(visibleValue);
    const lastValueRef = useRef(visibleValue);
    const hasAnimatedRef = useRef(false);
    // derive one stable row height so every reel position shares the same baseline
    const slotHeight = useMemo(() => {
      const flattenedStyle = StyleSheet.flatten(textStyle);
      const resolvedLineHeight =
        typeof flattenedStyle?.lineHeight === "number"
          ? flattenedStyle.lineHeight
          : undefined;
      const resolvedFontSize =
        typeof flattenedStyle?.fontSize === "number"
          ? flattenedStyle.fontSize
          : fontSize;

      return Math.max(
        12,
        Math.ceil(resolvedLineHeight ?? (resolvedFontSize ?? 16) * 1.18)
      );
    }, [fontSize, textStyle]);

    if (visibleValue !== lastValueRef.current || isLeadingChange) {
      hasAnimatedRef.current = true;
      lastValueRef.current = visibleValue;
    }

    const digitCount = units.filter(isAsciiDigit).length;
    let digitIndex = 0;
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
              : `slot:${units.length - 1 - index}`;

            if (inLead || !isAsciiDigit(unit)) {
              return (
                <Animated.Text
                  key={laneKey}
                  layout={
                    hasAnimated ? motionRecipe.layoutTransition : undefined
                  }
                  exiting={!inLead ? motionRecipe.exitTransition : undefined}
                  style={textStyle}
                  className={className}
                >
                  {unit}
                </Animated.Text>
              );
            }

            const delayMs = (digitCount - 1 - digitIndex) * staggerMs;
            digitIndex += 1;

            return (
              <Animated.View
                key={laneKey}
                layout={
                  hasAnimated ? motionRecipe.layoutTransition : undefined
                }
                entering={
                  hasAnimated ? motionRecipe.enterTransition : undefined
                }
                exiting={motionRecipe.exitTransition}
              >
                <SlotColumn
                  digit={Number(unit)}
                  direction={direction}
                  delayMs={delayMs}
                  animateIn={hasAnimated}
                  motionRecipe={motionRecipe}
                  slotHeight={slotHeight}
                  textStyle={textStyle}
                  className={className}
                  shadow={shadow}
                />
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
    );
  }
);

SlotsRun.displayName = "SlotsRun";
