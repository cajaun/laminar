import React, { useMemo } from "react";
import type { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
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
  readonly containerClassName?: string;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly animatedWidthStyle?: React.ComponentProps<typeof Animated.View>["style"];
  readonly onMeasure?: (event: LayoutChangeEvent) => void;
  readonly children: React.ReactNode;
};

export const MorphViewport = React.memo(
  ({
    autoSize,
    clipToBounds,
    containerClassName,
    containerStyle,
    animatedWidthStyle,
    onMeasure,
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
      <View className={containerClassName} style={[shellStyle, containerStyle]}>
        {autoSize ? (
          <Animated.View style={[resolvedViewportStyle, animatedWidthStyle]}>
            {/* the live content measures itself; the outer view only reserves width */}
            <View onLayout={onMeasure} style={measuredContentStyle}>
              {children}
            </View>
          </Animated.View>
        ) : (
          <View style={resolvedViewportStyle}>{children}</View>
        )}
      </View>
    );
  }
);

MorphViewport.displayName = "MorphViewport";
