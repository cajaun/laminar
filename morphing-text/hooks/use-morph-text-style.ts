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
  readonly measurementTextStyle: StyleProp<TextStyle>;
};

const transparentTextStyle = {
  color: "transparent",
} as const;

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

  // reuse the same font stack so probes match the live text
  const measurementTextStyle = useMemo(
    () => [baseTextStyle, fontStyle, style, transparentTextStyle],
    [baseTextStyle, fontStyle, style]
  );

  return {
    textStyle,
    measurementTextStyle,
  };
};
