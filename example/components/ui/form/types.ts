import type React from "react";
import type { ColorValue, StyleProp, TextProps, TextStyle } from "react-native";
import type { SFSymbol, SymbolWeight } from "expo-symbols";

export type ListStyle = "grouped" | "auto";

export type SeparatorInset = "automatic" | "content" | "full";

export type SystemImageCustomProps = {
  readonly name: SFSymbol;
  readonly color?: ColorValue;
  readonly size?: number;
  readonly weight?: SymbolWeight;
  readonly style?: StyleProp<TextStyle>;
};

export type SystemImageProps =
  | SFSymbol
  | SystemImageCustomProps
  | React.ReactNode;

export type FormTextProps = TextProps & {
  readonly hint?: React.ReactNode;
  readonly hintBoolean?: React.ReactNode;
  readonly systemImage?: SystemImageProps;
  readonly imageClassName?: string;
  readonly bold?: boolean;
};
