import React, { FC, RefObject, useRef } from "react";
import { Dimensions, FlatList, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { TabIndicator } from "./tab-indicator";
import { TabItem } from "./tab-item";
import { Tab } from "./types";
import * as Haptics from "expo-haptics";

export const _homePostsListWidth = Dimensions.get("window").width;

type Props = {
  tabs: Tab[]; 
  horizontalListRef: RefObject<FlatList>; // ref for controlling the horizontal FlatList
  horizontalListOffsetX: SharedValue<number>; // shared value to track horizontal scroll position
  isHorizontalListScrollingX: SharedValue<boolean>; // shared value to check if horizontal scroll is in progress
  activeTabIndex: SharedValue<number>; // shared value to track the active tab index
  prevActiveTabIndex: SharedValue<number>; // shared value to track the previous active tab index
};

export const Index: FC<Props> = ({
  tabs,
  horizontalListRef,
  horizontalListOffsetX,
  isHorizontalListScrollingX,
  activeTabIndex,
  prevActiveTabIndex,
}) => {
  const tabWidths = useSharedValue<number[]>(new Array(tabs.length).fill(0));
  const tabOffsets = useSharedValue<number[]>(new Array(tabs.length).fill(0));

  const tabsListRef = useRef<FlatList>(null);

  const tabsListOffsetX = useSharedValue(0);

  // scroll handler for the tab list to update the scroll position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      tabsListOffsetX.value = event.contentOffset.x;
    },
  });

  const _renderItem = ({ item, index }: { item: Tab; index: number }) => (
    <View
      className=" flex-1 items-center justify-center"
      style={{ width: _homePostsListWidth / tabs.length }}
    >
      <TabItem
        index={index}
        label={item.label}
        horizontalListOffsetX={horizontalListOffsetX}
        onPressIn={() => (prevActiveTabIndex.value = activeTabIndex.value)}
        onPressOut={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          activeTabIndex.value = item.value;
          setTimeout(() => {
            prevActiveTabIndex.value = item.value;
          }, 300);
          tabsListRef.current?.scrollToIndex({ index, animated: true });
          horizontalListRef.current?.scrollToIndex({ index, animated: true });
        }}
        onLayout={(event) => {
          const { width, x } = event.nativeEvent.layout;

            // update the tabWidths shared value with the width of the current tab
          tabWidths.modify((value) => {
            "worklet";
            value[index] = width;
            return value;
          });

           // update the tabOffsets shared value with the horizontal position of the current tab
          tabOffsets.modify((value) => {
            "worklet";
            value[index] = x + (_homePostsListWidth / tabs.length) * index;
            return value;
          });
        }}
      />
    </View>
  );

  return (
    <View className="">
      <TabIndicator
        activeTabIndex={activeTabIndex}
        tabBarOffsetX={tabsListOffsetX}
        tabWidths={tabWidths}
        tabOffsets={tabOffsets}
        horizontalListOffsetX={horizontalListOffsetX}
        isHorizontalListScrollingX={isHorizontalListScrollingX}
      />
      <Animated.FlatList
        ref={tabsListRef}
        data={tabs}
        keyExtractor={(item) => item.value.toString()}
        renderItem={_renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={1000 / 60}
        bounces={false}
      />
    </View>
  );
};
