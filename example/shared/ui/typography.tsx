import { Text as RNText } from "react-native";
import type { TextProps } from "react-native";

interface FontProps extends TextProps {
  weight?: keyof typeof sfFontFamilies;
  color?: string;
  className?: string;
}

export const sfFontFamilies = {
  black: "Sf-black",
  bold: "Sf-bold",
  semibold: "Sf-semibold",
  medium: "Sf-medium",
  regular: "Sf-regular",
  light: "Sf-light",
  thin: "Sf-thin",
} as const;

const typographyStyles = {
  LargeTitle: { fontSize: 34, lineHeight: 41, letterSpacing: 0.4 },
  Title1: { fontSize: 28, lineHeight: 34, letterSpacing: 0.3 },
  Title2: { fontSize: 22, lineHeight: 28, letterSpacing: 0.2 },
  Title3: { fontSize: 20, lineHeight: 26, letterSpacing: 0.2 },
  Headline: { fontSize: 17, lineHeight: 22, letterSpacing: 0.1 },
  Subheadline: { fontSize: 15, lineHeight: 20, letterSpacing: 0.1 },
  Body: { fontSize: 17, lineHeight: 22, letterSpacing: 0.1 },
  Callout: { fontSize: 16, lineHeight: 21, letterSpacing: 0.1 },
  Footnote: { fontSize: 13, lineHeight: 18, letterSpacing: 0.0 },
  Caption1: { fontSize: 12, lineHeight: 16, letterSpacing: 0.0 },
  Caption2: { fontSize: 11, lineHeight: 15, letterSpacing: 0.0 },
} as const;

function createTypographyComponent(
  styleConfig: (typeof typographyStyles)[keyof typeof typographyStyles],
) {
  return function TypographyComponent({
    weight = "regular",
    color,
    className,
    style,
    ...props
  }: FontProps) {
    return (
      <RNText
        {...props}
        className={className}
        style={[
          {
            fontFamily: sfFontFamilies[weight],
            ...(color ? { color } : {}),
            ...styleConfig,
          },
          style,
        ]}
      />
    );
  };
}

export const LargeTitle = createTypographyComponent(
  typographyStyles.LargeTitle,
);
export const Title = createTypographyComponent(typographyStyles.Title1);
export const Title2 = createTypographyComponent(typographyStyles.Title2);
export const Title3 = createTypographyComponent(typographyStyles.Title3);
export const Headline = createTypographyComponent(typographyStyles.Headline);
export const Subheadline = createTypographyComponent(
  typographyStyles.Subheadline,
);
export const Body = createTypographyComponent(typographyStyles.Body);
export const Callout = createTypographyComponent(typographyStyles.Callout);
export const Footnote = createTypographyComponent(typographyStyles.Footnote);
export const Caption = createTypographyComponent(typographyStyles.Caption1);
export const Caption2 = createTypographyComponent(typographyStyles.Caption2);
