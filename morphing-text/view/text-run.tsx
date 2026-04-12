import React, { useId } from "react";
import type { StyleProp, TextStyle } from "react-native";
import { useTextGlyphs } from "../hooks/use-text-glyphs";
import type { MotionRecipe } from "../types";
import { GlyphRun } from "./glyph-run";

type TextRunProps = {
  readonly value: string;
  readonly motionRecipe: MotionRecipe;
  readonly className?: string;
  readonly textStyle?: StyleProp<TextStyle>;
};

export const TextRun = React.memo(
  ({ value, motionRecipe, className, textStyle }: TextRunProps) => {
    // namespace ids per instance so repeated strings do not collide
    const scopeId = useId();
    const glyphs = useTextGlyphs(value, scopeId);

    return (
      <GlyphRun
        glyphs={glyphs}
        layoutTransition={motionRecipe.layoutTransition}
        enterTransition={motionRecipe.enterTransition}
        exitTransition={motionRecipe.exitTransition}
        className={className}
        textStyle={textStyle}
      />
    );
  }
);

TextRun.displayName = "TextRun";
