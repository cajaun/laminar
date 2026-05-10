import {
  type EntryExitAnimationFunction,
  type WithTimingConfig,
  withDelay,
  withTiming,
} from "react-native-reanimated";

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
