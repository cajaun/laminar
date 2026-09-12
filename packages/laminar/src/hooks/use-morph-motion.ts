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
  readonly stagger: number;
};

type MorphMotion = {
  readonly motionRecipe: MotionRecipe;
  readonly staggerMs: number;
};

// resolve one motion recipe and one shared stagger unit for a render tree
export const useMorphMotion = ({
  variant,
  numberMode,
  animationPreset,
  animationDuration,
  stagger,
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

  return {
    motionRecipe,
    staggerMs: Math.round(stagger * 1000),
  };
};
