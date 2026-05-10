import { useMemo } from "react";
import { resolveMotionRecipe } from "../motion/preset-map";
import type {
  MotionRecipe,
  MorphAnimationPresetName,
  MorphContentVariant,
} from "../types";

type Params = {
  readonly variant: MorphContentVariant;
  readonly animationPreset?: MorphAnimationPresetName;
  readonly animationDuration?: number;
  readonly stagger: number;
};

type MorphMotion = {
  readonly motionRecipe: MotionRecipe;
  readonly staggerMs: number;
};

export const useMorphMotion = ({
  variant,
  animationPreset,
  animationDuration,
  stagger,
}: Params): MorphMotion => {
  // numbers feel better with snappy unless you pick something else
  const resolvedPreset =
    animationPreset ?? (variant === "text" ? "default" : "snappy");

  const motionRecipe = useMemo(
    () => resolveMotionRecipe(resolvedPreset, animationDuration),
    [animationDuration, resolvedPreset]
  );

  return {
    motionRecipe,
    staggerMs: Math.round(stagger * 1000),
  };
};
