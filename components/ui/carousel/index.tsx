import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { FlatList, View, type ViewToken } from "react-native";
import { CarouselContext, type CarouselItem } from "./carousel-context";

export interface CarouselProps extends PropsWithChildren {
  items: CarouselItem[];
  style?: React.ComponentProps<typeof View>["style"];
}

export function Carousel({ items, children, style }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDotsPressed, setIsDotsPressed] = useState(false);

  const carouselRef = useRef<FlatList<CarouselItem>>(null);
  const dotsListRef = useRef<FlatList<number>>(null);
  const refIndex = useRef(0);
  const isDotsPressedRef = useRef(false);

  const commitCurrentIndex = useCallback((index: number) => {
    setCurrentIndex((current) => (current === index ? current : index));
  }, []);

  const commitDotsPressed = useCallback((value: boolean) => {
    isDotsPressedRef.current = value;
    setIsDotsPressed((current) => (current === value ? current : value));
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<CarouselItem>[] }) => {
      if (viewableItems.length > 0) {
        const currentIndex = viewableItems[0].index ?? 0;

        if (!isDotsPressedRef.current) {
          commitCurrentIndex(currentIndex);
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
    [commitCurrentIndex]
  );

  const onScrollToIndexFailed = useCallback(() => {
    carouselRef.current?.scrollToIndex({
      animated: false,
      index: currentIndex,
    });
  }, [currentIndex]);

  const value = useMemo(
    () => ({
      items,
      currentIndex,
      setCurrentIndex: commitCurrentIndex,
      carouselRef,
      dotsListRef,
      isDotsPressed,
      setIsDotsPressed: commitDotsPressed,
      onViewableItemsChanged,
      onScrollToIndexFailed,
    }),
    [
      commitCurrentIndex,
      commitDotsPressed,
      currentIndex,
      isDotsPressed,
      items,
      onScrollToIndexFailed,
      onViewableItemsChanged,
    ]
  );

  return (
    <CarouselContext.Provider value={value}>
      <View style={style}>{children}</View>
    </CarouselContext.Provider>
  );
}

export { useCarousel } from "./carousel-context";
export type { CarouselItem } from "./carousel-context";
export { CarouselContent } from "./carousel-content";
export { CarouselPagination } from "./carousel-pagination";
