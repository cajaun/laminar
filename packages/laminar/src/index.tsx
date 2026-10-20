import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useInlineAutoWidth } from "./hooks/use-inline-auto-width";
import { useMorphMotion } from "./hooks/use-morph-motion";
import { useMorphTextStyle } from "./hooks/use-morph-text-style";
import {
  findFractionStartIndex,
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "./model/display-units";
import type { LaminarLeadingMap, MorphingTextProps } from "./types";
import { MorphViewport } from "./view/morph-viewport";
import { NumberRun } from "./view/number-run";
import { TextRun } from "./view/text-run";
import { NumericRunSwitch } from "./view/numeric-run-switch";
import { getFractionalTextStyle } from "./view/fractional-text-style";

// connect each content variant to the shared viewport and measurement flow
export const Laminar = React.memo(function Laminar({
    text,
    variant = "text",
    fontSize,
    color,
    fractionScale: fractionScaleProp = 1,
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
    // resolve keyed leading content before measuring the value
    const leadingMap = isLeadingMap(leading) ? leading : undefined;
    const resolvedLeading: React.ReactNode = leadingMap
      ? leadingMap[resolvedValue]
      : (leading as React.ReactNode);
    const resolvedLeadingKey = leadingMap ? resolvedValue : leadingKey;
    const flattenedContainerStyle = StyleSheet.flatten(containerStyle);
    const isCenteredStandaloneShell =
      flattenedContainerStyle?.alignSelf === "center";
    // render slot mode and number mode through the numeric renderer
    const isSlotsVariant =
      variant === "slots" || (variant === "number" && numberMode === "slots");
    const isTickerVariant = variant === "number" && numberMode === "ticker";
    const fractionScale = Number.isFinite(fractionScaleProp)
      ? Math.max(0.1, Math.min(1, fractionScaleProp))
      : 1;
    const tickerFractionScale = isTickerVariant ? fractionScale : 1;
    const layoutTransitionKey =
      isSlotsVariant || isTickerVariant
        ? `${variant}:${isTickerVariant ? "ticker" : "slots"}`
        : undefined;
    // animate sampled width and slot reels together so leading icons stay aligned
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

    // remeasure when text style or leading content changes
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
        tickerFractionScale,
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
      tickerFractionScale,
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
    // measure the normalized units rendered in the visible row
    const measuredValue = React.useMemo(() => {
      if (!autoSize) {
        return "";
      }

      return splitDisplayUnits(resolvedValue)
        .map(normalizeDisplayUnit)
        .join("");
    }, [autoSize, resolvedValue]);
    const measuredUnits = React.useMemo(
      () => splitDisplayUnits(measuredValue),
      [measuredValue],
    );
    const measuredFractionStartIndex = isTickerVariant
      ? findFractionStartIndex(measuredUnits)
      : measuredUnits.length;

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
              {measuredUnits.map((unit, index) => (
                <Text
                  key={`${unit}-${index}`}
                  style={
                    index >= measuredFractionStartIndex
                      ? getFractionalTextStyle(
                          textStyle,
                          fontSize,
                          tickerFractionScale,
                        )
                      : textStyle
                  }
                >
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
            fractionScale={tickerFractionScale}
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
  // exclude react elements before reading an object as a leading map
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
