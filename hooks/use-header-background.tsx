import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { SharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useHeaderHeight } from "@react-navigation/elements";
import { BlurView } from "expo-blur";
import { useTargetMeasurement } from "./use-target-measurment";

type Props = {
  offsetY: SharedValue<number>;
};

export const useHeaderBackground = ({ offsetY }: Props) => {
  const navigation = useNavigation();

  const headerHeight = useHeaderHeight();

  const { measurement, targetRef, onTargetLayout } = useTargetMeasurement();

  const rBgStyle = useAnimatedStyle(() => {
    if (measurement.value === null) return { backgroundColor: "#0a0a0a" };

    const scrollDistance = measurement.value.pageY - headerHeight;

    return {
      backgroundColor: offsetY.value > scrollDistance ? "#0a0a0a80" : "#0a0a0a",
    };
  });

  const rBlurStyle = useAnimatedStyle(() => {
    if (measurement.value === null) return { opacity: 0 };

    const scrollDistance = measurement.value.pageY - headerHeight;

    return {
      opacity: withTiming(offsetY.value > scrollDistance ? 1 : 0, { duration: 150 }),
    };
  });

  useEffect(() => {
    navigation.setOptions({
      headerBackground: () => {
        return (
          <Animated.View className="absolute inset-0" style={rBgStyle}>
            <Animated.View className="absolute inset-0" style={rBlurStyle}>
              <BlurView
                intensity={100}
                tint="systemChromeMaterialDark"
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
          </Animated.View>
        );
      },
    });
  }, [navigation, rBgStyle, rBlurStyle]);

  return { targetRef, onTargetLayout };
};
