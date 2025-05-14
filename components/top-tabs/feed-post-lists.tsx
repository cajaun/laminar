import React, { FC } from "react";
import { View } from "react-native";
import Animated, { ScrollHandlerProcessed } from "react-native-reanimated";
import { FeedPost } from "./feed-post";



export const FeedPostList = () => {
  const _renderItem = () => {
    return <FeedPost />;
  };

  const _renderItemSeparator = () => {
    return <View className="h-px bg-[#E9EDEF] my-6" />;
  };

  const _renderListHeader = () => {
    return <View className="pt-6" />; 
  };

  return (
    <Animated.FlatList
      data={Array.from({ length: 20 })}
      keyExtractor={(_, index) => index.toString()}
      renderItem={_renderItem}
      ItemSeparatorComponent={_renderItemSeparator}
      ListHeaderComponent={_renderListHeader}
      scrollEventThrottle={1000 / 60}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}

    />
  );
};
