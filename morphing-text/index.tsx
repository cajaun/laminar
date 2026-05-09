import React from "react";
import { Text } from "react-native";
import { useInlineAutoWidth } from "./hooks/use-inline-auto-width";
import { useMorphMotion } from "./hooks/use-morph-motion";
import { useMorphTextStyle } from "./hooks/use-morph-text-style";
import {
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "./model/display-units";
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
    clipToBounds = false,
  }: Readonly<MorphingTextProps>) {
    const resolvedValue = String(text ?? "");
    const { motionRecipe, staggerMs } = useMorphMotion({
      variant,
      animationPreset,
      animationDuration,
      stagger,
    });
    const { textStyle } = useMorphTextStyle({
      fontSize,
      color,
      fontStyle,
      style,
    });

    const { captureLayout, animatedWidthStyle } = useInlineAutoWidth({
      enabled: autoSize,
      driveToWidth: motionRecipe.driveNumber,
    });
    const measuredValue = splitDisplayUnits(resolvedValue)
      .map(normalizeDisplayUnit)
      .join("");

    return (
      <MorphViewport
        autoSize={autoSize}
        clipToBounds={clipToBounds}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        animatedWidthStyle={animatedWidthStyle}
        measurement={
          <Text
            numberOfLines={1}
            onLayout={captureLayout}
            className={className}
            style={textStyle}
          >
            {measuredValue}
          </Text>
        }
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