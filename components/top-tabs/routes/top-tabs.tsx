import React, { FC, useRef } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Index } from "@/components/top-tabs";
import { Tab, TabValue } from "@/components/top-tabs/types";
import { ItemContainer } from "@/components/top-tabs/item-container";
import { FeedPostList } from "@/components/top-tabs/feed-post-lists";
import { Image } from "expo-image";

const tabs: Tab[] = [
  { label: "For You", value: TabValue.ForYou, content: <FeedPostList /> },
  { label: "Following", value: TabValue.Following, content: <FeedPostList /> },
  { label: "News", value: TabValue.News, content: <FeedPostList /> },

];

const TopTabs = () => {
  const horizontalListRef = useRef<FlatList>(null);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const horizontalListOffsetX = useSharedValue(0);
  const isHorizontalListScrollingX = useSharedValue(false);
  const prevActiveTabIndex = useSharedValue(0);
  const activeTabIndex = useSharedValue(0);

  // handler for syncing tab with horizontal scroll
  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      isHorizontalListScrollingX.value = true;
    },
    onScroll: (event) => {
      horizontalListOffsetX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      isHorizontalListScrollingX.value = false;
      activeTabIndex.value = Math.round(event.contentOffset.x / width);
    },
  });

  const _renderItem = ({
    item,
    index,
  }: {
    item: (typeof tabs)[number];
    index: number;
  }) => (
    <ItemContainer
      index={index}
      activeTabIndex={activeTabIndex}
      prevActiveTabIndex={prevActiveTabIndex}
      isHorizontalListScrollingX={isHorizontalListScrollingX}
    >
      {item.content}
    </ItemContainer>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top + 8 }}>
      <View className=" border-b border-[#E9EDEF]">
        <View className="flex-row justify-between mb-2 px-5">
          <View>
            <Image
              source={{ uri: "https://picsum.photos/seed/696/3000/2000" }}
              style={{
                height: 30,
                width: 30,
                borderRadius: 15,
              }}
              contentFit="cover"
            />
          </View>
          <View className="absolute top-0 left-0 right-0 bottom-0 flex-row items-center justify-center pointer-events-none">
            <FontAwesome6 name="x-twitter" size={24} color="#000000" />
          </View>
          <View className="  bg-white border border-[#E9EDEF] rounded-full py-1 px-2.5 items-center">
            <Text className="text-sm font-bold ">Get Premium</Text>
          </View>
        </View>

        <Index
          tabs={tabs}
          horizontalListRef={horizontalListRef}
          horizontalListOffsetX={horizontalListOffsetX}
          isHorizontalListScrollingX={isHorizontalListScrollingX}
          activeTabIndex={activeTabIndex}
          prevActiveTabIndex={prevActiveTabIndex}
        />
      </View>

      <View className="flex-1 ">
        <Animated.FlatList
          ref={horizontalListRef}
          data={tabs}
          renderItem={_renderItem}
          keyExtractor={(item) => item.value.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          pagingEnabled
          decelerationRate="fast"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          bounces={false}
        />
      </View>
    </View>
  );
};

export default TopTabs;
