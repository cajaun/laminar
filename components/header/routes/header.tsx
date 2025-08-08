import { View, Text, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, {
  useAnimatedRef,
  useScrollViewOffset,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useHeaderTitle } from "@/hooks/use-header-title";
import { useTargetMeasurement } from "@/hooks/use-target-measurment";
import React, { useState } from "react";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const listRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffsetY = useScrollViewOffset(listRef);

  useHeaderBackground({ offsetY: scrollOffsetY });

  const { triggerRef, onLayout } = useHeaderTitle({
    offsetY: scrollOffsetY,
    title: "vvv-sss",
  });

  const { targetRef, onTargetLayout, measurement } = useTargetMeasurement();

  // Calculate sticky height for padding
  const stickyHeight = measurement.value?.height ?? 0;

  // State for tabs
  const [activeTab, setActiveTab] = useState("Tab1");

  return (
    <View className="flex-1 bg-black">
      <Animated.ScrollView
        ref={listRef}
        className="flex-1 bg-black"
        contentContainerClassName="px-5"
        contentContainerStyle={{
          paddingTop: headerHeight ,
          paddingBottom: insets.bottom,
        }}
        scrollEventThrottle={1000 / 60}
        indicatorStyle="white"
        stickyHeaderIndices={[1]} // Make the tabs sticky - 2nd child
      >
        {/* First section: Profile header */}
        <View className="flex-row items-center gap-4 mb-6">
          <View className="w-20 h-20 rounded-full border border-white/15" />
          <View className="flex-1">
            <Text className="text-stone-100 font-bold text-lg">
              Volodymyr Serbulenko
            </Text>
            <Animated.View ref={triggerRef} onLayout={onLayout}>
              <Text className="text-stone-300 text-base">vvv-sss</Text>
            </Animated.View>
          </View>
        </View>

        {/* Second section: Tabs - this will be sticky */}
        <Animated.View
          ref={targetRef}
          onLayout={onTargetLayout}
          className="flex-row bg-neutral-900 rounded-xl "
        >
          {["Tab1", "Tab2", "Tab3"].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-lg items-center justify-center ${
                activeTab === tab
                  ? "bg-stone-100"
                  : "bg-neutral-800"
              }`}
            >
              <Text
                className={`font-semibold ${
                  activeTab === tab ? "text-black" : "text-stone-300"
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Scroll content */}
        <View className="w-full h-12 bg-neutral-900 rounded-xl mb-6" />
        <View className="w-3/4 h-4 bg-neutral-900 rounded-md mb-1" />
        <View className="w-1/2 h-4 bg-neutral-900 rounded-md mb-4" />
        <View className="w-32 h-4 bg-neutral-900 rounded-md mb-4" />
        <View className="mb-6" />
        <View className="gap-[2px] mb-10">
          <View className="w-full h-12 bg-neutral-900 rounded-lg" />
          <View className="w-full h-12 bg-neutral-900 rounded-lg" />
          <View className="w-full h-12 bg-neutral-900 rounded-lg" />
        </View>
        <View className="w-1/3 h-4 bg-neutral-900 rounded-md mb-4" />
        <View className="w-full h-40 bg-neutral-900 rounded-xl mb-2" />
        <View className="w-full h-40 bg-neutral-900 rounded-xl mb-2" />
        <View className="w-full h-40 bg-neutral-900 rounded-xl mb-2" />
        <View className="w-full h-40 bg-neutral-900 rounded-xl mb-2" />
      </Animated.ScrollView>
    </View>
  );
}
