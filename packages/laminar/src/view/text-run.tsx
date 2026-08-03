import React, { useId, useLayoutEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import type { StyleProp, TextStyle } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useTextGlyphs } from "../hooks/use-text-glyphs";
import {
  createLeadingEnterTransition,
  createLeadingExitTransition,
} from "../motion/entry-exit-builders";
import type { LaminarAlign, MotionRecipe } from "../types";
import { GlyphRun } from "./glyph-run";

type TextRunProps = {
  readonly value: string;
  readonly motionRecipe: MotionRecipe;
  readonly align: LaminarAlign;
  readonly leading?: ReactNode;
  readonly leadingLayoutGroup?: boolean;
  readonly leadingKey?: string | number;
  readonly leadingGap?: number;
  readonly ready?: boolean;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

// connect text identity, leading transitions, and glyph layout into one run
export const TextRun = React.memo(
  ({
    value,
    motionRecipe,
    align,
    leading,
    leadingLayoutGroup = false,
    leadingKey,
    leadingGap = 0,
    ready = true,
    textStyle,
    className,
  }: TextRunProps) => {
    // namespace ids per instance so repeated strings do not collide
    const scopeId = useId();
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

    const lastValueRef = useRef(visibleValue);
    const lastLeadingPresenceRef = useRef(Boolean(visibleLeading));
    const lastLeadingKeyRef = useRef(visibleLeadingKey);
    const hasAnimatedRef = useRef(false);
    const isLeadingSwap =
      Boolean(visibleLeading) &&
      lastLeadingPresenceRef.current &&
      visibleLeadingKey !== lastLeadingKeyRef.current;
    const isLeadingChange =
      Boolean(visibleLeading) !== lastLeadingPresenceRef.current ||
      (Boolean(visibleLeading) &&
        visibleLeadingKey !== lastLeadingKeyRef.current);
    // update the worklet flag after commit so render never writes a shared value
    const leadingSwapProgress = useSharedValue(0);
    useLayoutEffect(() => {
      leadingSwapProgress.value = isLeadingSwap ? 1 : 0;
    }, [isLeadingSwap, leadingSwapProgress]);
    const glyphs = useTextGlyphs(
      visibleValue,
      scopeId,
      visibleLeading,
      visibleLeadingKey
    );
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
          leadingGap: visibleLeadingGap,
          scale: leadingSwapProgress,
        }),
      [
        visibleLeadingGap,
        leadingSwapProgress,
        motionRecipe.durationMs,
        motionRecipe.easing,
      ]
    );

    // mark the first value as settled and later changes as eligible for motion
    if (
      visibleValue !== lastValueRef.current ||
      Boolean(visibleLeading) !== lastLeadingPresenceRef.current ||
      visibleLeadingKey !== lastLeadingKeyRef.current
    ) {
      hasAnimatedRef.current = true;
      lastValueRef.current = visibleValue;
      lastLeadingPresenceRef.current = Boolean(visibleLeading);
      lastLeadingKeyRef.current = visibleLeadingKey;
    }

    const hasAnimated = hasAnimatedRef.current;

    return (
      <GlyphRun
        glyphs={glyphs}
        layoutTransition={
          hasAnimated ? motionRecipe.layoutTransition : undefined
        }
        leadingLayoutTransition={
          isLeadingChange ? motionRecipe.layoutTransition : undefined
        }
        leadingLayoutGroup={leadingLayoutGroup}
        enterTransition={
          hasAnimatedRef.current
            ? motionRecipe.enterTransition
            : undefined
        }
        elementEnterTransition={
          isLeadingSwap ? elementEnterTransition : undefined
        }
        exitTransition={motionRecipe.exitTransition}
        elementExitTransition={elementExitTransition}
        leadingGap={visibleLeadingGap}
        align={align}
        textStyle={textStyle}
        className={className}
      />
    );
  }
);

TextRun.displayName = "TextRun";
