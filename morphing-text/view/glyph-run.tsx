import React from "react";
import { type StyleProp, type TextStyle, View } from "react-native";
import Animated from "react-native-reanimated";
import type {
  ComplexAnimationBuilder,
  EntryExitAnimationFunction,
} from "react-native-reanimated";
import type { GlyphToken } from "../types";

const rowStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
} as const;

export const GlyphRun = React.memo(
  ({
    glyphs,
    layoutTransition,
    enterTransition,
    exitTransition,
    className,
    textStyle,
  }: Readonly<{
    glyphs: readonly GlyphToken[];
    layoutTransition: ComplexAnimationBuilder;
    enterTransition: EntryExitAnimationFunction;
    exitTransition: EntryExitAnimationFunction;
    className?: string;
    textStyle?: StyleProp<TextStyle>;
  }>) => (
      <View style={rowStyle}>
        {/* glyph ids decide what swaps, layout handles the row reflow */}
        {glyphs.map((glyph) => (
          <Animated.Text
            key={glyph.id}
            layout={layoutTransition}
            entering={enterTransition}
            exiting={exitTransition}
            className={className}
            style={textStyle}
          >
            {glyph.value}
          </Animated.Text>
        ))}
      </View>
    )
);

GlyphRun.displayName = "GlyphRun";
