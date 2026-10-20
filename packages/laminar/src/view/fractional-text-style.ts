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

  // Ticker rows baseline-align their native text children; avoid a synthetic
  // translateY here because font metrics differ across fonts and platforms.
  return [
    textStyle,
    {
      fontSize: fractionalFontSize,
    },
  ];
};
