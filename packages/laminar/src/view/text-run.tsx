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
  readonly leadingKey?: string | number;
  readonly leadingGap?: number;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly className?: string;
};

export const TextRun = React.memo(
  ({
    value,
    motionRecipe,
    align,
    leading,
    leadingKey,
    leadingGap = 0,
    textStyle,
    className,
  }: TextRunProps) => {
    // namespace ids per instance so repeated strings do not collide
    const scopeId = useId();
    const lastValueRef = useRef(value);
    const lastLeadingPresenceRef = useRef(Boolean(leading));
    const lastLeadingKeyRef = useRef(leadingKey);
    const hasAnimatedRef = useRef(false);
    const isLeadingSwap =
      Boolean(leading) &&
      lastLeadingPresenceRef.current &&
      leadingKey !== lastLeadingKeyRef.current;
    const leadingSwapProgress = useSharedValue(0);
    useLayoutEffect(() => {
      leadingSwapProgress.value = isLeadingSwap ? 1 : 0;
    }, [isLeadingSwap, leadingSwapProgress]);
    const glyphs = useTextGlyphs(value, scopeId, leading, leadingKey);
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

    if (
      value !== lastValueRef.current ||
      Boolean(leading) !== lastLeadingPresenceRef.current ||
      leadingKey !== lastLeadingKeyRef.current
    ) {
      hasAnimatedRef.current = true;
      lastValueRef.current = value;
      lastLeadingPresenceRef.current = Boolean(leading);
      lastLeadingKeyRef.current = leadingKey;
    }

    const hasAnimated = hasAnimatedRef.current;

    return (
      <GlyphRun
        glyphs={glyphs}
        layoutTransition={
          hasAnimated ? motionRecipe.layoutTransition : undefined
        }
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
        leadingGap={leadingGap}
        align={align}
        textStyle={textStyle}
        className={className}
      />
    );
  }
);

TextRun.displayName = "TextRun";
