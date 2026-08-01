import React, { useId, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import type { StyleProp, TextStyle } from "react-native";
import { useTextGlyphs } from "../hooks/use-text-glyphs";
import { createLeadingExitTransition } from "../motion/entry-exit-builders";
import type { LaminarAlign, MotionRecipe } from "../types";
import { GlyphRun } from "./glyph-run";

type TextRunProps = {
  readonly value: string;
  readonly motionRecipe: MotionRecipe;
  readonly align: LaminarAlign;
  readonly leading?: ReactNode;
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
    leadingGap = 0,
    textStyle,
    className,
  }: TextRunProps) => {
    // namespace ids per instance so repeated strings do not collide
    const scopeId = useId();
    const glyphs = useTextGlyphs(value, scopeId, leading);
    const elementExitTransition = useMemo(
      () =>
        createLeadingExitTransition({
          durationMs: motionRecipe.durationMs,
          easing: motionRecipe.easing,
          leadingGap,
        }),
      [motionRecipe.durationMs, motionRecipe.easing, leadingGap]
    );
    const lastValueRef = useRef(value);
    const lastLeadingPresenceRef = useRef(Boolean(leading));
    const hasAnimatedRef = useRef(false);

    if (
      value !== lastValueRef.current ||
      Boolean(leading) !== lastLeadingPresenceRef.current
    ) {
      hasAnimatedRef.current = true;
      lastValueRef.current = value;
      lastLeadingPresenceRef.current = Boolean(leading);
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
