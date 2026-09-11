import React, { useId, useRef } from "react";
import type { ReactNode } from "react";
import type { StyleProp, TextStyle } from "react-native";
import { useTextGlyphs } from "../hooks/use-text-glyphs";
import { useLeadingAnimation } from "../hooks/use-leading-animation";
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
    const hasAnimatedRef = useRef(false);
    const {
      elementEnterTransition,
      elementExitTransition,
      isLeadingChange,
      isLeadingSwap,
    } = useLeadingAnimation({
      leading: visibleLeading,
      leadingKey: visibleLeadingKey,
      leadingGap: visibleLeadingGap,
      motionRecipe,
    });
    const glyphs = useTextGlyphs(
      visibleValue,
      scopeId,
      visibleLeading,
      visibleLeadingKey
    );

    // mark the first value as settled and later changes as eligible for motion
    if (visibleValue !== lastValueRef.current || isLeadingChange) {
      hasAnimatedRef.current = true;
      lastValueRef.current = visibleValue;
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
