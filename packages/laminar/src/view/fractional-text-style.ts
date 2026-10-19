import { StyleSheet, type StyleProp, type TextStyle } from "react-native";

export const getFractionalTextStyle = (
  textStyle: StyleProp<TextStyle> | undefined,
  fontSize: number | undefined,
  fractionScale: number,
): StyleProp<TextStyle> => {
  if (fractionScale >= 1) return textStyle;

  const flattenedStyle = StyleSheet.flatten(textStyle);
  const baseFontSize = flattenedStyle?.fontSize ?? fontSize ?? 14;
  const fractionalFontSize = baseFontSize * fractionScale;
  // Flex rows center each glyph's line box; move the smaller run down to keep
  // its baseline aligned with the full-size digits.
  const baselineOffset = baseFontSize - fractionalFontSize;

  return [
    textStyle,
    {
      fontSize: fractionalFontSize,
      transform: [
        ...(flattenedStyle?.transform ?? []),
        { translateY: baselineOffset },
      ],
    },
  ];
};
