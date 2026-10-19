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

// keep each glyph in the legacy non-animated ticker flow
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

// Use one native text field so changing a ticker value updates one native view.
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
  const animatedProps = useAnimatedProps<{ text: string }>(
    () => {
      "worklet";

      const lastIndex = Math.max(0, animatedText.values.length - 1);
      const index = Math.max(
        0,
        Math.min(lastIndex, Math.round(animatedText.index.value)),
      );

      return { text: animatedText.values[index] ?? fallbackValue };
    },
    [animatedText.values, fallbackValue],
  );
  const nativeTextBoxStyle = {
    margin: 0,
    padding: 0,
    includeFontPadding: false,
    textAlign: "right" as const,
    textAlignVertical: "center" as const,
    ...(lineHeight !== undefined
      ? { height: lineHeight, lineHeight }
      : undefined),
  };

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
      <View
        pointerEvents="none"
        style={{
          position: "relative",
          alignSelf: "flex-start",
          flexShrink: 0,
          ...(lineHeight !== undefined ? { height: lineHeight } : undefined),
        }}
      >
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          numberOfLines={1}
          style={[textStyle, nativeTextBoxStyle, { opacity: 0 }]}
          className={className}
        >
          {fallbackValue}
        </Text>
        <AnimatedTextInput
          accessibilityElementsHidden
          caretHidden
          defaultValue={fallbackValue}
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

type FlowTickerRunProps = {
  readonly value: string;
  readonly motionRecipe: MotionRecipe;
  readonly align: LaminarAlign;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
  readonly leading?: ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap: number;
};

// keep ticker lanes inline with crisp replacements
const FlowTickerRun = React.memo(function FlowTickerRun({
  value,
  motionRecipe,
  align,
  textStyle,
  className,
  leading,
  leadingKey,
  leadingGap,
}: FlowTickerRunProps) {
  const {
    elementEnterTransition,
    isLeadingChange,
    isLeadingSwap,
  } = useLeadingAnimation({ leading, leadingKey, leadingGap, motionRecipe });
  const { units, leadLength } = useNumericLanes(value);
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
  const lastValueRef = useRef(value);
  const hasAnimatedRef = useRef(false);
  const structureSignature = useMemo(
    () =>
      units
        .map((unit) => (isAsciiDigit(unit) ? "digit" : unit))
        .join("\u0000"),
    [units],
  );
  const previousStructureSignatureRef = useRef(structureSignature);

  if (value !== lastValueRef.current || isLeadingChange) {
    hasAnimatedRef.current = true;
    lastValueRef.current = value;
  }

  const hasAnimated = hasAnimatedRef.current;
  const structureChanged =
    hasAnimated &&
    previousStructureSignatureRef.current !== structureSignature;
  previousStructureSignatureRef.current = structureSignature;
  const bodyLength = Math.max(units.length - leadLength, 0);

  return (
    <View style={[rowStyle, rowAlignStyles[align], { height: lineHeight }]}>
      <LeadingElement
        leading={leading}
        leadingKey={leadingKey}
        leadingGap={leadingGap}
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
});

// update either a native animated text field or the regular React ticker
export const TickerRun = React.memo(function TickerRun({
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
}: Readonly<TickerRunProps>) {
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
    <FlowTickerRun
      value={visibleValue}
      motionRecipe={motionRecipe}
      align={align}
      textStyle={textStyle}
      className={className}
      leading={visibleLeading}
      leadingKey={visibleLeadingKey}
      leadingGap={visibleLeadingGap}
    />
  );
});

TickerRun.displayName = "TickerRun";
