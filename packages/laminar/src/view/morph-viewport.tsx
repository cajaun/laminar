import React, { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";

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

type MorphViewportProps = {
  readonly autoSize: boolean;
  readonly clipToBounds: boolean;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly animatedWidthStyle?: React.ComponentProps<typeof Animated.View>["style"];
  readonly measurement?: React.ReactNode;
  readonly children: React.ReactNode;
};

export const MorphViewport = React.memo(
  ({
    autoSize,
    clipToBounds,
    containerStyle,
    animatedWidthStyle,
    measurement,
    children,
  }: MorphViewportProps) => {
    const resolvedViewportStyle = useMemo(
      () => [
        viewportStyle,
        clipToBounds ? clippedViewportStyle : unclippedViewportStyle,
      ],
      [clipToBounds]
    );

    return (
      <View style={[shellStyle, containerStyle]}>
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
          <View style={resolvedViewportStyle}>{children}</View>
        )}
      </View>
    );
  }
);

MorphViewport.displayName = "MorphViewport";
