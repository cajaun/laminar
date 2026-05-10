import {
  Easing,
  LinearTransition,
  type EntryExitAnimationFunction,
  type WithTimingConfig,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type {
  MotionRecipe,
  MorphAnimationPreset,
  MorphAnimationPresetName,
} from "../types";

const DEFAULT_CURVE = [0.19, 1, 0.22, 1] as const;

export const MOTION_PRESETS: Record<
  MorphAnimationPresetName,
  MorphAnimationPreset
> = {
  default: {
    duration: 0.38,
    ease: DEFAULT_CURVE,
  },
  smooth: {
    type: "spring",
    duration: 0.4,
    bounce: 0,
  },
  snappy: {
    type: "spring",
    duration: 0.35,
    bounce: 0.15,
  },
  bouncy: {
    type: "spring",
    duration: 0.5,
    bounce: 0.3,
  },
} as const;

const toMilliseconds = (seconds: number) => Math.round(seconds * 1000);

const toDampingRatio = (bounce: number) =>
  Math.max(0.55, Math.min(1, 1 - bounce));

const createOpacityTransition = (
  fromOpacity: number,
  toOpacity: number,
  durationMs: number,
  easing: NonNullable<WithTimingConfig["easing"]>
): EntryExitAnimationFunction => {
  return () => {
    "worklet";

    return {
      initialValues: {
        opacity: fromOpacity,
      },
      animations: {
        opacity: withTiming(toOpacity, {
          duration: durationMs,
          easing,
        }),
      },
    };
  };
};

export const resolveMotionRecipe = (
  presetName: MorphAnimationPresetName = "default",
  durationOverride?: number
): MotionRecipe => {
  const preset = MOTION_PRESETS[presetName];
  const durationMs = durationOverride ?? toMilliseconds(preset.duration);

  if ("type" in preset && preset.type === "spring") {
    const dampingRatio = toDampingRatio(preset.bounce);
    const easing = Easing.bezier(...DEFAULT_CURVE);

    return {
      durationMs,
      easing,
      // keep layout on timing so width and reflow stay predictable
      layoutTransition: LinearTransition.duration(durationMs).easing(
        easing.factory()
      ),
      enterTransition: createOpacityTransition(0, 1, durationMs, easing),
      exitTransition: createOpacityTransition(1, 0, durationMs, easing),
      driveNumber: (toValue, delayMs = 0) => {
        const animation = withSpring(toValue, {
          duration: durationMs,
          dampingRatio,
          overshootClamping: preset.bounce === 0,
        });

        return delayMs > 0 ? withDelay(delayMs, animation) : animation;
      },
    };
  }

  const timingPreset = preset as Extract<
    MorphAnimationPreset,
    { ease: readonly [number, number, number, number] }
  >;
  const [x1, y1, x2, y2] = timingPreset.ease;
  const easing = Easing.bezier(x1, y1, x2, y2);

  return {
    durationMs,
    easing,
    layoutTransition: LinearTransition.duration(durationMs).easing(
      easing.factory()
    ),
    enterTransition: createOpacityTransition(0, 1, durationMs, easing),
    exitTransition: createOpacityTransition(1, 0, durationMs, easing),
    driveNumber: (toValue, delayMs = 0) => {
      const animation = withTiming(toValue, {
        duration: durationMs,
        easing,
      });

      return delayMs > 0 ? withDelay(delayMs, animation) : animation;
    },
  };
};
