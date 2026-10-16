import { useMemo } from "react";
import { resolveMotionRecipe } from "../motion/preset-map";
import type {
  MotionRecipe,
  MorphAnimationPresetName,
  MorphContentVariant,
  MorphNumberMode,
} from "../types";

type Params = {
  readonly variant: MorphContentVariant;
  readonly numberMode?: MorphNumberMode;
  readonly animationPreset?: MorphAnimationPresetName;
  readonly animationDuration?: number;
};

type MorphMotion = {
  readonly motionRecipe: MotionRecipe;
};

// resolve one recipe for coordinated token timing
export const useMorphMotion = ({
  variant,
  numberMode,
  animationPreset,
  animationDuration,
}: Params): MorphMotion => {
  const isTicker = variant === "number" && numberMode === "ticker";
  // numeric variants need a quicker default because their lanes update often
  const resolvedPreset =
    animationPreset ??
    (isTicker
      ? "ticker"
      : variant === "text"
        ? "default"
        : "snappy");

  const motionRecipe = useMemo(
    () => resolveMotionRecipe(resolvedPreset, animationDuration),
    [animationDuration, resolvedPreset]
  );

  return { motionRecipe };
};
