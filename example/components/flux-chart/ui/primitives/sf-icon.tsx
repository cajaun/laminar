import React from "react";
import { Text } from "react-native";
import { SymbolView, type SFSymbol, type SymbolWeight } from "expo-symbols";

type SFIconProps = {
  name: SFSymbol;
  size: number;
  color: string;
  weight?: SymbolWeight;
  fallback: string;
  fallbackSize?: number;
};

export function SFIcon({
  name,
  size,
  color,
  weight = "regular",
  fallback,
  fallbackSize = size,
}: SFIconProps) {
  return (
    <SymbolView
      name={name}
      size={size}
      weight={weight}
      tintColor={color}
      style={{ width: size, height: size }}
      fallback={
        <Text
          aria-hidden
          style={{
            color,
            fontSize: fallbackSize,
            height: size,
            lineHeight: size,
            textAlign: "center",
            width: size,
          }}
        >
          {fallback}
        </Text>
      }
    />
  );
}
