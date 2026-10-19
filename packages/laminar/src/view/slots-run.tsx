import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
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
import { isAsciiDigit, splitDisplayUnits } from "../model/display-units";
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

// wrap reel positions inside the bounded digit wheel
const mod = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

type SlotReelProps = {
  readonly current: SharedValue<number>;
  readonly slotHeight: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

// compare flattened styles without treating new arrays as changes
const equalStyleValue = (left: unknown, right: unknown) =>
  left === right ||
  (Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((value, index) => value === right[index]));

// prevent parent updates from rebuilding the bounded reel
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
  // translate one bounded reel for each digit update
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
  // keep the reel child stable while the target changes
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
  readonly slotHeight: number;
  readonly reelTextStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

// keep punctuation and leading symbols outside digit reconciliation
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
        height: slotHeight,
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

type SlotDigitLaneProps = {
  readonly digit: number;
  readonly initialDigit?: number;
  readonly direction: NumericFlowDirection;
  readonly animateIn: boolean;
  readonly isLast: boolean;
  readonly laneSpacing: number;
  readonly structureChanged: boolean;
  readonly motionRecipe: MotionRecipe;
  readonly slotHeight: number;
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
  // use cumulative positions across digit wraparound
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
  // keep the reel target separate from its visual spin-in position
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
    // recenter the reel after enough cumulative turns
    if (initialRef.current) {
      initialRef.current = false;

      if (!animateIn && initialDigit === undefined) {
        drivenTargetRef.current = cumulativeRef.current;
        return;
      }
    }

    let target = cumulativeRef.current;

    if (target < REEL_MIN + 4 || target > REEL_MAX - 4) {
      // floor negative targets into the first cycle
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

    // keep unchanged reels still during direction changes
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
      <SlotColumn
        current={current}
        slotHeight={slotHeight}
        textStyle={textStyle}
        reelTextStyle={reelTextStyle}
        className={className}
        shadow={shadow}
      />
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
};

// render prefixes beside reusable digit reels
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
    // use numeric lane identity to preserve columns across value changes
    const { units, direction, leadLength } = useNumericLanes(visibleValue);
    const initialDigits = useMemo(() => {
      if (!fromValue || fromValue === visibleValue) return undefined;

      const fromUnits = splitDisplayUnits(fromValue);
      const fromLeadLength = fromUnits.findIndex(isAsciiDigit);
      const resolvedFromLeadLength =
        fromLeadLength === -1 ? fromUnits.length : fromLeadLength;
      const targetTailLength = units.length - leadLength;
      const fromTail = fromUnits.slice(resolvedFromLeadLength);
      const initialValues: Array<number | undefined> = [];

      for (let index = 0; index < units.length; index += 1) {
        if (!isAsciiDigit(units[index])) {
          initialValues.push(undefined);
          continue;
        }

        const targetTailIndex = index - leadLength;
        const fromIndex = fromTail.length - targetTailLength + targetTailIndex;
        const fromUnit = fromTail[fromIndex];
        initialValues.push(isAsciiDigit(fromUnit) ? Number(fromUnit) : undefined);
      }

      return initialValues;
    }, [fromValue, leadLength, units, visibleValue]);
    const lastValueRef = useRef(visibleValue);
    const hasAnimatedRef = useRef(false);
    // animate reels for value changes and layout for topology changes
    const structureSignature = useMemo(
      () =>
        units
          .map((unit) => (isAsciiDigit(unit) ? "digit" : unit))
          .join("\u0000"),
      [units],
    );
    const previousStructureSignatureRef = useRef(structureSignature);
    // derive one row height for every reel position
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
    // share the reel line box with prefix glyphs
    const slotTextStyle: StyleProp<TextStyle> = useMemo(
      () => [
        textStyle,
        {
          height: slotHeight,
          lineHeight: slotHeight,
          // apply text spacing between separate slot lanes
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
        lineHeight: slotHeight,
      };
    }, [slotTextStyle]);

    if (visibleValue !== lastValueRef.current || isLeadingChange) {
      hasAnimatedRef.current = true;
      lastValueRef.current = visibleValue;
    }

    const hasAnimated = hasAnimatedRef.current;
    const structureChanged =
      hasAnimated &&
      previousStructureSignatureRef.current !== structureSignature;
    previousStructureSignatureRef.current = structureSignature;

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
          })}
        </Animated.View>
      </View>
    );
  }
);

SlotsRun.displayName = "SlotsRun";
