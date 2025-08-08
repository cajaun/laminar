import { View, Pressable, useWindowDimensions, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useState } from "react";
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { Marquee } from "@/components/apple-invites/marquee";
import { useDebounce } from "use-debounce";
import { _itemWidth } from "@/components/apple-invites/marquee-item";
import ImageBg from "@/components/apple-invites/image-bg";
import { PressableScale } from "@/components/ui/utils/pressable-scale";

const events = [
  {
    id: 1,
    image: require("@/assets/images/apple-invites/1.webp"),
    title: "The Godfather",
    description: "Family, loyalty, power plays, and a deal you can't refuse.",
  },
  {
    id: 2,
    image: require("@/assets/images/apple-invites/2.webp"),
    title: "The Garfield Movie",
    description: "Lasagna, naps, Mondays, and a cat with endless attitude.",
  },
  {
    id: 3,
    image: require("@/assets/images/apple-invites/3.webp"),
    title: "John Wick: Ballerina",
    description:
      "Revenge, elegance, precision, and a deadly dance of survival.",
  },
  {
    id: 4,
    image: require("@/assets/images/apple-invites/4.webp"),
    title: "Pirates of the Caribbean",
    description: "Treasure, curses, wild seas, and Jack Sparrow's wild ride.",
  },
  {
    id: 5,
    image: require("@/assets/images/apple-invites/5.webp"),
    title: "Venom: The Last Dance",
    description: "One host, one alien, chaos, and a twisted partnership grows.",
  },
  {
    id: 6,
    image: require("@/assets/images/apple-invites/6.webp"),
    title: "Dune",
    description:
      "Deserts, spice, politics, power struggles, and ancient prophecies collide.",
  },
  {
    id: 7,
    image: require("@/assets/images/apple-invites/7.webp"),
    title: "Transformers",
    description: "Robots, explosions, hidden secrets, and a battle for Earth.",
  },
  {
    id: 8,
    image: require("@/assets/images/apple-invites/8.webp"),
    title: "Indiana Jones",
    description:
      "Whips, relics, villains, and nonstop adventure across ancient ruins.",
  },
];

export default function Invites() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [debouncedActiveIndex] = useDebounce(activeIndex, 500);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const scrollOffsetX = useSharedValue(0);
  const allItemsWidth = events.length * _itemWidth;

  useAnimatedReaction(
    () => scrollOffsetX.value,
    (currentValue) => {
      const normalizedOffset =
        ((currentValue % allItemsWidth) + allItemsWidth) % allItemsWidth;
      const shift = width / 2;
      const activeItemIndex = Math.abs(
        Math.floor((normalizedOffset + shift) / _itemWidth)
      );

      if (activeItemIndex === events.length) {
        runOnJS(setActiveIndex)(0);
      }

      if (
        activeItemIndex >= 0 &&
        activeItemIndex < events.length &&
        activeItemIndex !== activeIndex
      ) {
        runOnJS(setActiveIndex)(activeItemIndex);
      }
    }
  );

  return (
    <View
      className="flex-1 bg-slate-800"
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom }}
    >
      <ImageBg
        itemKey={events[debouncedActiveIndex].id.toString()}
        source={events[debouncedActiveIndex].image}
      />
      <View className="basis-[60%] pt-10">
        <Marquee events={events} scrollOffsetX={scrollOffsetX} />
      </View>

      <View className="flex-1 w-full items-center justify-center px-4 gap-y-4">
        <Text className="text-center text-xl font-bold text-white/60">
          Welcome to
        </Text>

        <Text className="text-center text-6xl font-bold text-white">
          Movers
        </Text>

        <Text className="text-center text-lg font-medium text-white/60">
          Browse your favorite movies, discover new releases, and enjoy epic
          moments. All your favorites in one place.
        </Text>

        <PressableScale className="h-[50px] bg-white justify-center items-center w-[95%] rounded-full">
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            Get Started
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}
