import React, { FC } from "react";
import { Text, Pressable } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import {
  CANCEL_CONTAINER_WIDTH,
  SETTINGS_CONTAINER_WIDTH,
  useHomeAnimation,
} from "../../../lib/providers/home-animation";
import { SEARCHBAR_HEIGHT } from "@/components/searchbar/animation-provider";

// raycast-home-search-transition-animation 🔽

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CancelButton: FC = () => {
  const { screenView, onGoToFavorites, offsetY } = useHomeAnimation();



  const rContainerStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(
        screenView.value === "commands" ? CANCEL_CONTAINER_WIDTH : SETTINGS_CONTAINER_WIDTH
      ),
      opacity: screenView.value === "commands" ? withTiming(1) : 0,
      pointerEvents: screenView.value === "commands" ? "auto" : "none",
    };
  });

  return (
    <AnimatedPressable
      onPress={onGoToFavorites}
      className="items-center justify-center z-[999] "
      style={[rContainerStyle, {
        height: SEARCHBAR_HEIGHT
      }]}
    >
      <Text className="text-black font-medium">Cancel</Text>
    </AnimatedPressable>
  );
};

// raycast-home-search-transition-animation 🔼
