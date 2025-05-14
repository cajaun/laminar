import { useTargetMeasurement } from "./use-target-measurment";
import {
  HeaderTitle as HeaderTitleComponent,
  HeaderTitleProps,
  useHeaderHeight,
} from "@react-navigation/elements";
import { useNavigation } from "expo-router";
import type React from "react";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

// github-profile-header-title-animation 🔽

type Props = {
  offsetY: SharedValue<number>;
  title: string;
};

export const useHeaderTitle = ({ offsetY, title }: Props) => {
  const navigation = useNavigation();

  const headerHeight = useHeaderHeight();

  const isIOS = Platform.OS === "ios";

  const {
    targetRef: triggerRef,
    onTargetLayout: onLayout,
    measurement: triggerMeasurement,
  } = useTargetMeasurement();

  const rTitleStyle = useAnimatedStyle(() => {
    if (triggerMeasurement.value === null) {
      return { opacity: 0 };
    }

    const triggerHeight = triggerMeasurement.value.height;
    const triggerPageY = triggerMeasurement.value.pageY;

    const scrollDistance = isIOS ? triggerPageY - 2 * headerHeight : triggerPageY - headerHeight;
    // Kinda bug on iOS and reanimated measure adds headerHeight to pageY if router header is enabled
    // That's why we need to subtract 2 * headerHeight

    return {
      opacity: 1,
      transform: [
        {
          translateY: interpolate(
            offsetY.value,
            [0, scrollDistance, scrollDistance + triggerHeight],
            [30, 30, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: (props: HeaderTitleProps) => {
        return (
          <View className="py-3 overflow-hidden">
            <Animated.View style={rTitleStyle}>
              <HeaderTitleComponent {...props}>{title}</HeaderTitleComponent>
            </Animated.View>
          </View>
        );
      },
    });
  }, [navigation, rTitleStyle, title]);

  return { triggerRef, onLayout };
};

// github-profile-header-title-animation 🔼
