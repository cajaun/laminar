import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { FlatList, View, type ViewToken } from "react-native";
import { CarouselContext, CarouselImage } from "./swiper-context";


export interface CarouselProps extends PropsWithChildren {
  images: CarouselImage[];
  className?: string;
}

export function Carousel({ images, children, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDotsPressed, setIsDotsPressed] = useState(false);
  const [viewableItems, setViewableItems] = useState<
    ViewToken<CarouselImage>[]
  >([]);

  const carouselRef = useRef<FlatList<CarouselImage>>(null);
  const dotsListRef = useRef<FlatList<string>>(null);
  const refIndex = useRef(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<CarouselImage>[] }) => {
      setViewableItems(viewableItems);

      if (viewableItems.length > 0) {
        const currentIndex = viewableItems[0].index ?? 0;

        if (!isDotsPressed) {
          setCurrentIndex(currentIndex);
        }

        if (currentIndex - refIndex.current > 2) {
          refIndex.current = currentIndex - 2;
          dotsListRef.current?.scrollToIndex({
            animated: true,
            index: currentIndex - 2,
          });
        }

        if (currentIndex - refIndex.current < 0) {
          refIndex.current = currentIndex;
          dotsListRef.current?.scrollToIndex({
            animated: true,
            index: currentIndex,
          });
        }
      }
    },
    [isDotsPressed]
  );

  const onScrollToIndexFailed = useCallback(() => {
    carouselRef.current?.scrollToIndex({
      animated: false,
      index: currentIndex,
    });
  }, [currentIndex]);

  const value = {
    images,
    currentIndex,
    setCurrentIndex,
    carouselRef,
    dotsListRef,
    isDotsPressed,
    setIsDotsPressed,
    onViewableItemsChanged,
    onScrollToIndexFailed,
    viewableItems,
  };

  return (
    <CarouselContext.Provider value={value}>
      <View className={className}>{children}</View>
    </CarouselContext.Provider>
  );
}

export { useCarousel } from "./swiper-context";
export type { CarouselImage } from "./swiper-context";
export { CarouselContent } from "./swiper-content";
export { CarouselPagination } from "./swiper-pagination";


