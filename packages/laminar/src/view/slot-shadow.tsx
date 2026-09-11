import React from "react";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

const DEFAULT_SHADOW_COLOR = "#ffffff";
const DEFAULT_SHADOW_SIZE_RATIO = 0.16;

const transparentColor = (color: string) => {
  const value = color.trim();

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const expanded =
      hex.length === 3 || hex.length === 4
        ? hex
            .slice(0, 3)
            .split("")
            .map((channel) => channel + channel)
            .join("")
        : hex.slice(0, 6);

    if (expanded.length === 6 && /^[0-9a-f]+$/i.test(expanded)) {
      return `rgba(${Number.parseInt(expanded.slice(0, 2), 16)}, ${Number.parseInt(
        expanded.slice(2, 4),
        16
      )}, ${Number.parseInt(expanded.slice(4, 6), 16)}, 0)`;
    }
  }

  const channels = value.match(/\d+(?:\.\d+)?%?/g);
  if ((value.startsWith("rgb(") || value.startsWith("rgba(")) && channels) {
    const rgb = channels.slice(0, 3).map((channel) => {
      if (channel.endsWith("%")) {
        return Math.round((Number.parseFloat(channel) / 100) * 255);
      }

      return Number.parseFloat(channel);
    });

    if (rgb.length === 3 && rgb.every(Number.isFinite)) {
      return `rgba(${rgb.join(", ")}, 0)`;
    }
  }

  // Keep the fallback light so an unknown color never introduces a dark edge.
  return "rgba(255, 255, 255, 0)";
};

type SlotShadowProps = {
  readonly slotHeight: number;
  readonly viewportHeight: number;
  readonly color?: string;
  readonly size?: number;
  readonly children: React.ReactElement;
};

// Keep the mask mounted for the lifetime of the reel. The gradient controls
// the reel's alpha at the clipping edges instead of painting over its glyphs.
export const SlotShadow = React.memo(function SlotShadow({
  slotHeight,
  viewportHeight,
  color = DEFAULT_SHADOW_COLOR,
  size,
  children,
}: SlotShadowProps) {
  const edgeSize = Math.min(
    Math.max(4, size ?? slotHeight * DEFAULT_SHADOW_SIZE_RATIO),
    viewportHeight / 2
  );
  const fadeColor = transparentColor(color);
  const fadeRatio = edgeSize / viewportHeight;

  return (
    <MaskedView
      pointerEvents="none"
      style={styles.container}
      maskElement={
        <LinearGradient
          colors={[fadeColor, color, color, fadeColor]}
          locations={[0, fadeRatio, 1 - fadeRatio, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.mask}
        />
      }
    >
      {children}
    </MaskedView>
  );
});

SlotShadow.displayName = "SlotShadow";

const styles = StyleSheet.create({
  container: StyleSheet.absoluteFillObject,
  mask: StyleSheet.absoluteFillObject,
});
