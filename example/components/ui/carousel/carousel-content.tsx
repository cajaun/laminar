import React, { type FC } from "react";
import { FlatList, type ListRenderItem, View } from "react-native";
import { type CarouselItem, useCarousel } from "./carousel-context";

type Props = {
  renderItem: ListRenderItem<CarouselItem>;
  width: number;
};

export const CarouselContent: FC<Props> = ({ renderItem, width }) => {
  const { items, carouselRef, onViewableItemsChanged, onScrollToIndexFailed } = useCarousel();

  return (
    <View style={{ width, flex: 1 }}>
      <FlatList
        ref={carouselRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item)}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        viewabilityConfig={{
          itemVisiblePercentThreshold: 55,
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
    </View>
  );
};
