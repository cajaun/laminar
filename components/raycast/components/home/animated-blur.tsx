import React from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useHomeAnimation } from "../../lib/providers/home-animation";

// raycast-home-search-transition-animation 🔽

export const AnimatedBlur = () => {
  const { blurIntensity } = useHomeAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(255,255,255,${blurIntensity.value / 100})`,
  }));

  return <Animated.View style={[StyleSheet.absoluteFill, animatedStyle, styles.container]} />;
};

const styles = StyleSheet.create({
  container: {
    pointerEvents: "none",
  },
});

// raycast-home-search-transition-animation 🔼
