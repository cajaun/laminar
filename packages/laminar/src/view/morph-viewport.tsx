import React, { useMemo, useRef } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import type { BaseAnimationBuilder } from "react-native-reanimated";
import type { LaminarAlign } from "../types";

const shellStyle = {
  position: "relative",
  alignSelf: "flex-start",
} as const;

const viewportStyle = {
  alignSelf: "flex-start",
} as const;

const measuredContentStyle: ViewStyle = {
  position: "absolute",
  left: 0,
  top: 0,
  opacity: 0,
  alignSelf: "flex-start",
  flexShrink: 0,
};

const clippedViewportStyle: ViewStyle = {
  overflow: "hidden",
};

const unclippedViewportStyle: ViewStyle = {
  overflow: "visible",
};

const fullWidthViewportStyle: ViewStyle = {
  width: "100%",
};

const shellAlignStyles: Record<LaminarAlign, ViewStyle> = {
  left: { alignSelf: "flex-start" },
  center: { alignSelf: "center" },
  right: { alignSelf: "flex-end" },
};

const viewportAlignStyles: Record<LaminarAlign, ViewStyle> = {
  left: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  right: { alignItems: "flex-end" },
};

type MorphViewportProps = {
  readonly autoSize: boolean;
  readonly clipToBounds: boolean;
  readonly align: LaminarAlign;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly animatedWidthStyle?: React.ComponentProps<typeof Animated.View>["style"];
  // use content layout to size aligned values
  readonly autoSizeLayoutTransition?: BaseAnimationBuilder;
  readonly layoutTransitionKey?: string | number;
  readonly animateLayoutOnRendererChange?: boolean;
  readonly fillWidth?: boolean;
  readonly measurement?: React.ReactNode;
  readonly children: React.ReactNode;
};

// measure hidden content outside the visible viewport
export const MorphViewport = React.memo(
  ({
    autoSize,
    clipToBounds,
    align,
    containerStyle,
    animatedWidthStyle,
    autoSizeLayoutTransition,
    layoutTransitionKey,
    animateLayoutOnRendererChange = false,
    fillWidth = false,
    measurement,
    children,
  }: MorphViewportProps) => {
    const hasRenderedRef = useRef(false);
    const previousLayoutTransitionKeyRef = useRef(layoutTransitionKey);
    const rendererChanged =
      previousLayoutTransitionKeyRef.current !== layoutTransitionKey;
    previousLayoutTransitionKeyRef.current = layoutTransitionKey;
    // keep renderer handoffs from animating the shell when glyph metrics change
    const shouldAnimateAutoSizeLayout =
      autoSizeLayoutTransition !== undefined &&
      hasRenderedRef.current &&
      (!rendererChanged || animateLayoutOnRendererChange);
    hasRenderedRef.current = true;
    // align the shell and viewport with the same setting
    const resolvedViewportStyle = useMemo(
      () => [
        viewportStyle,
        viewportAlignStyles[align],
        clipToBounds ? clippedViewportStyle : unclippedViewportStyle,
      ],
      [align, clipToBounds]
    );
    const measurementView = (autoSize || fillWidth) && measurement ? (
      <View
        accessibilityElementsHidden
        collapsable={false}
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={measuredContentStyle}
      >
        {measurement}
      </View>
    ) : null;

    // measure content outside the visible viewport
    if (autoSizeLayoutTransition) {
      // animate width and anchor position on the same transition
      return (
        <Animated.View
          layout={
            shouldAnimateAutoSizeLayout
              ? autoSizeLayoutTransition
              : undefined
          }
          style={[
            shellStyle,
            fillWidth ? fullWidthViewportStyle : undefined,
            shellAlignStyles[align],
            containerStyle,
          ]}
        >
          {measurementView}
          <Animated.View style={resolvedViewportStyle}>
            {children}
          </Animated.View>
        </Animated.View>
      );
    }

    return (
      <View
        style={[
          shellStyle,
          fillWidth ? fullWidthViewportStyle : undefined,
          shellAlignStyles[align],
          containerStyle,
        ]}
      >
        {autoSize ? (
          <>
            {measurementView}
            <Animated.View
              style={[resolvedViewportStyle, animatedWidthStyle]}
            >
              {children}
            </Animated.View>
          </>
        ) : (
          <>
            {measurementView}
            <View style={[resolvedViewportStyle, fullWidthViewportStyle]}>
              {children}
            </View>
          </>
        )}
      </View>
    );
  }
);

MorphViewport.displayName = "MorphViewport";
