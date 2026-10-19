import React, {
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  useAnimatedStyle,
} from "react-native-reanimated";
import { useLeadingAnimation } from "../hooks/use-leading-animation";
import { useNumericLanes } from "../hooks/use-numeric-lanes";
import {
  findNumericLeadLength,
  isAsciiDigit,
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "../model/display-units";
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

// Keep each glyph in its own layout box for horizontal ticker reflow.
const glyphSlotStyle = {
  alignSelf: "flex-start",
} as const;

const nativeGlyphSlotStyle = {
  alignSelf: "center",
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
  readonly laneValues: readonly (string | null)[];
  readonly glyphWidths: Readonly<Record<string, number>>;
  readonly glyphMetricsReady: boolean;
  readonly unit: string;
  readonly isLast: boolean;
  readonly laneSpacing: number;
  readonly lineHeight?: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

type NativeTickerFrame = {
  readonly units: readonly string[];
  readonly leadLength: number;
};

// Map each formatted value into stable prefix and trailing numeric lanes.
const getTickerLaneUnit = (
  frame: NativeTickerFrame,
  laneIndex: number,
  layoutLeadLength: number,
  layoutBodyLength: number,
): string | null => {
  let valueIndex = -1;
  if (laneIndex < layoutLeadLength) {
    if (laneIndex < frame.leadLength) valueIndex = laneIndex;
  } else {
    const laneFromRight =
      layoutBodyLength - 1 - (laneIndex - layoutLeadLength);
    const frameBodyLength = frame.units.length - frame.leadLength;
    const frameBodyIndex = frameBodyLength - 1 - laneFromRight;
    if (frameBodyIndex >= 0 && frameBodyIndex < frameBodyLength) {
      valueIndex = frame.leadLength + frameBodyIndex;
    }
  }

  if (valueIndex < 0 || valueIndex >= frame.units.length) {
    return null;
  }

  return frame.units[valueIndex] ?? null;
};

const getTickerFrame = (value: string): NativeTickerFrame => {
  const units = splitDisplayUnits(value);
  return { units, leadLength: findNumericLeadLength(units) };
};

const nativeMeasureRowStyle = {
  position: "absolute",
  left: 0,
  top: 0,
  flexDirection: "row",
  opacity: 0,
} as const;

const nativeMeasureTextStyle = {
  alignSelf: "flex-start",
  margin: 0,
  padding: 0,
  includeFontPadding: false,
  letterSpacing: 0,
} as const;

type GlyphMetricsState = {
  readonly key: string;
  readonly styleKey: string;
  readonly widths: Readonly<Record<string, number>>;
};

// Keep one native text field per glyph so ticker lanes use the same geometry as slots.
const NativeTickerLane = React.memo(function NativeTickerLane({
  animatedText,
  laneValues,
  glyphWidths,
  glyphMetricsReady,
  unit,
  isLast,
  laneSpacing,
  lineHeight,
  className,
  textStyle,
}: NativeTickerLaneProps) {
  const animatedProps = useAnimatedProps<{ text: string }>(
    () => {
      "worklet";

      const frameIndex = Math.max(
        0,
        Math.min(laneValues.length - 1, Math.round(animatedText.index.value)),
      );
      const laneValue = laneValues[frameIndex] ?? null;

      return { text: laneValue ?? " " };
    },
    [animatedText.index, laneValues],
  );
  const animatedLaneStyle = useAnimatedStyle(
    () => {
      "worklet";

      // The shared index drives glyph and width together; a second timing
      // animation would trail the chart during continuous scrubbing.
      const frameIndex = Math.max(
        0,
        Math.min(laneValues.length - 1, Math.round(animatedText.index.value)),
      );
      const laneValue = laneValues[frameIndex] ?? null;
      const hasUnit = laneValue !== null;
      let laneWidth = 0;
      if (laneValue !== null && glyphMetricsReady) {
        laneWidth = glyphWidths[laneValue] ?? 0;
      }

      return {
        ...(!hasUnit || glyphMetricsReady ? { width: laneWidth } : {}),
        marginRight: hasUnit && !isLast ? laneSpacing : 0,
      };
    },
    [
      animatedText.index,
      laneValues,
      glyphWidths,
      glyphMetricsReady,
      isLast,
      laneSpacing,
    ],
  );
  // React Native's iOS TextInput distributes explicit lineHeight differently
  // from Text. Keep the line box on the wrapper/probe and let the single-line
  // native field center its font inside the fixed-height lane.
  const nativeTextBoxStyle = {
    margin: 0,
    padding: 0,
    includeFontPadding: false,
    letterSpacing: 0,
    textAlign: "center" as const,
    textAlignVertical: "center" as const,
    lineHeight: undefined,
  };
  const nativeProbeStyle = {
    ...nativeTextBoxStyle,
    ...(lineHeight !== undefined
      ? { height: lineHeight, lineHeight }
      : undefined),
  };

  return (
    <Animated.View
      style={[
        nativeGlyphSlotStyle,
        {
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          ...(lineHeight !== undefined ? { height: lineHeight } : undefined),
        },
        animatedLaneStyle,
      ]}
    >
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={[textStyle, nativeProbeStyle, { opacity: 0 }]}
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
        className={className}
        style={[
          textStyle,
          nativeTextBoxStyle,
          {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderWidth: 0,
          },
        ]}
        animatedProps={
          animatedProps as unknown as React.ComponentProps<
            typeof AnimatedTextInput
          >["animatedProps"]
        }
      />
    </Animated.View>
  );
});

// Keep native ticker lanes aligned with slot lanes.
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
  const frames = useMemo(
    () =>
      animatedText.values.length > 0
        ? animatedText.values.map(getTickerFrame)
        : [getTickerFrame(fallbackValue)],
    [animatedText.values, fallbackValue],
  );
  const allFrames = useMemo(
    () => [...frames, getTickerFrame(fallbackValue)],
    [fallbackValue, frames],
  );
  const layoutLeadLength = allFrames.reduce(
    (longest, frame) => Math.max(longest, frame.leadLength),
    0,
  );
  const layoutBodyLength = allFrames.reduce(
    (longest, frame) =>
      Math.max(longest, frame.units.length - frame.leadLength),
    0,
  );
  const laneCount = layoutLeadLength + layoutBodyLength;
  const laneValues = useMemo(
    () =>
      Array.from({ length: laneCount }, (_, laneIndex) =>
        frames.map((frame) =>
          getTickerLaneUnit(
            frame,
            laneIndex,
            layoutLeadLength,
            layoutBodyLength,
          ),
        ),
      ),
    [frames, laneCount, layoutBodyLength, layoutLeadLength],
  );
  const measureUnits = useMemo(() => {
    const uniqueUnits = new Set<string>();
    for (const frame of allFrames) {
      for (const unit of frame.units) uniqueUnits.add(unit);
    }
    return Array.from(uniqueUnits);
  }, [allFrames]);
  const metricsStyleKey = JSON.stringify({
    className,
    fontFamily: flattenedTextStyle?.fontFamily,
    fontSize: flattenedTextStyle?.fontSize,
    fontStyle: flattenedTextStyle?.fontStyle,
    fontVariant: flattenedTextStyle?.fontVariant,
    fontWeight: flattenedTextStyle?.fontWeight,
    textTransform: flattenedTextStyle?.textTransform,
    writingDirection: flattenedTextStyle?.writingDirection,
  });
  const metricsKey = `${metricsStyleKey}\u0000${measureUnits.join("\u0000")}`;
  const [glyphMetrics, setGlyphMetrics] = useState<GlyphMetricsState>({
    key: "",
    styleKey: "",
    widths: {},
  });
  const pendingMetricsRef = useRef<{
    key: string;
    widths: Record<string, number>;
  }>({
    key: metricsKey,
    widths: {},
  });
  if (pendingMetricsRef.current.key !== metricsKey) {
    pendingMetricsRef.current = {
      key: metricsKey,
      widths:
        glyphMetrics.styleKey === metricsStyleKey
          ? { ...glyphMetrics.widths }
          : {},
    };
  }
  const glyphMetricsReady = glyphMetrics.key === metricsKey;

  const fallbackFrame = getTickerFrame(fallbackValue);
  const fallbackLaneUnit = (laneIndex: number) => {
    if (laneIndex < layoutLeadLength) {
      return fallbackFrame.units[laneIndex] ?? "0";
    }

    const laneFromRight =
      layoutBodyLength - 1 - (laneIndex - layoutLeadLength);
    const bodyLength = fallbackFrame.units.length - fallbackFrame.leadLength;
    const bodyIndex = bodyLength - 1 - laneFromRight;
    return bodyIndex >= 0
      ? fallbackFrame.units[fallbackFrame.leadLength + bodyIndex] ?? "0"
      : "0";
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
      {Array.from({ length: laneCount }, (_, index) => {
        const unit = fallbackLaneUnit(index);
        const isLeadLane = index < layoutLeadLength;
        const laneFromRight = isLeadLane
          ? undefined
          : layoutBodyLength - 1 - (index - layoutLeadLength);

        return (
          <NativeTickerLane
            key={
              isLeadLane
                ? `native:lead:${index}`
                : `native:body:${laneFromRight}`
            }
            animatedText={animatedText}
            laneValues={laneValues[index] ?? []}
            glyphWidths={glyphMetrics.widths}
            glyphMetricsReady={glyphMetricsReady}
            unit={unit}
            isLast={index === laneCount - 1}
            laneSpacing={laneSpacing}
            lineHeight={lineHeight}
            textStyle={textStyle}
            className={className}
          />
        );
      })}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={nativeMeasureRowStyle}
      >
        {measureUnits.map((unit) => (
          <Text
            key={`measure:${metricsStyleKey}:${unit}`}
            onLayout={(event) => {
              const width = event.nativeEvent.layout.width;
              const pending = pendingMetricsRef.current;
              if (pending.key !== metricsKey || pending.widths[unit] === width) {
                return;
              }

              pending.widths[unit] = width;
              if (
                measureUnits.every((measuredUnit) =>
                  Object.prototype.hasOwnProperty.call(
                    pending.widths,
                    measuredUnit,
                  ),
                )
              ) {
                setGlyphMetrics({
                  key: metricsKey,
                  styleKey: metricsStyleKey,
                  widths: { ...pending.widths },
                });
              }
            }}
            style={[textStyle, nativeMeasureTextStyle]}
            className={className}
          >
            {normalizeDisplayUnit(unit)}
          </Text>
        ))}
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
  readonly structureChanged: boolean;
  readonly motionRecipe: MotionRecipe;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

// Keep unchanged glyph lanes out of React reconciliation.
const TickerLane = React.memo(function TickerLane({
  unit,
  isLast,
  laneSpacing,
  lineHeight,
  animateLayout,
  structureChanged,
  motionRecipe,
  textStyle,
  className,
}: TickerLaneProps) {
  return (
    <Animated.View
      layout={animateLayout ? motionRecipe.layoutTransition : undefined}
      entering={
        structureChanged ? motionRecipe.enterTransition : undefined
      }
      exiting={motionRecipe.exitTransition}
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

// Keep ticker lanes horizontally reflowing. Fade only lanes added or removed
// when the formatted value's structure changes, matching the slots renderer.
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
  const previousValue = lastValueRef.current;
  const structureSignature = useMemo(
    () =>
      units
        .map((unit) => (isAsciiDigit(unit) ? "digit" : unit))
        .join("\u0000"),
    [units],
  );
  const previousStructureSignatureRef = useRef(structureSignature);
  if (value !== previousValue || isLeadingChange) {
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
              animateLayout={hasAnimated}
              structureChanged={structureChanged}
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
