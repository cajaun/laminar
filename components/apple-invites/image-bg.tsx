import React, { FC, memo } from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";



type Props = {
  itemKey: string;
  source: number;
};

const ImageBg: FC<Props> = ({ itemKey, source }) => {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.Image
        key={itemKey}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(500)}
        source={source}
        className="h-full w-full"
      />
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={100}
          tint="systemChromeMaterialDark"
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View className="absolute inset-0 bg-neutral-700/95" />
      )}
    </View>
  );
};

export default memo(ImageBg);


