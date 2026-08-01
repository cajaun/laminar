import React from "react";
import { type StyleProp, type TextStyle, View } from "react-native";
import Animated from "react-native-reanimated";
import type {
  ComplexAnimationBuilder,
  EntryExitAnimationFunction,
} from "react-native-reanimated";
import type { GlyphToken, LaminarAlign } from "../types";

const rowStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
} as const;

const rowAlignStyles = {
  left: { alignSelf: "flex-start" },
  center: { alignSelf: "center" },
  right: { alignSelf: "flex-end" },
} as const;

export const GlyphRun = React.memo(
  ({
    glyphs,
    layoutTransition,
    enterTransition,
    elementEnterTransition,
    exitTransition,
    elementExitTransition,
    leadingGap,
    align,
    textStyle,
    className,
  }: Readonly<{
    glyphs: readonly GlyphToken[];
    layoutTransition?: ComplexAnimationBuilder;
    enterTransition?: EntryExitAnimationFunction;
    elementEnterTransition?: EntryExitAnimationFunction;
    exitTransition?: EntryExitAnimationFunction;
    elementExitTransition?: EntryExitAnimationFunction;
    leadingGap?: number;
    align: LaminarAlign;
    textStyle?: StyleProp<TextStyle>;
    className?: string;
  }>) => (
      <View style={[rowStyle, rowAlignStyles[align]]}>
        {/* glyph ids decide what swaps, layout handles the row reflow */}
        {glyphs.map((glyph, glyphIndex) =>
          glyph.kind === "element" ? (
            <Animated.View
              key={glyph.id}
              layout={layoutTransition}
              entering={elementEnterTransition ?? enterTransition}
              exiting={elementExitTransition ?? exitTransition}
              style={[
                { alignItems: "center", justifyContent: "center" },
                glyphIndex === 0 && (leadingGap ?? 0) > 0
                  ? { marginRight: leadingGap }
                  : undefined,
              ]}
            >
              {glyph.element}
            </Animated.View>
          ) : (
            <Animated.Text
              key={glyph.id}
              layout={layoutTransition}
              entering={enterTransition}
              exiting={exitTransition}
              style={textStyle}
              className={className}
            >
              {glyph.value}
            </Animated.Text>
          )
        )}
      </View>
    )
);

GlyphRun.displayName = "GlyphRun";
