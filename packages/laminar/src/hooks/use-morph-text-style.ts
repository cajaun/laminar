import { useMemo } from "react";
import type { StyleProp, TextStyle } from "react-native";

type Params = {
  readonly fontSize?: number;
  readonly color?: string;
  readonly fontStyle?: StyleProp<TextStyle>;
  readonly style?: StyleProp<TextStyle>;
};

type MorphTextStyle = {
  readonly textStyle: StyleProp<TextStyle>;
};

// combine public style layers for each glyph
export const useMorphTextStyle = ({
  fontSize,
  color,
  fontStyle,
  style,
}: Params): MorphTextStyle => {
  // keep the base layer minimal so overrides stay predictable
  const baseTextStyle = useMemo(() => {
    const nextStyle: TextStyle = {
      includeFontPadding: false,
    };

    if (fontSize !== undefined) {
      nextStyle.fontSize = fontSize;
    }

    if (color !== undefined) {
      nextStyle.color = color;
    }

    return nextStyle;
  }, [color, fontSize]);

  // apply public styles in their documented order
  const textStyle = useMemo(
    () => [baseTextStyle, fontStyle, style],
    [baseTextStyle, fontStyle, style]
  );

  return {
    textStyle,
  };
};
