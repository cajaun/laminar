import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import { useHeaderHeight } from "../../lib/hooks/use-header-height";

// raycast-home-search-transition-animation 🔽

export const TopGradient: FC = () => {
  const { grossHeight } = useHeaderHeight();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { height: grossHeight , backgroundColor: "#fff" },
      ]}
    />
  );
};

// raycast-home-search-transition-animation 🔼
