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
import { TextRun } from "./view/text-run";
import { NumericRunSwitch } from "./view/numeric-run-switch";

// connect the content variant to the shared viewport and measurement flow
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
    numberMode = "morph",
    animatedText,
    fromValue,
    preloadValue,
    shadow = false,
    style,
    containerStyle,
    fontStyle,
    animationDuration,
    animationPreset,
    autoSize = true,
    clipToBounds = false,
  }: Readonly<MorphingTextProps>) {
    const resolvedValue = String(text ?? "");
    // resolve keyed leading content before measurement
    const leadingMap = isLeadingMap(leading) ? leading : undefined;
    const resolvedLeading: React.ReactNode = leadingMap
      ? leadingMap[resolvedValue]
      : (leading as React.ReactNode);
    const resolvedLeadingKey = leadingMap ? resolvedValue : leadingKey;
    const flattenedContainerStyle = StyleSheet.flatten(containerStyle);
    const isCenteredStandaloneShell =
      flattenedContainerStyle?.alignSelf === "center";
    // route slots and number slots through the same numeric renderer
    const isSlotsVariant =
      variant === "slots" || (variant === "number" && numberMode === "slots");
    const isTickerVariant = variant === "number" && numberMode === "ticker";
    const layoutTransitionKey =
      isSlotsVariant || isTickerVariant
        ? `${variant}:${isTickerVariant ? "ticker" : "slots"}`
        : undefined;
    // On scrub release, animate a width change from the sampled value together
    // with its slot reels so right-aligned readouts with a leading icon don't
    // jump ahead of digits.
    const animateLayoutOnRendererChange =
      isSlotsVariant &&
      Boolean(resolvedLeading) &&
      fromValue !== undefined &&
      fromValue !== resolvedValue;
    const useLayoutAutoSize =
      autoSize &&
      ((variant === "text" && !leading && isCenteredStandaloneShell) ||
        isSlotsVariant ||
        isTickerVariant);
    const {
      motionRecipe,
      slotsMotionRecipe,
      tickerMotionRecipe,
    } = useMorphMotion({
      variant,
      numberMode,
      animationPreset,
      animationDuration,
    });
    const { textStyle } = useMorphTextStyle({
      fontSize,
      color,
      fontStyle,
      style,
    });

    // invalidate measurement when text style or leading content changes
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
        Boolean(resolvedLeading),
        resolvedLeadingKey,
        leadingGap,
      ]);
    }, [
      leadingGap,
      resolvedLeading,
      resolvedLeadingKey,
      resolvedValue,
      textStyle,
      variant,
    ]);
    const {
      captureLayout,
      animatedWidthStyle,
      isReady: isAutoSizeReady,
      shouldMeasure,
    } =
      useInlineAutoWidth({
        enabled: autoSize && !useLayoutAutoSize,
        driveToWidth: motionRecipe.driveNumber,
        measurementKey,
      });
    // measure the same normalized units used by the visible row
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
        autoSizeLayoutTransition={
          useLayoutAutoSize ? motionRecipe.layoutTransition : undefined
        }
        layoutTransitionKey={layoutTransitionKey}
        animateLayoutOnRendererChange={animateLayoutOnRendererChange}
        measurement={
          shouldMeasure ? (
            <View
              key={measurementKey}
              onLayout={captureLayout}
              style={{ flexDirection: "row", alignSelf: "flex-start" }}
            >
              {resolvedLeading ? (
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
        {isSlotsVariant ? (
          <NumericRunSwitch
            mode="slots"
            value={resolvedValue}
            fromValue={fromValue}
            preloadValue={preloadValue}
            animatedText={animatedText}
            slotsMotionRecipe={slotsMotionRecipe}
            tickerMotionRecipe={tickerMotionRecipe}
            align={align}
            fontSize={fontSize}
            textStyle={textStyle}
            className={className}
            leading={resolvedLeading}
            leadingKey={resolvedLeadingKey}
            leadingGap={leadingGap}
            ready={!autoSize || isAutoSizeReady}
            shadow={shadow}
          />
        ) : isTickerVariant ? (
          <NumericRunSwitch
            mode="ticker"
            value={resolvedValue}
            fromValue={fromValue}
            animatedText={animatedText}
            preloadValue={preloadValue}
            slotsMotionRecipe={slotsMotionRecipe}
            tickerMotionRecipe={tickerMotionRecipe}
            align={align}
            fontSize={fontSize}
            textStyle={textStyle}
            className={className}
            leading={resolvedLeading}
            leadingKey={resolvedLeadingKey}
            leadingGap={leadingGap}
            ready={!autoSize || isAutoSizeReady}
            shadow={shadow}
          />
        ) : variant === "number" ? (
          <NumberRun
            value={resolvedValue}
            motionRecipe={motionRecipe}
            align={align}
            fontSize={fontSize}
            textStyle={textStyle}
            className={className}
            leading={resolvedLeading}
            leadingKey={resolvedLeadingKey}
            leadingGap={leadingGap}
            ready={!autoSize || isAutoSizeReady}
          />
        ) : (
          <TextRun
            value={resolvedValue}
            motionRecipe={motionRecipe}
            align={align}
            leading={resolvedLeading}
            leadingLayoutGroup={Boolean(leading)}
            leadingKey={resolvedLeadingKey}
            leadingGap={leadingGap}
            ready={!autoSize || isAutoSizeReady}
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
  // exclude react elements before treating objects as leading maps
  return (
    typeof value === "object" &&
    value !== null &&
    !React.isValidElement(value) &&
    !Array.isArray(value)
  );
}

export type {
  LaminarAlign,
  LaminarAnimatedText,
  LaminarLeadingMap,
  LaminarShadow,
  LaminarShadowOptions,
  LaminarProps,
  MorphAnimationPresetName,
  MorphContentVariant,
  MorphNumberMode,
  MorphingTextProps,
} from "./types";
