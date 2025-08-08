import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sheet } from "../sheet";

const ExpandedSheet = () => {

  const progress = useSharedValue(0);

  const rScreenStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(progress.value, [0, 1], [0, 48]),
    borderCurve: "continuous",
  }));

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={[{ flex: 1, backgroundColor: "white" }, rScreenStyle]}
      >
        <Sheet progress={progress} />
      </Animated.View>
    </View>
  );
};

export default ExpandedSheet;
