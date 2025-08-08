import React, { FC } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Pressable } from "react-native";
import { ProfileImageBase } from "./profile-image-base";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  _timingConfig,
  useProfileImageAnimation,
} from "../lib/providers/profile-image-animation-provider";
import { X } from "lucide-react-native";

// threads-profile-picture-animation 🔽

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const AnimatedProfileImage: FC = () => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const {
    expandedProfileImageSize,
    imageState,
    imageXCoord,
    imageYCoord,
    imageSize,
    blurIntensity,
    closeBtnOpacity,
    open,
    close,
  } = useProfileImageAnimation();

  const imageScale = useSharedValue(1);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);

  const rImageContainerStyle = useAnimatedStyle(() => {
    return {
      pointerEvents: imageState.value === "open" ? "auto" : "none",
    };
  });

  const rImageStyle = useAnimatedStyle(() => {
    return {
      left: imageXCoord.value,
      top: imageYCoord.value,
      width: imageSize.value,
      height: imageSize.value,
      opacity: imageState.value === "open" ? 1 : 0,
      transform: [{ scale: imageScale.value }],
    };
  });

  const backdropAnimatedProps = useAnimatedProps(() => {
    return {
      intensity: blurIntensity.value,
    };
  });

  const rCloseBtnStyle = useAnimatedStyle(() => {
    return {
      opacity: closeBtnOpacity.value,
    };
  });

  const pan = Gesture.Pan()
    .onStart(() => {
      panStartX.value = imageXCoord.value;
      panStartY.value = imageYCoord.value;
      closeBtnOpacity.value = withTiming(0, { duration: 200 });
    })
    .onChange((event) => {
      if (imageState.value === "close") return;

      imageXCoord.value += event.changeX / 2;
      imageYCoord.value += event.changeY / 2;

      const deltaX = imageXCoord.value - panStartX.value;
      const deltaY = imageYCoord.value - panStartY.value;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const scale = interpolate(distance, [0, screenWidth / 2], [1, 0.9], {
        extrapolateRight: "clamp",
      });

      const blur = interpolate(distance, [0, screenWidth / 2], [100, 0], {
        extrapolateRight: "clamp",
      });

      imageScale.value = scale;
      blurIntensity.value = blur;
    })
    .onFinalize(() => {
      const deltaX = imageXCoord.value - panStartX.value;
      const deltaY = imageYCoord.value - panStartY.value;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      imageScale.value = withTiming(1, _timingConfig);

      if (distance > expandedProfileImageSize / 2) {
        close();
      } else {
        open();
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <AnimatedPressable
        style={[StyleSheet.absoluteFill, rImageContainerStyle]}
        onPress={close}
        className="pointer-events-none"
      >
        <AnimatedBlurView
          tint="systemChromeMaterialDark"
          style={StyleSheet.absoluteFill}
          animatedProps={backdropAnimatedProps}
        />
        <Animated.View
          className="absolute left-4 bg-black/50 p-1 rounded-full"
          style={[rCloseBtnStyle, { top: insets.top + 16 }]}
        >
          <X size={22} color="white" />
        </Animated.View>
        <AnimatedPressable
          className="absolute rounded-full overflow-hidden"
          style={[rImageStyle, { transformOrigin: "center" }]}
        >
          <ProfileImageBase />
        </AnimatedPressable>
      </AnimatedPressable>
    </GestureDetector>
  );
};

// threads-profile-picture-animation 🔼
