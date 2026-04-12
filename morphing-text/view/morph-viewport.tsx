import React, { useMemo } from "react";
import type { LayoutChangeEvent, StyleProp, TextStyle, ViewStyle } from "react-native";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

const shellStyle = {
  position: "relative",
  alignSelf: "flex-start",
} as const;

const probeStripStyle = {
  position: "absolute",
  left: 0,
  top: 0,
  opacity: 0,
  flexDirection: "row",
  alignItems: "center",
} as const;

const viewportStyle = {
  alignSelf: "flex-start",
} as const;

const clippedViewportStyle: ViewStyle = {
  overflow: "hidden",
};

const unclippedViewportStyle: ViewStyle = {
  overflow: "visible",
};

type MorphViewportProps = {
  readonly autoSize: boolean;
  readonly clipToBounds: boolean;
  readonly probeUnits: readonly string[];
  readonly textClassName?: string;
  readonly probeTextStyle?: StyleProp<TextStyle>;
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
    probeUnits,
    textClassName,
    probeTextStyle,
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
          <View
            pointerEvents="none"
            onLayout={onMeasure}
            style={probeStripStyle}
          >
            {/* this hidden row measures the next value before the width animates */}
            {probeUnits.map((unit, index) => (
              <Text
                className={textClassName}
                key={`probe:${index}:${unit}`}
                style={probeTextStyle}
              >
                {unit}
              </Text>
            ))}
          </View>
        ) : null}

        {autoSize ? (
          <Animated.View style={[resolvedViewportStyle, animatedWidthStyle]}>
            {children}
          </Animated.View>
        ) : (
          <View style={resolvedViewportStyle}>{children}</View>
        )}
      </View>
    );
  }
);

MorphViewport.displayName = "MorphViewport";
