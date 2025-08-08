import React, { FC } from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useProfileImageAnimation } from "../lib/providers/profile-image-animation-provider";
import { Pressable } from "react-native";
import { ProfileImageBase } from "./profile-image-base";

// threads-profile-picture-animation 🔽

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const DefaultProfileImage: FC = () => {
  const { targetRef, onTargetLayout, defaultProfileImageSize, imageState, open } =
    useProfileImageAnimation();

  const rImagePlaceholderStyle = useAnimatedStyle(() => {
    return {
      opacity: imageState.value === "open" ? 0 : 1,
    };
  });

  return (
    <Animated.View ref={targetRef} onLayout={onTargetLayout}>
      <AnimatedPressable
        className="rounded-full overflow-hidden"
        style={[
          rImagePlaceholderStyle,
          { width: defaultProfileImageSize, height: defaultProfileImageSize },
        ]}
        onPress={open}
      >
        <ProfileImageBase />
      </AnimatedPressable>
    </Animated.View>
  );
};

// threads-profile-picture-animation 🔼
