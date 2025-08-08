import { View } from "react-native";

import { ProfileImageAnimationProvider } from "../lib/providers/profile-image-animation-provider";
import { AnimatedProfileImage } from "../components/animated-profile-image";
import { DefaultProfileImage } from "../components/default-profile-image";
import { AnimatedScrollView } from "../components/animated-scroll-view";

// threads-profile-picture-animation 🔽

export default function Zoom() {


  return (
    <ProfileImageAnimationProvider>
      <AnimatedScrollView>
        <View className="flex-row items-end justify-between mb-6">
          <View className="gap-1">
            <View className="w-[80px] h-6 rounded-full bg-neutral-900" />
            <View className="w-[60px] h-4 rounded-full bg-neutral-900" />
          </View>
          <DefaultProfileImage />
        </View>
        <View className="flex-row gap-4 mb-6">
          <View className="w-[60px] h-4 rounded-full bg-neutral-900" />
          <View className="w-[80px] h-4 rounded-full bg-neutral-900" />
        </View>
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 h-10 rounded-lg bg-neutral-900" />
          <View className="flex-1 h-10 rounded-lg bg-neutral-900" />
        </View>
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 h-4 rounded-full bg-neutral-900" />
          <View className="flex-1 h-4 rounded-full bg-neutral-900" />
          <View className="flex-1 h-4 rounded-full bg-neutral-900" />
          <View className="flex-1 h-4 rounded-full bg-neutral-900" />
        </View>
        <View className="flex-row justify-between mb-6">
          <View className="w-[120px] h-4 rounded-full bg-neutral-900" />
          <View className="w-[60px] h-4 rounded-full bg-neutral-900" />
        </View>
        <View className="flex-row gap-2 mb-[500px]">
          <View className="flex-1 aspect-square rounded-2xl bg-neutral-900" />
          <View className="flex-1 aspect-square rounded-2xl bg-neutral-900" />
        </View>
      </AnimatedScrollView>
      <AnimatedProfileImage />
    </ProfileImageAnimationProvider>
  );
}

// threads-profile-picture-animation 🔼
