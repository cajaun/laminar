import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useSharedValue } from "react-native-reanimated";
import {
  createLeadingEnterTransition,
  createLeadingExitTransition,
} from "../motion/entry-exit-builders";
import type { MotionRecipe } from "../types";

type UseLeadingAnimationParams = {
  readonly leading?: ReactNode;
  readonly leadingKey?: string | number;
  readonly leadingGap: number;
  readonly motionRecipe: MotionRecipe;
};

// keep leading presence and replacement motion consistent across every content variant
export const useLeadingAnimation = ({
  leading,
  leadingKey,
  leadingGap,
  motionRecipe,
}: UseLeadingAnimationParams) => {
  const lastLeadingPresenceRef = useRef(Boolean(leading));
  const lastLeadingKeyRef = useRef(leadingKey);
  const isLeadingSwap =
    Boolean(leading) &&
    lastLeadingPresenceRef.current &&
    leadingKey !== lastLeadingKeyRef.current;
  const isLeadingChange =
    Boolean(leading) !== lastLeadingPresenceRef.current ||
    (Boolean(leading) && leadingKey !== lastLeadingKeyRef.current);
  const leadingSwapProgress = useSharedValue(0);

  // update the worklet flag after commit so render never writes a shared value
  useLayoutEffect(() => {
    leadingSwapProgress.value = isLeadingSwap ? 1 : 0;
  }, [isLeadingSwap, leadingSwapProgress]);

  const elementEnterTransition = useMemo(
    () =>
      createLeadingEnterTransition({
        durationMs: motionRecipe.durationMs,
        easing: motionRecipe.easing,
      }),
    [motionRecipe.durationMs, motionRecipe.easing]
  );
  const elementExitTransition = useMemo(
    () =>
      createLeadingExitTransition({
        durationMs: motionRecipe.durationMs,
        easing: motionRecipe.easing,
        leadingGap,
        scale: leadingSwapProgress,
      }),
    [
      leadingGap,
      leadingSwapProgress,
      motionRecipe.durationMs,
      motionRecipe.easing,
    ]
  );

  if (isLeadingChange) {
    lastLeadingPresenceRef.current = Boolean(leading);
    lastLeadingKeyRef.current = leadingKey;
  }

  return {
    elementEnterTransition,
    elementExitTransition,
    isLeadingChange,
    isLeadingSwap,
  };
};
