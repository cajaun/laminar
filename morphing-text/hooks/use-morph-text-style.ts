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

export const useMorphTextStyle = ({
  fontSize,
  color,
  fontStyle,
  style,
}: Params): MorphTextStyle => {
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

  const textStyle = useMemo(
    () => [baseTextStyle, fontStyle, style],
    [baseTextStyle, fontStyle, style]
  );

  return {
    textStyle,
  };
};
