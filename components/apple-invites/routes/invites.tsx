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
    image: require("@/assets/images/apple-invites/1.png"),
    title: "Sunrise Yoga",
    description: "Thy, September 18, 06:00 South Lake Tahoe, CA",
  },
  {
    id: 2,
    image: require("@/assets/images/apple-invites/2.png"),

    title: "Tyler Turns 3!",
    description: "Sat, January 25, 18:00 Chicago IL",
  },
  {
    id: 3,
    image: require("@/assets/images/apple-invites/3.png"),

    title: "Reunion at the Lake",
    description: "Sat, November 8, 09:00 Anacortes, WA",
  },
  {
    id: 4,
    image: require("@/assets/images/apple-invites/4.png"),
    title: "Tom and Jen's Anniversary!",
    description: "Fri, August 22, 20:00 San Luis Obispo, CA",
  },
  {
    id: 5,
    image: require("@/assets/images/apple-invites/5.png"),
    title: "Housewarming Party",
    description: "Tue, September 2, 20:00 Brooklyn, NY",
  },
  {
    id: 6,
    image: require("@/assets/images/apple-invites/6.png"),
    title: "Watch Party",
    description: "Sun, February 9, 13:00 Game Room",
  },
  {
    id: 7,
    image: require("@/assets/images/apple-invites/7.png"),

    title: "Birthday Scavenger Hunt",
    description: "Thu, February 13, 14:00 Pioneer Park, CA",
  },
  {
    id: 8,
    image: require("@/assets/images/apple-invites/8.png"),
    title: "Surprise Brunch for Mom",
    description: "Sun, September 28, 11:00 At Home",
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
          Apple Invites
        </Text>

        <Text className="text-center text-lg font-medium text-white/60">
          Create beautiful invitations for all your events. Anyone can receive
          invitations. Sending included with iCloud+.
        </Text>

        <PressableScale
        className="h-[50px] bg-white justify-center items-center w-[95%] rounded-full"
          style={{
            
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            Continue
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}
