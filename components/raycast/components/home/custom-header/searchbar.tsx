import React, { forwardRef, useState } from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";
import { Search } from "lucide-react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import {
  SEARCHBAR_COMMANDS_WIDTH,
  SEARCHBAR_FAVORITES_WIDTH,
  SEARCHBAR_HEIGHT,
  TRIGGER_DRAG_DISTANCE,
  useHomeAnimation,
} from "../../../lib/providers/home-animation";
import PillTabs from "@/components/pill-tabs/pill-tabs";
import { pillTabsStyles } from "@/components/pill-tabs/pill-tabs-styles";



// ✅ Wrap with forwardRef
export const Searchbar = forwardRef<TextInput, TextInputProps>((props, ref) => {
  const { screenView, offsetY, isListDragging, onGoToCommands } = useHomeAnimation();

  const rContainerStyle = useAnimatedStyle(() => {
    if (isListDragging.value && offsetY.value < TRIGGER_DRAG_DISTANCE) {
      return {
    
        transform: [{ scale: withTiming(1.05) }],
      };
    }

    return {
      width: withSpring(
        screenView.value === "favorites"
          ? SEARCHBAR_FAVORITES_WIDTH
          : SEARCHBAR_COMMANDS_WIDTH,
        {
          stiffness: 750, // lower for slower motion
          damping: 75,    // higher for less bounce
          restSpeedThreshold: 0.01, 
          restDisplacementThreshold: 0.01,
        }
      ),
      transform: [{ scale: withTiming(1) }],
    
    };
  });



  return (
    <Animated.View className="justify-center z-[999]" style={rContainerStyle}>
      <TextInput
        {...props}
  ref={ref}
        placeholder="Search Raycast"
        placeholderTextColor="#78716c"
        className=" text-black pl-10 pr-3 rounded-2xl "
        style={styles.input}
        selectionColor="#000"
        onFocus={onGoToCommands}
      />
      <View className="absolute left-3">
        <Search size={16} color="#78716c" />
      </View>

       
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  input: {
    height: SEARCHBAR_HEIGHT,
    borderCurve: "continuous",

      backgroundColor: "rgba(118, 118, 128, 0.12)"

  },
});
