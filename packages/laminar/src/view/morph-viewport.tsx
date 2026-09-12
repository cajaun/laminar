import React, { useMemo, useRef } from "react";
import type { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import type { ComplexAnimationBuilder } from "react-native-reanimated";
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
  /** optional layout-driven auto-size path for content that needs an aligned anchor */
  readonly autoSizeLayoutTransition?: ComplexAnimationBuilder;
  readonly onVisibleLayout?: (event: LayoutChangeEvent) => void;
  readonly measurement?: React.ReactNode;
  readonly children: React.ReactNode;
};

// separate hidden measurement from visible content while sharing the shell alignment
export const MorphViewport = React.memo(
  ({
    autoSize,
    clipToBounds,
    align,
    containerStyle,
    animatedWidthStyle,
    autoSizeLayoutTransition,
    onVisibleLayout,
    measurement,
    children,
  }: MorphViewportProps) => {
    const hasRenderedRef = useRef(false);
    const shouldAnimateAutoSizeLayout =
      autoSizeLayoutTransition !== undefined && hasRenderedRef.current;
    hasRenderedRef.current = true;

    // compute alignment once so the animated shell and its child share one layout contract
    const resolvedViewportStyle = useMemo(
      () => [
        viewportStyle,
        viewportAlignStyles[align],
        clipToBounds ? clippedViewportStyle : unclippedViewportStyle,
      ],
      [align, clipToBounds]
    );

    // keep measurement outside the visible viewport so it cannot affect accessibility or layout
    if (autoSizeLayoutTransition) {
      // Layout animation owns both width and the shell's aligned x-position.
      // This is important for center/right auto-size: animating only a child
      // width leaves the parent anchor at its old position.
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
          <Animated.View onLayout={onVisibleLayout} style={resolvedViewportStyle}>
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
              onLayout={onVisibleLayout}
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
