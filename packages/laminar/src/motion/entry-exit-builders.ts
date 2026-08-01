import {
  type EntryExitAnimationFunction,
  type ExitAnimationsValues,
  type WithTimingConfig,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

type TransitionParams = {
  readonly delayMs?: number;
  readonly durationMs: number;
  readonly easing: NonNullable<WithTimingConfig["easing"]>;
  readonly fromOpacity: number;
  readonly toOpacity: number;
  readonly fromTranslateY: number;
  readonly toTranslateY: number;
  readonly fromScale: number;
  readonly toScale: number;
};

type LeadingExitTransitionParams = {
  readonly durationMs: number;
  readonly easing: NonNullable<WithTimingConfig["easing"]>;
  readonly leadingGap: number;
  readonly scale?: boolean | SharedValue<number>;
};

type LeadingEnterTransitionParams = {
  readonly durationMs: number;
  readonly easing: NonNullable<WithTimingConfig["easing"]>;
};

// leading replacements use scale while first appearance uses the regular fade path
export const createLeadingEnterTransition = ({
  durationMs,
  easing,
}: LeadingEnterTransitionParams): EntryExitAnimationFunction => {
  return () => {
    "worklet";

    return {
      initialValues: {
        opacity: 0,
        transform: [{ scale: 0.5 }],
      },
      animations: {
        opacity: withTiming(1, { duration: durationMs, easing }),
        transform: [{ scale: withTiming(1, { duration: durationMs, easing }) }],
      },
    };
  };
};

// one builder covers glyph opacity, travel, scale, and optional stagger timing
export const createShiftTransition = ({
  delayMs = 0,
  durationMs,
  easing,
  fromOpacity,
  toOpacity,
  fromTranslateY,
  toTranslateY,
  fromScale,
  toScale,
}: TransitionParams): EntryExitAnimationFunction => {
  return () => {
    "worklet";

    // drive opacity and transforms from one timing path
    const animate = (toValue: number) =>
      delayMs > 0
        ? withDelay(
            delayMs,
            withTiming(toValue, {
              duration: durationMs,
              easing,
            })
          )
        : withTiming(toValue, {
            duration: durationMs,
            easing,
          });

    const initialValues: Record<string, unknown> = {
      opacity: fromOpacity,
      transform: [
        { translateY: fromTranslateY },
        { scale: fromScale },
      ],
    };

    const animations: Record<string, unknown> = {
      opacity: animate(toOpacity),
      transform: [
        { translateY: animate(toTranslateY) },
        { scale: animate(toScale) },
      ],
    };

    return {
      initialValues: {
        ...initialValues,
      },
      animations: {
        ...animations,
      },
    };
  };
};

// the shared swap flag lets an exiting worklet read the current transition type
export const createLeadingExitTransition = ({
  durationMs,
  easing,
  leadingGap,
  scale = false,
}: LeadingExitTransitionParams): EntryExitAnimationFunction => {
  return (values: ExitAnimationsValues) => {
    "worklet";

    const shouldScale =
      typeof scale === "object" ? scale.value > 0.5 : scale;

    return {
      initialValues: {
        opacity: 1,
        originX: values.currentOriginX,
        ...(shouldScale ? { transform: [{ scale: 1 }] } : {}),
      },
      animations: {
        opacity: withTiming(0, { duration: durationMs, easing }),
        originX: withTiming(
          values.currentOriginX - values.currentWidth - leadingGap,
          { duration: durationMs, easing }
        ),
        ...(shouldScale
          ? {
              transform: [
                { scale: withTiming(0.5, { duration: durationMs, easing }) },
              ],
            }
          : {}),
      },
    };
  };
};
