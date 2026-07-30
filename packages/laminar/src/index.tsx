import React from "react";
import { StyleSheet, Text } from "react-native";
import { useInlineAutoWidth } from "./hooks/use-inline-auto-width";
import { useFrameValue } from "./hooks/use-frame-value";
import { useMorphMotion } from "./hooks/use-morph-motion";
import { useMorphTextStyle } from "./hooks/use-morph-text-style";
import {
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "./model/display-units";
import type { MorphingTextProps } from "./types";
import { MorphViewport } from "./view/morph-viewport";
import { NumberRun } from "./view/number-run";
import { SlotsRun } from "./view/slots-run";
import { TextRun } from "./view/text-run";

export const Laminar = React.memo(function Laminar({
    text,
    variant = "text",
    fontSize,
    color,
    align = "left",
    className,
    style,
    containerStyle,
    fontStyle,
    animationDuration,
    animationPreset,
    stagger = 0.02,
    autoSize = true,
    clipToBounds = false,
  }: Readonly<MorphingTextProps>) {
    const resolvedValue = String(text ?? "");
    const { value: presentedValue, isBursting } =
      useFrameValue(resolvedValue);
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

    const measurementKey = React.useMemo(() => {
      const flattenedStyle = StyleSheet.flatten(textStyle);

      return JSON.stringify([
        presentedValue,
        flattenedStyle?.fontFamily,
        flattenedStyle?.fontSize,
        flattenedStyle?.fontStyle,
        flattenedStyle?.fontWeight,
        flattenedStyle?.fontVariant,
        flattenedStyle?.letterSpacing,
        flattenedStyle?.lineHeight,
        flattenedStyle?.textTransform,
      ]);
    }, [presentedValue, textStyle]);
    const { captureLayout, animatedWidthStyle, shouldMeasure } =
      useInlineAutoWidth({
        enabled: autoSize,
        driveToWidth: motionRecipe.driveNumber,
        measurementKey,
      });
    const measuredValue = React.useMemo(() => {
      if (!autoSize) {
        return "";
      }

      return splitDisplayUnits(presentedValue)
        .map(normalizeDisplayUnit)
        .join("");
    }, [autoSize, presentedValue]);

    return (
      <MorphViewport
        autoSize={autoSize}
        clipToBounds={clipToBounds}
        align={align}
        containerStyle={containerStyle}
        animatedWidthStyle={animatedWidthStyle}
        measurement={
          shouldMeasure ? (
            <Text
              numberOfLines={1}
              onLayout={captureLayout}
              style={textStyle}
            >
              {measuredValue}
            </Text>
          ) : undefined
        }
      >
        {variant === "slots" ? (
          <SlotsRun
            value={presentedValue}
            animateTransitions={!isBursting}
            motionRecipe={motionRecipe}
            align={align}
            fontSize={fontSize}
            textStyle={textStyle}
            staggerMs={staggerMs}
            className={className}
          />
        ) : variant === "number" ? (
          <NumberRun
            value={presentedValue}
            animateTransitions={!isBursting}
            motionRecipe={motionRecipe}
            align={align}
            fontSize={fontSize}
            textStyle={textStyle}
            staggerMs={staggerMs}
            className={className}
          />
        ) : (
          <TextRun
            value={presentedValue}
            animateTransitions={!isBursting}
            motionRecipe={motionRecipe}
            align={align}
            textStyle={textStyle}
            className={className}
          />
      )}
    </MorphViewport>
  );
  });

export const MorphingText = Laminar;

export default Laminar;
export type {
  LaminarAlign,
  LaminarProps,
  MorphAnimationPresetName,
  MorphContentVariant,
  MorphingTextProps,
} from "./types";
