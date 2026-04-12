import React from "react";
import { useDisplayUnits } from "./hooks/use-display-units";
import { useInlineAutoWidth } from "./hooks/use-inline-auto-width";
import { useMorphMotion } from "./hooks/use-morph-motion";
import { useMorphTextStyle } from "./hooks/use-morph-text-style";
import type { MorphingTextProps } from "./types";
import { MorphViewport } from "./view/morph-viewport";
import { NumberRun } from "./view/number-run";
import { TextRun } from "./view/text-run";

export const MorphingText = React.memo(function MorphingText({
    text,
    variant = "text",
    fontSize,
    color,
    className,
    style,
    containerClassName,
    containerStyle,
    fontStyle,
    animationDuration,
    animationPreset,
    stagger = 0.02,
    autoSize = true,
    clipToBounds = true,
  }: Readonly<MorphingTextProps>) {
    const resolvedValue = String(text ?? "");
    // keep the entry thin, hooks decide motion and styling
    const probeUnits = useDisplayUnits(resolvedValue, autoSize);
    const { motionRecipe, staggerMs } = useMorphMotion({
      variant,
      animationPreset,
      animationDuration,
      stagger,
    });
    const { textStyle, measurementTextStyle } = useMorphTextStyle({
      fontSize,
      color,
      fontStyle,
      style,
    });

    const { captureLayout, animatedWidthStyle } = useInlineAutoWidth({
      enabled: autoSize,
      driveToWidth: motionRecipe.driveNumber,
    });

    return (
      <MorphViewport
        autoSize={autoSize}
        clipToBounds={clipToBounds}
        probeUnits={probeUnits}
        textClassName={className}
        probeTextStyle={measurementTextStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        animatedWidthStyle={animatedWidthStyle}
        onMeasure={captureLayout}
      >
        {variant === "number" ? (
          <NumberRun
            value={resolvedValue}
            motionRecipe={motionRecipe}
            fontSize={fontSize}
            className={className}
            textStyle={textStyle}
            staggerMs={staggerMs}
          />
        ) : (
          <TextRun
            value={resolvedValue}
            motionRecipe={motionRecipe}
            className={className}
            textStyle={textStyle}
          />
        )}
      </MorphViewport>
    );
  });

export default MorphingText;
export type {
  MorphAnimationPresetName,
  MorphContentVariant,
  MorphingTextProps,
} from "./types";
