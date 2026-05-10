import React, { useId, useRef } from "react";
import type { StyleProp, TextStyle } from "react-native";
import { useTextGlyphs } from "../hooks/use-text-glyphs";
import type { MotionRecipe } from "../types";
import { GlyphRun } from "./glyph-run";

type TextRunProps = {
  readonly value: string;
  readonly motionRecipe: MotionRecipe;
  readonly textStyle?: StyleProp<TextStyle>;
};

export const TextRun = React.memo(
  ({ value, motionRecipe, textStyle }: TextRunProps) => {
    // namespace ids per instance so repeated strings do not collide
    const scopeId = useId();
    const glyphs = useTextGlyphs(value, scopeId);
    const lastValueRef = useRef(value);
    const hasAnimatedRef = useRef(false);

    if (value !== lastValueRef.current) {
      hasAnimatedRef.current = true;
      lastValueRef.current = value;
    }

    return (
      <GlyphRun
        glyphs={glyphs}
        layoutTransition={motionRecipe.layoutTransition}
        enterTransition={
          hasAnimatedRef.current ? motionRecipe.enterTransition : undefined
        }
        exitTransition={motionRecipe.exitTransition}
        textStyle={textStyle}
      />
    );
  }
);

TextRun.displayName = "TextRun";
