import React from "react";
import {
  View,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useHeaderHeight } from "../../lib/hooks/use-header-height";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import {
  FULL_DRAG_DISTANCE,
  TRIGGER_DRAG_DISTANCE,
  useHomeAnimation,
} from "../../lib/providers/home-animation";

import { TopGradient } from "./top-gradient";
import { Image } from "expo-image";

const images = [
  require("@/assets/images/apple-invites/1.webp"),
  require("@/assets/images/apple-invites/2.webp"),
  require("@/assets/images/apple-invites/3.webp"),
  require("@/assets/images/apple-invites/4.webp"),
  require("@/assets/images/apple-invites/5.webp"),
  require("@/assets/images/apple-invites/6.webp"),
  require("@/assets/images/apple-invites/7.webp"),
  require("@/assets/images/apple-invites/8.webp"),
];

const CommandItem = () => {
  const randomWidth = React.useMemo(() => Math.floor(Math.random() * 151) + 50, []);

  return (
    <Pressable className="flex-row items-center gap-3" onPress={() => Alert.alert("Item Pressed")}>
      <View className="w-16 h-16 rounded-2xl bg-orange-800" />
      <View className="h-3 rounded-full bg-neutral-700/25" style={{ width: randomWidth }} />
    </Pressable>
  );
};

export const CommandsList = () => {
  const insets = useSafeAreaInsets();
  const { grossHeight, netHeight } = useHeaderHeight();
  const { screenView, offsetY } = useHomeAnimation();

  const rContainerStyle = useAnimatedStyle(() => {
    const interpolatedOpacity = interpolate(
      offsetY.value,
      [FULL_DRAG_DISTANCE * 0.2, FULL_DRAG_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP
    );
  
    const isCommands = screenView.value === "commands";
  
    return {
      opacity: isCommands
      ? withDelay(50, withTiming(1, { duration: 250 })) // ← Delayed fade-in
      : withTiming(interpolatedOpacity, { duration: 0 }),
  
      transform: [{ translateY: -offsetY.value }],
      pointerEvents: isCommands ? "auto" : "none",
    };
  });
  

  const rTopGradientStyle = useAnimatedStyle(() => ({
    opacity:
      screenView.value === "commands" && offsetY.value > TRIGGER_DRAG_DISTANCE
        ? withTiming(1, { duration: 1000 })
        : 0,
  }));

  return (
    <Animated.View
      style={[rContainerStyle, { position: "absolute", width: "100%", height: "100%" }]}
    >
      
       <FlatList
          data={Array.from({ length: 30 })}
          renderItem={() => <CommandItem />}
          keyExtractor={(_, index) => index.toString()}
          className="flex-1"
          contentContainerClassName="gap-4 px-5"
          contentContainerStyle={{
            paddingTop: grossHeight + 20,
            paddingBottom: insets.bottom + 8,
          }}
          indicatorStyle="white"
          scrollIndicatorInsets={{ top: netHeight + 16 }}
        />
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { height: grossHeight }]}
      >
        <TopGradient />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "47%",
    height: 270,
    borderRadius: 12,
    overflow: "hidden",
  },
});
