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
  // choose separate motion recipes for slots and ticker modes
  readonly slotsMotionRecipe: MotionRecipe;
  readonly tickerMotionRecipe: MotionRecipe;
};

// resolve motion recipes so tokens share timing
export const useMorphMotion = ({
  variant,
  numberMode,
  animationPreset,
  animationDuration,
}: Params): MorphMotion => {
  const isTicker = variant === "number" && numberMode === "ticker";
  // use a shorter default duration for numeric lane updates
  const slotsPreset = animationPreset ?? (variant === "text" ? "default" : "snappy");
  const tickerPreset = animationPreset ?? "ticker";
  const slotsMotionRecipe = useMemo(
    // keep hidden slot props stable while ticker mode is active
    () => resolveMotionRecipe(slotsPreset, animationDuration, true),
    [animationDuration, slotsPreset]
  );
  const tickerMotionRecipe = useMemo(
    () => resolveMotionRecipe(tickerPreset, animationDuration),
    [animationDuration, tickerPreset]
  );

  return {
    motionRecipe: isTicker ? tickerMotionRecipe : slotsMotionRecipe,
    slotsMotionRecipe,
    tickerMotionRecipe,
  };
};
