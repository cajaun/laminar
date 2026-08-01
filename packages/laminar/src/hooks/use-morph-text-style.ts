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

// compose the public style layers into the style passed to every glyph
export const useMorphTextStyle = ({
  fontSize,
  color,
  fontStyle,
  style,
}: Params): MorphTextStyle => {
  // keep the base layer small so caller styles can override it predictably
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

  // preserve the merge order used by the public style contract
  const textStyle = useMemo(
    () => [baseTextStyle, fontStyle, style],
    [baseTextStyle, fontStyle, style]
  );

  return {
    textStyle,
  };
};
