import React, { FC, PropsWithChildren } from "react";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileImageAnimation } from "../lib/providers/profile-image-animation-provider";

// threads-profile-picture-animation 🔽

export const AnimatedScrollView: FC<PropsWithChildren> = ({ children }) => {
  const insets = useSafeAreaInsets();

  const { listRef } = useProfileImageAnimation();

  return (
    <Animated.ScrollView
      ref={listRef}
      className="bg-neutral-950"
      contentContainerClassName="px-4"
      contentContainerStyle={{ paddingTop: insets.top + 30 }}
    >
      {children}
    </Animated.ScrollView>
  );
};

// threads-profile-picture-animation 🔼
