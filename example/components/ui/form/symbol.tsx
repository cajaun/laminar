import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import {
  SymbolView as ExpoSymbolView,
  type SFSymbol,
  type SymbolWeight,
} from "expo-symbols";
import { formColors } from "./colors";
import type { SystemImageCustomProps, SystemImageProps } from "./types";
import { isExternalHref } from "./utils";

type SymbolProps = {
  readonly systemImage?: SystemImageProps;
  readonly className?: string;
  readonly style?: StyleProp<ViewStyle>;
};

export function SystemImage({ systemImage, style }: SymbolProps) {
  if (!systemImage) {
    return null;
  }

  if (typeof systemImage !== "string" && React.isValidElement(systemImage)) {
    return systemImage;
  }

  const symbolProps = resolveSystemImage(systemImage);
  const size = symbolProps.size ?? 20;
  const color = symbolProps.color ?? formColors.text;

  return (
    <ExpoSymbolView
      name={symbolProps.name}
      size={size}
      weight={symbolProps.weight ?? "regular"}
      tintColor={color}
      style={[styles.symbol, { width: size, height: size }, style]}
      fallback={
        <Text
          style={[
            styles.fallback,
            { color, fontSize: size },
            symbolProps.style,
          ]}
        >
          {fallbackGlyph(symbolProps.name)}
        </Text>
      }
    />
  );
}

export function LeftBadge({
  name,
  color = "#ffffff",
  backgroundColor = formColors.badge,
  size = 18,
  style,
}: {
  readonly name: SFSymbol;
  readonly color?: string;
  readonly backgroundColor?: string;
  readonly size?: number;
  readonly style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <SystemImage
        systemImage={{
          name,
          size,
          color,
          weight: "semibold",
        }}
      />
    </View>
  );
}

export function LinkChevronIcon({
  href,
  systemImage,
  style,
}: {
  readonly href?: unknown;
  readonly systemImage?: SystemImageProps;
  readonly style?: StyleProp<ViewStyle>;
}) {
  if (systemImage) {
    return <SystemImage systemImage={systemImage} style={style} />;
  }

  return (
    <SystemImage
      systemImage={{
        name: isExternalHref(href) ? "arrow.up.right" : "chevron.right",
        size: Platform.OS === "ios" ? 14 : 20,
        weight: "bold",
        color: formColors.textTertiary,
      }}
      style={style}
    />
  );
}

function resolveSystemImage(systemImage: SystemImageProps) {
  if (
    typeof systemImage === "object" &&
    systemImage !== null &&
    "name" in systemImage
  ) {
    return systemImage as SystemImageCustomProps;
  }

  return {
    name: systemImage as SFSymbol,
  };
}

function fallbackGlyph(name: SFSymbol) {
  const fallbacks: Partial<Record<SFSymbol, string>> = {
    "arrow.up.right": "↗",
    "chevron.right": "›",
    "checkmark.circle.fill": "✓",
    "slash.circle": "⊘",
  };

  return fallbacks[name] ?? "";
}

export type { SFSymbol, SymbolWeight };

const styles = StyleSheet.create({
  symbol: {},
  fallback: {
    fontFamily: "Sf-semibold",
    lineHeight: 24,
    textAlign: "center",
  } satisfies TextStyle,
  badge: {
    width: 36,
    height: 36,
    marginRight: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
