import React, { useMemo, useRef, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type StyleProp,
  type TextStyle,
  View,
} from "react-native";
import Animated, {
  createAnimatedComponent,
  useAnimatedProps,
} from "react-native-reanimated";
import { useLeadingAnimation } from "../hooks/use-leading-animation";
import { useNumericLanes } from "../hooks/use-numeric-lanes";
import { isAsciiDigit } from "../model/display-units";
import type {
  LaminarAlign,
  LaminarAnimatedText,
  LaminarShadow,
  MotionRecipe,
} from "../types";
import { LeadingElement } from "./leading-element";

const rowStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
} as const;

// keep each glyph in the row so surrounding digits can reflow
const glyphSlotStyle = {
  alignSelf: "flex-start",
} as const;

const rowAlignStyles = {
  left: { alignSelf: "flex-start" },
  center: { alignSelf: "center" },
  right: { alignSelf: "flex-end" },
} as const;

const AnimatedTextInput = createAnimatedComponent(TextInput);

type TickerRunProps = {
  readonly value: string;
  readonly animatedText?: LaminarAnimatedText;
  readonly motionRecipe: MotionRecipe;
  readonly align: LaminarAlign;
  readonly fontSize?: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
  readonly leading?: ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap?: number;
  readonly ready?: boolean;
  // keep shadow for api compatibility
  readonly shadow?: LaminarShadow;
};

type NativeTickerRunProps = {
  readonly fallbackValue: string;
  readonly animatedText: LaminarAnimatedText;
  readonly align: LaminarAlign;
  readonly className?: string;
  readonly leading?: ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap?: number;
  readonly textStyle?: StyleProp<TextStyle>;
};

type NativeTickerLaneProps = {
  readonly animatedText: LaminarAnimatedText;
  readonly fallbackValue: string;
  readonly laneIndex: number;
  readonly unit: string;
  readonly isLast: boolean;
  readonly laneSpacing: number;
  readonly lineHeight?: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

// update one displayed unit on the ui thread
const NativeTickerLane = React.memo(function NativeTickerLane({
  animatedText,
  fallbackValue,
  laneIndex,
  unit,
  isLast,
  laneSpacing,
  lineHeight,
  textStyle,
  className,
}: NativeTickerLaneProps) {
  const animatedProps = useAnimatedProps<{ text: string }>(
    () => {
      "worklet";

      const lastIndex = Math.max(0, animatedText.values.length - 1);
      const index = Math.max(
        0,
        Math.min(lastIndex, Math.round(animatedText.index.value)),
      );
      const nextValue = animatedText.values[index] ?? fallbackValue;
      const valueOffset = Math.max(0, fallbackValue.length - nextValue.length);
      const valueIndex = laneIndex - valueOffset;

      return {
        text: valueIndex >= 0 ? nextValue.charAt(valueIndex) || " " : " ",
      };
    },
    [animatedText.values, fallbackValue, laneIndex, unit],
  );
  const nativeTextBoxStyle = {
    margin: 0,
    padding: 0,
    includeFontPadding: false,
    letterSpacing: 0,
    textAlign: "center" as const,
    textAlignVertical: "center" as const,
    ...(lineHeight !== undefined
      ? { height: lineHeight, lineHeight }
      : undefined),
  };

  return (
    <View
      style={[
        glyphSlotStyle,
        {
          position: "relative",
          ...(lineHeight !== undefined ? { height: lineHeight } : undefined),
        },
        !isLast && laneSpacing !== 0
          ? { marginRight: laneSpacing }
          : undefined,
      ]}
    >
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={[textStyle, nativeTextBoxStyle, { opacity: 0 }]}
        className={className}
      >
        {unit}
      </Text>
      <AnimatedTextInput
        accessibilityElementsHidden
        caretHidden
        defaultValue={unit}
        editable={false}
        multiline={false}
        pointerEvents="none"
        style={[
          textStyle,
          nativeTextBoxStyle,
          {
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            borderWidth: 0,
          },
        ]}
        animatedProps={
          animatedProps as unknown as React.ComponentProps<
            typeof AnimatedTextInput
          >["animatedProps"]
        }
      />
    </View>
  );
});

// keep native ticker lanes aligned with slot lanes
const NativeTickerRun = React.memo(function NativeTickerRun({
  fallbackValue,
  animatedText,
  align,
  className,
  leading,
  leadingKey,
  leadingGap = 0,
  textStyle,
}: NativeTickerRunProps) {
  const flattenedTextStyle = StyleSheet.flatten(textStyle);
  const lineHeight =
    typeof flattenedTextStyle?.lineHeight === "number"
      ? flattenedTextStyle.lineHeight
      : undefined;
  const laneSpacing =
    typeof flattenedTextStyle?.letterSpacing === "number"
      ? flattenedTextStyle.letterSpacing
      : 0;
  const { units } = useNumericLanes(fallbackValue);

  return (
    <View
      style={[
        rowStyle,
        rowAlignStyles[align],
        {
          position: "relative",
          ...(lineHeight !== undefined ? { height: lineHeight } : undefined),
        },
      ]}
    >
      <LeadingElement
        leading={leading}
        leadingKey={leadingKey}
        leadingGap={leadingGap}
      />
      {units.map((unit, index) => (
        <NativeTickerLane
          key={`native:${index}`}
          animatedText={animatedText}
          fallbackValue={fallbackValue}
          laneIndex={index}
          unit={unit}
          isLast={index === units.length - 1}
          laneSpacing={laneSpacing}
          lineHeight={lineHeight}
          textStyle={textStyle}
          className={className}
        />
      ))}
    </View>
  );
});

type TickerLaneProps = {
  readonly unit: string;
  readonly isLast: boolean;
  readonly laneSpacing: number;
  readonly lineHeight?: number;
  readonly animateLayout: boolean;
  readonly motionRecipe: MotionRecipe;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

// keep unchanged lanes out of scrub reconciliation
const TickerLane = React.memo(function TickerLane({
  unit,
  isLast,
  laneSpacing,
  lineHeight,
  animateLayout,
  motionRecipe,
  textStyle,
  className,
}: TickerLaneProps) {
  return (
    <Animated.View
      layout={animateLayout ? motionRecipe.layoutTransition : undefined}
      style={[
        glyphSlotStyle,
        {
          alignItems: "center",
          justifyContent: "center",
          ...(lineHeight !== undefined ? { height: lineHeight } : undefined),
        },
        !isLast && laneSpacing !== 0
          ? { marginRight: laneSpacing }
          : undefined,
      ]}
    >
      <Animated.Text
        style={[
          textStyle,
          {
            includeFontPadding: false,
            letterSpacing: 0,
            textAlignVertical: "center",
            ...(lineHeight !== undefined
              ? { height: lineHeight, lineHeight }
              : undefined),
          },
        ]}
        className={className}
      >
        {unit}
      </Animated.Text>
    </Animated.View>
  );
});

TickerLane.displayName = "TickerLane";

// keep ticker lanes inline with crisp replacements
export const TickerRun = React.memo(
  ({
    value,
    animatedText,
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
      isLeadingChange,
      isLeadingSwap,
    } = useLeadingAnimation({
      leading: visibleLeading,
      leadingKey: visibleLeadingKey,
      leadingGap: visibleLeadingGap,
      motionRecipe,
    });
    const { units, leadLength } = useNumericLanes(visibleValue);
    const flattenedTextStyle = StyleSheet.flatten(textStyle);
    const lineHeight =
      typeof flattenedTextStyle?.lineHeight === "number"
        ? flattenedTextStyle.lineHeight
        : undefined;
    const laneSpacing = useMemo(() => {
      return typeof flattenedTextStyle?.letterSpacing === "number"
        ? flattenedTextStyle.letterSpacing
        : 0;
    }, [flattenedTextStyle]);
    const lastValueRef = useRef(visibleValue);
    const hasAnimatedRef = useRef(false);
    const structureSignature = useMemo(
      () =>
        units
          .map((unit) => (isAsciiDigit(unit) ? "digit" : unit))
          .join("\u0000"),
      [units],
    );
    const previousStructureSignatureRef = useRef(structureSignature);

    if (visibleValue !== lastValueRef.current || isLeadingChange) {
      hasAnimatedRef.current = true;
      lastValueRef.current = visibleValue;
    }

    const hasAnimated = hasAnimatedRef.current;
    const structureChanged =
      hasAnimated &&
      previousStructureSignatureRef.current !== structureSignature;
    previousStructureSignatureRef.current = structureSignature;
    const bodyLength = Math.max(units.length - leadLength, 0);

    if (animatedText) {
      const tickerLayoutValue = animatedText.values.reduce(
        (longest, candidate) =>
          candidate.length > longest.length ? candidate : longest,
        visibleValue,
      );

      return (
        <NativeTickerRun
          animatedText={animatedText}
          align={align}
          fallbackValue={tickerLayoutValue}
          className={className}
          leading={visibleLeading}
          leadingKey={visibleLeadingKey}
          leadingGap={visibleLeadingGap}
          textStyle={textStyle}
        />
      );
    }

    return (
      <View
        style={[rowStyle, rowAlignStyles[align], { height: lineHeight }]}
      >
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
        />
        <Animated.View
          layout={isLeadingChange ? motionRecipe.layoutTransition : undefined}
          style={[rowStyle, { height: lineHeight }]}
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
              <TickerLane
                // keep each lane mounted so width changes move following digits
                key={unitKey}
                unit={unit}
                isLast={index === units.length - 1}
                laneSpacing={laneSpacing}
                lineHeight={lineHeight}
                animateLayout={structureChanged}
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

TickerRun.displayName = "TickerRun";
