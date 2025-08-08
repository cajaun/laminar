import React, { FC } from "react";
import { View } from "react-native";
import { DummyHeader } from "../components/home/custom-header/dummy-header";
import { Favorites } from "../components/home/favorites";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeAnimationProvider } from "../lib/providers/home-animation";
import { AnimatedBlur } from "../components/home/animated-blur";
import { CommandsList } from "../components/home/commands-list";
import { AnimatedChevron } from "../components/home/animated-chevron";
import { RealHeader } from "../components/home/custom-header/real-header";

// raycast-home-search-transition-animation 🔽

const Home = () => {

  const insets = useSafeAreaInsets();

  return (
    <HomeAnimationProvider>
      <View className="flex-1 bg-white">
        <Favorites />
        <DummyHeader />
        
        <AnimatedBlur />
        <CommandsList />
        {/* <AnimatedChevron /> */}
        <RealHeader />
      </View>
   </HomeAnimationProvider>
  );
};

export default Home

// raycast-home-search-transition-animation 🔼
