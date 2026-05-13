import React, { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";
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
  readonly measurement?: React.ReactNode;
  readonly children: React.ReactNode;
};

export const MorphViewport = React.memo(
  ({
    autoSize,
    clipToBounds,
    align,
    containerStyle,
    animatedWidthStyle,
    measurement,
    children,
  }: MorphViewportProps) => {
    const resolvedViewportStyle = useMemo(
      () => [
        viewportStyle,
        viewportAlignStyles[align],
        clipToBounds ? clippedViewportStyle : unclippedViewportStyle,
      ],
      [align, clipToBounds]
    );

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
            <Animated.View style={[resolvedViewportStyle, animatedWidthStyle]}>
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
