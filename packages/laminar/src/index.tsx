import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useInlineAutoWidth } from "./hooks/use-inline-auto-width";
import { useMorphMotion } from "./hooks/use-morph-motion";
import { useMorphTextStyle } from "./hooks/use-morph-text-style";
import {
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "./model/display-units";
import type { LaminarLeadingMap, MorphingTextProps } from "./types";
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
    leading,
    leadingKey,
    leadingGap = 0,
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
    const leadingMap = isLeadingMap(leading) ? leading : undefined;
    const resolvedLeading: React.ReactNode = leadingMap
      ? leadingMap[resolvedValue]
      : (leading as React.ReactNode);
    const resolvedLeadingKey = leadingMap ? resolvedValue : leadingKey;
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
        resolvedValue,
        flattenedStyle?.fontFamily,
        flattenedStyle?.fontSize,
        flattenedStyle?.fontStyle,
        flattenedStyle?.fontWeight,
        flattenedStyle?.fontVariant,
        flattenedStyle?.letterSpacing,
        flattenedStyle?.lineHeight,
        flattenedStyle?.textTransform,
        variant === "text" && Boolean(resolvedLeading),
        variant === "text" ? resolvedLeadingKey : undefined,
        variant === "text" ? leadingGap : 0,
      ]);
    }, [
      leadingGap,
      resolvedLeading,
      resolvedLeadingKey,
      resolvedValue,
      textStyle,
      variant,
    ]);
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

      return splitDisplayUnits(resolvedValue)
        .map(normalizeDisplayUnit)
        .join("");
    }, [autoSize, resolvedValue]);

    return (
      <MorphViewport
        autoSize={autoSize}
        clipToBounds={clipToBounds}
        align={align}
        containerStyle={containerStyle}
        animatedWidthStyle={animatedWidthStyle}
        measurement={
          shouldMeasure ? (
            <View
              onLayout={captureLayout}
              style={{ flexDirection: "row", alignSelf: "flex-start" }}
            >
              {variant === "text" && resolvedLeading ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: leadingGap,
                  }}
                >
                  {resolvedLeading}
                </View>
              ) : null}
              {splitDisplayUnits(measuredValue).map((unit, index) => (
                <Text key={`${unit}-${index}`} style={textStyle}>
                  {normalizeDisplayUnit(unit)}
                </Text>
              ))}
            </View>
          ) : undefined
        }
      >
        {variant === "slots" ? (
          <SlotsRun
            value={resolvedValue}
            motionRecipe={motionRecipe}
            align={align}
            fontSize={fontSize}
            textStyle={textStyle}
            staggerMs={staggerMs}
            className={className}
          />
        ) : variant === "number" ? (
          <NumberRun
            value={resolvedValue}
            motionRecipe={motionRecipe}
            align={align}
            fontSize={fontSize}
            textStyle={textStyle}
            staggerMs={staggerMs}
            className={className}
          />
        ) : (
          <TextRun
            value={resolvedValue}
            motionRecipe={motionRecipe}
            align={align}
            leading={resolvedLeading}
            leadingKey={resolvedLeadingKey}
            leadingGap={leadingGap}
            textStyle={textStyle}
            className={className}
          />
      )}
    </MorphViewport>
  );
  });

function isLeadingMap(
  value: MorphingTextProps["leading"]
): value is LaminarLeadingMap {
  return (
    typeof value === "object" &&
    value !== null &&
    !React.isValidElement(value) &&
    !Array.isArray(value)
  );
}

export type {
  LaminarAlign,
  LaminarLeadingMap,
  LaminarProps,
  MorphAnimationPresetName,
  MorphContentVariant,
  MorphingTextProps,
} from "./types";
