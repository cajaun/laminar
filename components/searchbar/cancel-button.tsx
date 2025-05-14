import React, { FC } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import Animated, { withTiming } from "react-native-reanimated";
import { CANCEL_CONTAINER_WIDTH, SEARCHBAR_INITIAL_WIDTH, useHomeAnimation } from "./animation-provider";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CancelButton: FC = () => {
  const { searchbarWidth, inputRef } = useHomeAnimation();

  const handlePress = () => {
    // Clear input and blur it
    inputRef.current?.clear();
    inputRef.current?.blur();

    // Animate back to initial width
    searchbarWidth.value = withTiming(SEARCHBAR_INITIAL_WIDTH, { duration: 250 });
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={styles.container}
    >
      <Text style={styles.text}>Cancel</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CANCEL_CONTAINER_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  text: {
    color: "#a3a3a3", // Tailwind's neutral-400
    fontWeight: "500",
  },
});
