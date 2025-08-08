import { StyleSheet, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  useDerivedValue,
  runOnJS,
  withTiming,
  Easing,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState } from "react";

import { SymbolView } from "expo-symbols";
import { PressableScale } from "../ui/utils/pressable-scale";
import { BaseOffset } from "./constants";

type SheetContentProps = {
  progress: SharedValue<number>;
};

export const SheetContent = ({
  progress,

}: SheetContentProps) => {
  const [isInteractive, setIsInteractive] = useState(false);

  // const { openTray, closeTray } = useActionTray();

  // const contentMap = React.useMemo(() => {
  //   let map: Record<number, React.ReactNode> = {};
  //   map = getContentMap(
  //     (step) => openTray(step, map),
  //     closeTray,
  //     map
  //   );
  //   return map;
  // }, [openTray, closeTray]);

  useDerivedValue(() => {
    const active = progress.value > 0.95;
    runOnJS(setIsInteractive)(active);
    return active;
  });

  const { top: safeTop } = useSafeAreaInsets();

  const EasingsUtils = {
    inOut: Easing.bezier(0.25, 0.1, 0.25, 1),
  };

  const rContainerStyle = useAnimatedStyle(() => ({
    marginTop: interpolate(progress.value, [0, 1], [BaseOffset, 48]),
  }));

  const rTitleStyle = useAnimatedStyle(() => {
    const top = interpolate(progress.value, [0, 1], [-BaseOffset + 50, 40]);
    const translateY = interpolate(progress.value, [0, 1], [0, -25]);
    const opacity = interpolate(progress.value, [0, 0.6], [1, 0]);
    return {
      top,
      fontSize: interpolate(progress.value, [0, 1], [30, 3]),
      marginTop: interpolate(progress.value, [0, 1], [0, -24]),
      transform: [{ translateY }],
      alignSelf: "center",
      opacity,
    };
  });

  const rKnobStyle = useAnimatedStyle(() => {
    const top = interpolate(progress.value, [0, 1], [-BaseOffset + 29, 40]);
    const translateY = interpolate(progress.value, [0, 1], [0, -25]);
    const scaleX = interpolate(progress.value, [0, 1], [0.05, 1]);
    return {
      top,
      transform: [{ translateY }, { scaleX }],
      alignSelf: "center",
      opacity: interpolate(progress.value, [0.6, 0.7], [0, 1]),
    };
  });

  const rSubtitleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(progress.value, [0, 1], [25, 19]);
    const top = interpolate(
      progress.value,
      [0, 0.95],
      [-BaseOffset + 90, safeTop - 17]
    );
    const color = interpolateColor(
      progress.value,
      [0, 0.6],
      ["#BFBFBF", "#000000"]
    );

    return {
      fontSize,
      top,
      alignSelf: "center",
      color,
    };
  });


  const rLeftButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.6, 1], [0, 1]),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-2, 0]) },
      { scale: interpolate(progress.value, [0.75, 1], [0.95, 1]) },
    ],
    position: "absolute",
    top: interpolate(
      progress.value,
      [0, 0.95],
      [-BaseOffset + 90, safeTop - 20]
    ),
    left: 16,
    zIndex: 1002,
  }));

  const rRightButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.6, 1], [0, 1]),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [2, 0]) },
      { scale: interpolate(progress.value, [0.75, 1], [0.95, 1]) },
    ],
    position: "absolute",
    top: interpolate(
      progress.value,
      [0, 0.95],
      [-BaseOffset + 90, safeTop - 20]
    ),
    right: 16,
    zIndex: 1002,
  }));






  return (
    <Animated.View
      style={[
        rContainerStyle,
        { flex: 1, width: "100%", justifyContent: "flex-start" },
      ]}
    >
      <Animated.View
        style={[
          rKnobStyle,
          {
            top: safeTop + 8,
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            zIndex: 1001,
          },
          ,
        ]}
      >
        <View
          style={{
            width: 56,
            height: 7,
            borderRadius: 36,
            backgroundColor: "#DFDFDF",
          }}
        />
      </Animated.View>

      <Animated.Text
        style={[
          rTitleStyle,
          {
            color: "black",
            fontWeight: "bold",
            textAlign: "center",
            position: "absolute",
            zIndex: 10,
            width: "100%",
          },
        ]}
      >
     What's inside?
      </Animated.Text>

      <Animated.Text
        style={[
          rSubtitleStyle,
          {
            textAlign: "center",
            position: "absolute",
            zIndex: 9,
            width: "100%",
            fontWeight: "bold",
          },
        ]}
      >
        Details
      </Animated.Text>



      <Animated.View style={[rLeftButtonStyle]}>
        <PressableScale
          onPress={() => {
            progress.value = withTiming(0, {
              duration: 350,
              easing: EasingsUtils.inOut,
            });
          }}
          className="w-16 h-16 rounded-full items-center bg-[#F2F2F2] justify-center "
        >
          <SymbolView
            name="chevron.down"
            tintColor={"black"}
            weight="bold"
            size={25}
          />
        </PressableScale>
      </Animated.View>

      <Animated.View style={[rRightButtonStyle]}>
        <PressableScale className="w-16 h-16 rounded-full items-center bg-[#F2F2F2] justify-center">
          <SymbolView
           name="questionmark.circle"
            tintColor={"black"}
            weight="medium"
            size={25}
          />
        </PressableScale>
      </Animated.View>



    </Animated.View>
  );
};
