import { Ionicons } from "@expo/vector-icons";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, TouchableOpacity } from "react-native";

type NavigationHeaderActionProps = {
  readonly accessibilityLabel: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly onPress: () => void;
};

export const NavigationHeaderAction = React.memo(
  function NavigationHeaderAction({
    accessibilityLabel,
    icon,
    onPress,
  }: NavigationHeaderActionProps) {
    const isLiquidGlass = isLiquidGlassAvailable();

    return (
      <TouchableOpacity
        onPressIn={() => {
          if (Platform.OS === "ios") {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        onPressOut={onPress}
        hitSlop={12}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={{
          zIndex: 50,
          padding: 12,
          ...(isLiquidGlass
            ? { paddingHorizontal: 10, paddingVertical: 8 }
            : undefined),
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color="#111318"
        />
      </TouchableOpacity>
    );
  },
);
