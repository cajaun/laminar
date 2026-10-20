import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  StyleSheet,
  Text,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
  View,
} from "react-native";
import Animated, {
  type EntryExitAnimationFunction,
  type SharedValue,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useLeadingAnimation } from "../hooks/use-leading-animation";
import { useNumericLanes } from "../hooks/use-numeric-lanes";
import { isAsciiDigit, splitDisplayUnits } from "../model/display-units";
import type {
  LaminarAlign,
  LaminarShadow,
  MotionRecipe,
  NumericFlowDirection,
  SlotMode,
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

type SlotRollCellProps = {
  readonly children: ReactNode;
  readonly slotHeight: number;
  readonly top: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

const SlotRollCell = React.memo(function SlotRollCell({
  children,
  slotHeight,
  top,
  textStyle,
  className,
}: SlotRollCellProps) {
  return (
    <View
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        height: slotHeight,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        numberOfLines={1}
        style={[textStyle, slotDigitStyle]}
        className={className}
      >
        {children}
      </Text>
    </View>
  );
});

const magnitudeViewportStyle = {
  width: "100%",
} as const;

const magnitudeAlignStyles = {
  left: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  right: { alignItems: "flex-end" },
} as const;

const REEL_MIN = -12;
const REEL_MAX = 22;
const REEL_POSITIONS = Array.from({ length: 30 }, (_, index) => index - 10);

// wrap reel positions within the digit wheel
const mod = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const createSlotRollExitTransition = (
  current: SharedValue<number>,
  slotHeight: number | undefined,
  motionRecipe: MotionRecipe,
): EntryExitAnimationFunction => {
  const distance = slotHeight ?? 0;
  const { durationMs, easing } = motionRecipe;

  return () => {
    "worklet";

    return {
      initialValues: {
        transform: [{ translateY: -current.value * distance }],
      },
      animations: {
        transform: [
          { translateY: withTiming(0, { duration: durationMs, easing }) },
        ],
      },
    };
  };
};

type SlotReelProps = {
  readonly current: SharedValue<number>;
  readonly slotHeight: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

// compare flattened styles so new arrays do not trigger updates
const equalStyleValue = (left: unknown, right: unknown) =>
  left === right ||
  (Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((value, index) => value === right[index]));

// skip reel updates when the parent changes unrelated props
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
  // translate the bounded reel when its target digit changes
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
        <View
          key={position}
          style={{
            position: "absolute",
            top: index * slotHeight,
            left: 0,
            right: 0,
            height: slotHeight,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            numberOfLines={1}
            style={[textStyle, slotDigitStyle]}
            className={className}
          >
            {mod(position, 10)}
          </Text>
        </View>
      ))}
    </Animated.View>
  );
}, areSlotReelPropsEqual);

type SlotColumnProps = {
  readonly current: SharedValue<number>;
  readonly slotHeight: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly reelTextStyle?: StyleProp<TextStyle>;
  readonly className?: string;
  readonly shadow?: LaminarShadow;
};

const SlotColumn = React.memo(function SlotColumn({
  current,
  slotHeight,
  textStyle,
  reelTextStyle,
  className,
  shadow = false,
}: SlotColumnProps) {
  const shadowOptions =
    shadow !== null && typeof shadow === "object"
      ? shadow
      : shadow
        ? {}
        : undefined;
  // preserve the reel child while its target changes
  const reel = useMemo(
    () => (
      <SlotReel
        current={current}
        slotHeight={slotHeight}
        textStyle={reelTextStyle ?? textStyle}
        className={className}
      />
    ),
    [className, current, reelTextStyle, slotHeight, textStyle],
  );

  return (
    <View
      collapsable={false}
      style={[slotFrameStyle, { height: slotHeight }]}
    >
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
});

type SlotTextLaneProps = {
  readonly unit: string;
  readonly isLead: boolean;
  readonly isLast: boolean;
  readonly laneSpacing: number;
  readonly structureChanged: boolean;
  readonly motionRecipe: MotionRecipe;
  readonly slotHeight?: number;
  readonly reelTextStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

// keep punctuation and leading symbols outside digit updates
const SlotTextLane = React.memo(function SlotTextLane({
  unit,
  isLead,
  isLast,
  laneSpacing,
  structureChanged,
  motionRecipe,
  slotHeight,
  reelTextStyle,
  className,
}: SlotTextLaneProps) {
  return (
    <Animated.View
      layout={
        structureChanged ? motionRecipe.layoutTransition : undefined
      }
      exiting={!isLead ? motionRecipe.exitTransition : undefined}
      style={{
        ...(slotHeight !== undefined ? { height: slotHeight } : undefined),
        alignItems: "center",
        justifyContent: "center",
        ...(!isLast && laneSpacing !== 0
          ? { marginRight: laneSpacing }
          : undefined),
      }}
    >
      <Animated.Text style={reelTextStyle} className={className}>
        {unit}
      </Animated.Text>
    </Animated.View>
  );
});

type SlotSymbolLaneProps = {
  readonly symbol: string;
  readonly isLast: boolean;
  readonly laneSpacing: number;
  readonly structureChanged: boolean;
  readonly animateIn: boolean;
  readonly motionRecipe: MotionRecipe;
  readonly slotHeight?: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

const SlotSymbolLane = React.memo(function SlotSymbolLane({
  symbol,
  isLast,
  laneSpacing,
  structureChanged,
  animateIn,
  motionRecipe,
  slotHeight,
  textStyle,
  className,
}: SlotSymbolLaneProps) {
  const current = useSharedValue(animateIn ? 0 : 1);
  const exitTransition = useMemo(
    () => createSlotRollExitTransition(current, slotHeight, motionRecipe),
    [current, motionRecipe.durationMs, motionRecipe.easing, slotHeight],
  );
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: -current.value * (slotHeight ?? 0) }],
    }),
    [slotHeight],
  );

  useEffect(() => {
    if (slotHeight === undefined || !animateIn) {
      current.value = 1;
      return;
    }

    current.value = motionRecipe.driveNumber(1);
  }, [animateIn, current, motionRecipe, slotHeight, symbol]);

  const strip = useMemo(() => {
    if (slotHeight === undefined) {
      return null;
    }

    return (
      <Animated.View
        pointerEvents="none"
        exiting={exitTransition}
        style={[
          { position: "absolute", top: 0, left: 0, right: 0 },
          animatedStyle,
        ]}
      >
        <SlotRollCell
          slotHeight={slotHeight}
          top={0}
          textStyle={textStyle}
          className={className}
        >
          {"\u00a0"}
        </SlotRollCell>
        <SlotRollCell
          slotHeight={slotHeight}
          top={slotHeight}
          textStyle={textStyle}
          className={className}
        >
          {symbol}
        </SlotRollCell>
      </Animated.View>
    );
  }, [
    animatedStyle,
    className,
    exitTransition,
    slotHeight,
    symbol,
    textStyle,
  ]);

  return (
    <Animated.View
      layout={structureChanged ? motionRecipe.layoutTransition : undefined}
      exiting={motionRecipe.exitTransition}
      style={{
        ...(slotHeight !== undefined ? { height: slotHeight } : undefined),
        alignItems: "center",
        justifyContent: "center",
        ...(!isLast && laneSpacing !== 0
          ? { marginRight: laneSpacing }
          : undefined),
      }}
    >
      {slotHeight === undefined ? (
        <Animated.Text style={textStyle} className={className}>
          {symbol}
        </Animated.Text>
      ) : (
        <View
          collapsable={false}
          style={[slotFrameStyle, { height: slotHeight }]}
        >
          <Text
            style={[textStyle, slotProbeStyle, { lineHeight: slotHeight }]}
            className={className}
          >
            {symbol}
          </Text>
          {strip}
        </View>
      )}
    </Animated.View>
  );
});

type MagnitudeSlotsViewportProps = {
  readonly align: LaminarAlign;
  readonly fitContentWidth?: number;
  readonly motionRecipe: MotionRecipe;
  readonly layoutTransition?: MotionRecipe["layoutTransition"];
  readonly measurement?: React.ReactNode;
  readonly children: React.ReactNode;
};

const MagnitudeSlotsViewport = React.memo(function MagnitudeSlotsViewport({
  align,
  fitContentWidth,
  motionRecipe,
  layoutTransition,
  measurement,
  children,
}: MagnitudeSlotsViewportProps) {
  const fitScale = useSharedValue(1);
  const hasInitializedFitScaleRef = useRef(false);
  const [fitInitialized, setFitInitialized] = useState(false);
  const [availableWidth, setAvailableWidth] = useState<number>();
  const captureAvailableWidth = useCallback(
    (event: LayoutChangeEvent) => {
      const nextWidth = Math.max(
        0,
        Math.floor(event.nativeEvent.layout.width),
      );

      setAvailableWidth((currentWidth) =>
        currentWidth !== undefined && Math.abs(currentWidth - nextWidth) < 1
          ? currentWidth
          : nextWidth,
      );
    },
    [],
  );
  const fitScaleTarget =
    fitContentWidth !== undefined &&
    availableWidth !== undefined &&
    availableWidth > 0
      ? Math.min(1, availableWidth / Math.max(fitContentWidth, 1))
      : undefined;

  useLayoutEffect(() => {
    if (fitScaleTarget === undefined) {
      return;
    }

    if (!hasInitializedFitScaleRef.current) {
      hasInitializedFitScaleRef.current = true;
      fitScale.value = fitScaleTarget;
      setFitInitialized(true);
      return;
    }

    fitScale.value = motionRecipe.driveNumber(fitScaleTarget);
  }, [fitScale, fitScaleTarget, motionRecipe]);

  const fitStyle = useAnimatedStyle(
    () => ({ transform: [{ scale: fitScale.value }] }),
    [fitScale],
  );

  return (
    <View
      onLayout={captureAvailableWidth}
      style={[
        magnitudeViewportStyle,
        magnitudeAlignStyles[align],
        { opacity: fitInitialized ? 1 : 0 },
      ]}
    >
      <Animated.View
        layout={layoutTransition}
        style={[rowStyle, rowAlignStyles[align], fitStyle]}
      >
        {children}
      </Animated.View>
      {measurement}
    </View>
  );
});

type SlotDigitLaneProps = {
  readonly digit: number;
  readonly initialDigit?: number;
  readonly direction: NumericFlowDirection;
  readonly animateIn: boolean;
  readonly isLast: boolean;
  readonly laneSpacing: number;
  readonly structureChanged: boolean;
  readonly motionRecipe: MotionRecipe;
  readonly slotHeight?: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly reelTextStyle?: StyleProp<TextStyle>;
  readonly className?: string;
  readonly shadow?: LaminarShadow;
};

const SlotDigitLane = React.memo(function SlotDigitLane({
  digit,
  initialDigit,
  direction,
  animateIn,
  isLast,
  laneSpacing,
  structureChanged,
  motionRecipe,
  slotHeight,
  textStyle,
  reelTextStyle,
  className,
  shadow,
}: SlotDigitLaneProps) {
  // track cumulative positions when digits wrap around
  const spinInDistance = Math.max(digit, 1);
  const initialDirection = direction || 1;
  const targetStart = initialDigit ?? digit;
  const initialValue =
    initialDigit !== undefined
      ? initialDigit
      : animateIn
        ? digit - spinInDistance * initialDirection
        : digit;
  const current = useSharedValue(initialValue);
  // keep the target digit separate from the reel spin position
  const cumulativeRef = useRef(targetStart);
  const previousDigitRef = useRef(targetStart);
  const initialRef = useRef(true);
  const drivenTargetRef = useRef<number | null>(null);
  const exitStateRef = useRef({
    digit,
    direction,
    motionRecipe,
    target: targetStart,
  });

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
    return () => {
      const exitState = exitStateRef.current;
      const spinOutDistance = Math.max(exitState.digit, 1);
      const exitDirection = exitState.direction || 1;

      current.value = exitState.motionRecipe.driveNumber(
        exitState.target + spinOutDistance * exitDirection
      );
    };
  }, [current]);

  useLayoutEffect(() => {
    // recenter the reel after it accumulates enough turns
    if (initialRef.current) {
      initialRef.current = false;

      if (!animateIn && initialDigit === undefined) {
        drivenTargetRef.current = cumulativeRef.current;
        return;
      }
    }

    let target = cumulativeRef.current;

    if (target < REEL_MIN + 4 || target > REEL_MAX - 4) {
      // map negative targets into the first cycle
      const shift = Math.floor(target / 10) * 10;

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

    // keep unchanged reels still when direction changes
    if (drivenTargetRef.current === target) {
      return;
    }

    drivenTargetRef.current = target;

    current.value = motionRecipe.driveNumber(target);
  }, [animateIn, current, digit, direction, initialDigit, motionRecipe]);

  return (
    <Animated.View
      layout={
        structureChanged ? motionRecipe.layoutTransition : undefined
      }
      entering={
        structureChanged ? motionRecipe.enterTransition : undefined
      }
      exiting={motionRecipe.exitTransition}
      style={
        !isLast && laneSpacing !== 0
          ? { marginRight: laneSpacing }
          : undefined
      }
    >
      {slotHeight === undefined ? (
        <Text style={textStyle} className={className}>
          {digit}
        </Text>
      ) : (
        <SlotColumn
          current={current}
          slotHeight={slotHeight}
          textStyle={textStyle}
          reelTextStyle={reelTextStyle}
          className={className}
          shadow={shadow}
        />
      )}
    </Animated.View>
  );
});

type SlotRisingDigitLaneProps = {
  readonly digit: number;
  readonly initialDigit?: number;
  readonly animateIn: boolean;
  readonly isLast: boolean;
  readonly laneSpacing: number;
  readonly structureChanged: boolean;
  readonly motionRecipe: MotionRecipe;
  readonly slotHeight?: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly reelTextStyle?: StyleProp<TextStyle>;
  readonly className?: string;
  readonly shadow?: LaminarShadow;
};

const SlotRisingDigitLane = React.memo(function SlotRisingDigitLane({
  digit,
  initialDigit,
  animateIn,
  isLast,
  laneSpacing,
  structureChanged,
  motionRecipe,
  slotHeight,
  textStyle,
  reelTextStyle,
  className,
  shadow = false,
}: SlotRisingDigitLaneProps) {
  const shouldAnimateIn =
    initialDigit !== undefined
      ? initialDigit !== digit
      : animateIn;
  const previousDigitRef = useRef(initialDigit ?? digit);
  const fromDigitRef = useRef<number | undefined>(
    initialDigit ?? (animateIn ? undefined : digit),
  );
  const digitChanged = previousDigitRef.current !== digit;
  const fromDigit = digitChanged
    ? previousDigitRef.current
    : fromDigitRef.current;
  const hasInitializedRef = useRef(false);
  const current = useSharedValue(shouldAnimateIn ? 0 : 1);
  const exitTransition = useMemo(
    () => createSlotRollExitTransition(current, slotHeight, motionRecipe),
    [current, motionRecipe.durationMs, motionRecipe.easing, slotHeight],
  );
  const animatedStyle = useAnimatedStyle(
    () => ({ transform: [{ translateY: -current.value * (slotHeight ?? 0) }] }),
    [slotHeight],
  );

  useLayoutEffect(() => {
    if (slotHeight === undefined) {
      return;
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      previousDigitRef.current = digit;
      current.value =
        shouldAnimateIn ? motionRecipe.driveNumber(1) : 1;
      return;
    }

    const previousDigit = previousDigitRef.current;

    if (previousDigit !== digit) {
      previousDigitRef.current = digit;
      fromDigitRef.current = previousDigit;
      current.value = 0;
      current.value = motionRecipe.driveNumber(1);
    }
  }, [current, digit, motionRecipe, shouldAnimateIn, slotHeight]);

  const shadowOptions =
    shadow !== null && typeof shadow === "object"
      ? shadow
      : shadow
        ? {}
        : undefined;
  const digitStyle = reelTextStyle ?? textStyle;
  const strip = useMemo(() => {
    if (slotHeight === undefined) {
      return null;
    }

    return (
      <Animated.View
        pointerEvents="none"
        exiting={exitTransition}
        style={[
          { position: "absolute", top: 0, left: 0, right: 0 },
          animatedStyle,
        ]}
      >
        <SlotRollCell
          slotHeight={slotHeight}
          top={0}
          textStyle={digitStyle}
          className={className}
        >
          {fromDigit === undefined ? "\u00a0" : fromDigit}
        </SlotRollCell>
        <SlotRollCell
          slotHeight={slotHeight}
          top={slotHeight}
          textStyle={digitStyle}
          className={className}
        >
          {digit}
        </SlotRollCell>
      </Animated.View>
    );
  }, [
    animatedStyle,
    className,
    digit,
    digitStyle,
    exitTransition,
    fromDigit,
    slotHeight,
  ]);
  const risingStrip =
    slotHeight !== undefined && shadowOptions ? (
      <SlotShadow
        slotHeight={slotHeight}
        viewportHeight={slotHeight}
        color={shadowOptions.color}
        size={shadowOptions.size}
      >
        {strip!}
      </SlotShadow>
    ) : (
      strip
    );

  return (
    <Animated.View
      layout={structureChanged ? motionRecipe.layoutTransition : undefined}
      entering={
        structureChanged ? motionRecipe.enterTransition : undefined
      }
      exiting={motionRecipe.exitTransition}
      style={
        !isLast && laneSpacing !== 0
          ? { marginRight: laneSpacing }
          : undefined
      }
    >
      {slotHeight === undefined ? (
        <Text style={textStyle} className={className}>
          {digit}
        </Text>
      ) : (
        <View
          collapsable={false}
          style={[slotFrameStyle, { height: slotHeight }]}
        >
          <Text
            style={[textStyle, slotProbeStyle, { lineHeight: slotHeight }]}
            className={className}
          >
            {digit}
          </Text>
          {risingStrip}
        </View>
      )}
    </Animated.View>
  );
});

type SlotsRunProps = {
  readonly value: string;
  readonly fromValue?: string;
  readonly motionRecipe: MotionRecipe;
  readonly align: LaminarAlign;
  readonly fontSize?: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
  readonly leading?: ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap?: number;
  readonly ready?: boolean;
  readonly shadow?: LaminarShadow;
  readonly slotMode?: SlotMode;
  readonly fitContentWidth?: number;
};

// place prefix symbols beside reusable digit reels
export const SlotsRun = React.memo(
  ({
    value,
    fromValue,
    motionRecipe,
    align,
    fontSize,
    textStyle,
    className,
    leading,
    leadingKey,
    leadingGap = 0,
    ready = true,
    shadow = false,
    slotMode = "standard",
    fitContentWidth,
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
      isLeadingChange,
      isLeadingSwap,
    } = useLeadingAnimation({
      leading: visibleLeading,
      leadingKey: visibleLeadingKey,
      leadingGap: visibleLeadingGap,
      motionRecipe,
    });
    // preserve digit columns with stable numeric lane identities
    const { units, direction, leadLength } = useNumericLanes(visibleValue);
    const isMagnitudeMode = slotMode === "magnitude";
    const initialDigits = useMemo(() => {
      if (!fromValue || fromValue === visibleValue) return undefined;

      const fromUnits = splitDisplayUnits(fromValue);
      const fromLeadLength = fromUnits.findIndex(isAsciiDigit);
      const resolvedFromLeadLength =
        fromLeadLength === -1 ? fromUnits.length : fromLeadLength;
      const targetTailLength = units.length - leadLength;
      const fromTail = fromUnits.slice(resolvedFromLeadLength);
      const fromDigits = fromTail.filter(isAsciiDigit);
      const initialValues: Array<number | undefined> = [];
      let magnitudeDigitIndex = 0;

      for (let index = 0; index < units.length; index += 1) {
        if (!isAsciiDigit(units[index])) {
          initialValues.push(undefined);
          continue;
        }

        const targetTailIndex = index - leadLength;
        const fromIndex =
          fromTail.length - targetTailLength + targetTailIndex;
        const fromUnit = isMagnitudeMode
          ? fromDigits[magnitudeDigitIndex++]
          : fromTail[fromIndex];
        initialValues.push(
          isAsciiDigit(fromUnit) ? Number(fromUnit) : undefined,
        );
      }

      return initialValues;
    }, [fromValue, isMagnitudeMode, leadLength, units, visibleValue]);
    const lastValueRef = useRef(visibleValue);
    const hasAnimatedRef = useRef(false);
    // animate digit changes and reflow when the number of lanes changes
    const structureSignature = useMemo(
      () =>
        units
          .map((unit) => (isAsciiDigit(unit) ? "digit" : unit))
          .join("\u0000"),
      [units],
    );
    const previousStructureSignatureRef = useRef(structureSignature);
    // measure the native text line when callers omit font size
    const flattenedTextStyle = StyleSheet.flatten(textStyle);
    const resolvedLineHeight =
      typeof flattenedTextStyle?.lineHeight === "number"
        ? flattenedTextStyle.lineHeight
        : undefined;
    const resolvedFontSize =
      typeof flattenedTextStyle?.fontSize === "number"
        ? flattenedTextStyle.fontSize
        : fontSize;
    const slotMeasurementKey = JSON.stringify([
      resolvedLineHeight,
      resolvedFontSize,
      flattenedTextStyle?.fontFamily,
      flattenedTextStyle?.fontStyle,
      flattenedTextStyle?.fontWeight,
      flattenedTextStyle?.fontVariant,
      flattenedTextStyle?.includeFontPadding,
      flattenedTextStyle?.letterSpacing,
    ]);
    const [measuredSlotHeight, setMeasuredSlotHeight] = useState<{
      key: string;
      height: number;
    }>();
    const currentMeasuredSlotHeight =
      measuredSlotHeight?.key === slotMeasurementKey
        ? measuredSlotHeight.height
        : undefined;
    const slotHeight = useMemo(() => {
      const inferredHeight =
        resolvedLineHeight ??
        (resolvedFontSize !== undefined
          ? resolvedFontSize * 1.18
          : currentMeasuredSlotHeight);

      return inferredHeight === undefined
        ? undefined
        : Math.max(12, Math.ceil(inferredHeight));
    }, [currentMeasuredSlotHeight, resolvedFontSize, resolvedLineHeight]);
    const captureSlotHeight = useCallback(
      (event: LayoutChangeEvent) => {
        const height = Math.max(12, Math.ceil(event.nativeEvent.layout.height));
        setMeasuredSlotHeight((current) =>
          current?.key === slotMeasurementKey && current.height === height
            ? current
            : { key: slotMeasurementKey, height },
        );
      },
      [slotMeasurementKey],
    );
    // align prefix glyphs to the reel line box
    const slotTextStyle: StyleProp<TextStyle> = useMemo(
      () => [
        textStyle,
        {
          ...(slotHeight !== undefined
            ? { height: slotHeight, lineHeight: slotHeight }
            : undefined),
          // apply text spacing between slot lanes
          letterSpacing: 0,
        },
      ],
      [slotHeight, textStyle]
    );
    const laneSpacing = useMemo(() => {
      const flattenedStyle = StyleSheet.flatten(textStyle);
      return typeof flattenedStyle?.letterSpacing === "number"
        ? flattenedStyle.letterSpacing
        : 0;
    }, [textStyle]);
    const reelTextStyle: StyleProp<TextStyle> | undefined = useMemo(() => {
      const flattenedStyle = StyleSheet.flatten(slotTextStyle);

      if (!flattenedStyle) {
        return undefined;
      }

      const {
        height: _height,
        ...visibleTextStyle
      } = flattenedStyle;

      return {
        ...visibleTextStyle,
        ...(slotHeight !== undefined ? { lineHeight: slotHeight } : undefined),
      };
    }, [slotHeight, slotTextStyle]);

    if (visibleValue !== lastValueRef.current || isLeadingChange) {
      hasAnimatedRef.current = true;
      lastValueRef.current = visibleValue;
    }

    const hasAnimated = hasAnimatedRef.current;
    const structureChanged =
      hasAnimated &&
      previousStructureSignatureRef.current !== structureSignature;
    previousStructureSignatureRef.current = structureSignature;

    let magnitudeDigitIndex = 0;
    const renderedUnits = units.map((unit, index) => {
      const inLead = index < leadLength;
      const magnitudeDigitOrdinal =
        isMagnitudeMode && !inLead && isAsciiDigit(unit)
          ? magnitudeDigitIndex++
          : -1;
      const laneKey = inLead
        ? `lead:${index}`
        : magnitudeDigitOrdinal >= 0
          ? `slot:magnitude:${magnitudeDigitOrdinal}`
          : `slot:${units.length - 1 - index}`;

      if (
        isMagnitudeMode &&
        !inLead &&
        (unit === "," || unit === ".")
      ) {
        const digitsToLeft = units
          .slice(0, index)
          .filter(isAsciiDigit).length;

        return (
          <SlotSymbolLane
            key={`slot:separator:${unit}:${digitsToLeft}`}
            symbol={unit}
            isLast={index === units.length - 1}
            laneSpacing={laneSpacing}
            structureChanged={structureChanged}
            animateIn={hasAnimated}
            motionRecipe={motionRecipe}
            slotHeight={slotHeight}
            textStyle={slotTextStyle}
            className={className}
          />
        );
      }

      if (inLead || !isAsciiDigit(unit)) {
        return (
          <SlotTextLane
            key={laneKey}
            unit={unit}
            isLead={inLead}
            isLast={index === units.length - 1}
            laneSpacing={laneSpacing}
            structureChanged={structureChanged}
            motionRecipe={motionRecipe}
            slotHeight={slotHeight}
            reelTextStyle={reelTextStyle}
            className={className}
          />
        );
      }

      if (isMagnitudeMode && magnitudeDigitOrdinal > 0) {
        return (
          <SlotRisingDigitLane
            key={laneKey}
            digit={Number(unit)}
            initialDigit={initialDigits?.[index]}
            animateIn={hasAnimated}
            isLast={index === units.length - 1}
            laneSpacing={laneSpacing}
            structureChanged={structureChanged}
            motionRecipe={motionRecipe}
            slotHeight={slotHeight}
            textStyle={slotTextStyle}
            reelTextStyle={reelTextStyle}
            className={className}
            shadow={shadow}
          />
        );
      }

      return (
        <SlotDigitLane
          key={laneKey}
          digit={Number(unit)}
          initialDigit={initialDigits?.[index]}
          direction={direction}
          animateIn={hasAnimated}
          isLast={index === units.length - 1}
          laneSpacing={laneSpacing}
          structureChanged={structureChanged}
          motionRecipe={motionRecipe}
          slotHeight={slotHeight}
          textStyle={slotTextStyle}
          reelTextStyle={reelTextStyle}
          className={className}
          shadow={shadow}
        />
      );
    });
    const renderLeading = (
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
    );
    const slotHeightProbe = slotHeight === undefined ? (
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        onLayout={captureSlotHeight}
        style={[
          textStyle,
          {
            position: "absolute",
            left: 0,
            top: 0,
            opacity: 0,
            includeFontPadding: false,
            letterSpacing: 0,
          },
        ]}
        className={className}
      >
        0
      </Text>
    ) : null;

    if (isMagnitudeMode) {
      return (
        <MagnitudeSlotsViewport
          align={align}
          fitContentWidth={fitContentWidth}
          motionRecipe={motionRecipe}
          layoutTransition={
            hasAnimated && (structureChanged || isLeadingChange)
              ? motionRecipe.layoutTransition
              : undefined
          }
          measurement={slotHeightProbe}
        >
          {renderLeading}
          <Animated.View
            layout={isLeadingChange ? motionRecipe.layoutTransition : undefined}
            style={rowStyle}
          >
            {renderedUnits}
          </Animated.View>
        </MagnitudeSlotsViewport>
      );
    }

    return (
      <View style={[rowStyle, rowAlignStyles[align]]}>
        {renderLeading}
        <Animated.View
          layout={isLeadingChange ? motionRecipe.layoutTransition : undefined}
          style={rowStyle}
        >
          {renderedUnits}
        </Animated.View>
        {slotHeightProbe}
      </View>
    );
  }
);

SlotsRun.displayName = "SlotsRun";
