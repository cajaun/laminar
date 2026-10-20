import { StyleSheet, type StyleProp, type TextStyle } from "react-native";

export const getFractionalTextStyle = (
  textStyle: StyleProp<TextStyle> | undefined,
  fontSize: number | undefined,
  fractionScale: number,
): StyleProp<TextStyle> => {
  if (fractionScale >= 1) return textStyle;

  const flattenedStyle = StyleSheet.flatten(textStyle);
  const baseFontSize =
    typeof flattenedStyle?.fontSize === "number"
      ? flattenedStyle.fontSize
      : fontSize;
  if (
    baseFontSize === undefined ||
    !Number.isFinite(baseFontSize) ||
    baseFontSize <= 0
  ) {
    return textStyle;
  }

  const fractionalFontSize = baseFontSize * fractionScale;

  // let ticker rows align native text baselines across fonts and platforms
  return [
    textStyle,
    {
      fontSize: fractionalFontSize,
    },
  ];
};
