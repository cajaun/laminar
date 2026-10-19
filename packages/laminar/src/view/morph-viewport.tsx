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
  // support layout driven auto size for aligned content
  readonly autoSizeLayoutTransition?: BaseAnimationBuilder;
  readonly layoutTransitionKey?: string | number;
  readonly measurement?: React.ReactNode;
  readonly children: React.ReactNode;
};

// keep hidden measurement outside visible content
export const MorphViewport = React.memo(
  ({
    autoSize,
    clipToBounds,
    align,
    containerStyle,
    animatedWidthStyle,
    autoSizeLayoutTransition,
    layoutTransitionKey,
    measurement,
    children,
  }: MorphViewportProps) => {
    const hasRenderedRef = useRef(false);
    const previousLayoutTransitionKeyRef = useRef(layoutTransitionKey);
    const rendererChanged =
      previousLayoutTransitionKeyRef.current !== layoutTransitionKey;
    previousLayoutTransitionKeyRef.current = layoutTransitionKey;
    // Renderer handoffs change glyph metrics; don't animate the shell's layout for them.
    const shouldAnimateAutoSizeLayout =
      autoSizeLayoutTransition !== undefined &&
      hasRenderedRef.current &&
      !rendererChanged;
    hasRenderedRef.current = true;
    // share alignment between the shell and viewport
    const resolvedViewportStyle = useMemo(
      () => [
        viewportStyle,
        viewportAlignStyles[align],
        clipToBounds ? clippedViewportStyle : unclippedViewportStyle,
      ],
      [align, clipToBounds]
    );

    // keep measurement outside the viewport
    if (autoSizeLayoutTransition) {
      // animate width and anchor position together
      return (
        <Animated.View
          layout={
            shouldAnimateAutoSizeLayout
              ? autoSizeLayoutTransition
              : undefined
          }
          style={[shellStyle, shellAlignStyles[align], containerStyle]}
        >
          <View
            accessibilityElementsHidden
            collapsable={false}
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            style={measuredContentStyle}
          >
            {measurement}
          </View>
          <Animated.View style={resolvedViewportStyle}>
            {children}
          </Animated.View>
        </Animated.View>
      );
    }

    return (
      <View style={[shellStyle, shellAlignStyles[align], containerStyle]}>
        {autoSize ? (
          <>
            <View
              accessibilityElementsHidden
              collapsable={false}
              importantForAccessibility="no-hide-descendants"
              pointerEvents="none"
              style={measuredContentStyle}
            >
              {measurement}
            </View>
            <Animated.View
              style={[resolvedViewportStyle, animatedWidthStyle]}
            >
              {children}
            </Animated.View>
          </>
        ) : (
          <View style={[resolvedViewportStyle, fullWidthViewportStyle]}>
            {children}
          </View>
        )}
      </View>
    );
  }
);

MorphViewport.displayName = "MorphViewport";
