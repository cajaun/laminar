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

const textRowStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
} as const;

const rowAlignStyles = {
  left: { alignSelf: "flex-start" },
  center: { alignSelf: "center" },
  right: { alignSelf: "flex-end" },
} as const;

// render text and inline elements through one animated token row
export const GlyphRun = React.memo(
  ({
    glyphs,
    layoutTransition,
    leadingLayoutTransition,
    leadingLayoutGroup = false,
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
    leadingLayoutTransition?: ComplexAnimationBuilder;
    leadingLayoutGroup?: boolean;
    enterTransition?: EntryExitAnimationFunction;
    elementEnterTransition?: EntryExitAnimationFunction;
    exitTransition?: EntryExitAnimationFunction;
    elementExitTransition?: EntryExitAnimationFunction;
    leadingGap?: number;
    align: LaminarAlign;
    textStyle?: StyleProp<TextStyle>;
    className?: string;
  }>) => {
    // The leading token is always first. Keep it outside the text row so its
    // appearance moves the text as one unit instead of reflowing every glyph.
    const leadingGlyph = glyphs[0]?.kind === "element" ? glyphs[0] : undefined;
    const textGlyphs = leadingGlyph ? glyphs.slice(1) : glyphs;
    const shouldGroupText =
      Boolean(leadingGlyph) || Boolean(leadingLayoutTransition) || leadingLayoutGroup;

    const renderTextGlyph = (glyph: GlyphToken) =>
      glyph.kind === "text" ? (
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
      ) : null;

    const textRow = (
      <Animated.View
        key="text-row"
        layout={leadingLayoutTransition}
        style={textRowStyle}
      >
        {textGlyphs.map(renderTextGlyph)}
      </Animated.View>
    );

    return (
      <View style={[rowStyle, rowAlignStyles[align]]}>
        {leadingGlyph ? (
          <Animated.View
            key={leadingGlyph.id}
            // leading elements own their enter/exit geometry; generic layout
            // motion here would compete with those transitions
            layout={undefined}
            entering={elementEnterTransition ?? enterTransition}
            exiting={elementExitTransition ?? exitTransition}
            style={[
              { alignItems: "center", justifyContent: "center" },
              (leadingGap ?? 0) > 0 ? { marginRight: leadingGap } : undefined,
            ]}
          >
            {leadingGlyph.element}
          </Animated.View>
        ) : null}
        {shouldGroupText ? textRow : textGlyphs.map(renderTextGlyph)}
      </View>
    );
  }
);

GlyphRun.displayName = "GlyphRun";
