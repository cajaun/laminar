import React, { FC, memo } from "react";
import { Dimensions, Image, View, StyleSheet, Text } from "react-native";
import Animated, {
  FadeIn,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { easeGradient } from "react-native-easing-gradient";
import { BlurView } from "expo-blur";



const screenWidth = Dimensions.get("screen").width;

export const _itemWidth = screenWidth * 0.6;

type Props = {
  index: number;
  imageSrc: number;
  scrollOffsetX: SharedValue<number>;
  allItemsWidth: number;
  title: string;
  description: string;
};

const MarqueeItemComponent: FC<Props> = ({
  index,
  imageSrc,
  scrollOffsetX,
  allItemsWidth,
  title,
  description,
}) => {
  const shift = (allItemsWidth - screenWidth) / 2;
  const initialLeft = index * _itemWidth - shift;

  const rContainerStyle = useAnimatedStyle(() => {
    const normalizedOffset =
      ((scrollOffsetX.value % allItemsWidth) + allItemsWidth) % allItemsWidth;
    const left = ((initialLeft - normalizedOffset) % allItemsWidth) + shift;

    const rotation = interpolate(
      left,
      [0, screenWidth - _itemWidth],
      [-0.6, 0.6]
    );
    const translateY = interpolate(
      left,
      [0, (screenWidth - _itemWidth) / 2, screenWidth - _itemWidth],
      [1, -0.5, 1]
    );

    return {
      left,
      transform: [{ rotateZ: `${rotation}deg` }, { translateY }],
    };
  });

  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: "transparent" },
      0.5: { color: "rgba(0,0,0,0.99)" },
      1: { color: "black" },
    },
  }) as {
    colors: [string, string, ...string[]];
    locations: [number, number, ...number[]];
  };

  return (
    <Animated.View
      className="absolute h-full p-2"
      style={[
        rContainerStyle,
        { width: _itemWidth, transformOrigin: "bottom" },
      ]}
    >
      <View className="flex-1 shadow-md">
        <View className="flex-1 rounded-3xl overflow-hidden">
          <Image source={imageSrc} className="h-full w-full" />
          <Animated.View
            entering={FadeIn}
            className="absolute bottom-0"
            style={{ width: _itemWidth, height: "100%" }}
          >
            <View
              className="rounded-3xl  overflow-hidden"
              style={{ width: "100%", height: "100%" }}
            >
              <Animated.View>
                <Image source={imageSrc} className="h-full w-full" />
              </Animated.View>
              <View
                style={[{position: "absolute",
                  bottom: 0,
                  zIndex: 2,},{ width: "100%", height: "50%" }]}
              >
                <MaskedView
                  maskElement={
                    <LinearGradient
                      locations={locations}
                      colors={colors}
                      style={StyleSheet.absoluteFill}
                    />
                  }
                  style={StyleSheet.absoluteFill}
                >
                  <BlurView
                    intensity={90}
                    tint={"systemChromeMaterialDark"}
                    style={StyleSheet.absoluteFill}
                  />
                </MaskedView>
                <View className="flex-1 justify-end items-center px-4 mb-5 gap-y-2">
                  <Text className="text-white font-bold text-center text-3xl">
                    {title}
                  </Text>
                  <Text numberOfLines={3} className="text-center  font-semibold text-white/60 px-6">
                  {description}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
         
        </View>
      </View>
    </Animated.View>
  );
};

export const MarqueeItem = memo(MarqueeItemComponent);

