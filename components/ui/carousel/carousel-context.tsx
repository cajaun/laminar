import type React from "react";
import { createContext, useContext } from "react";
import type { FlatList, ViewToken } from "react-native";

export type CarouselItem = number;

export type CarouselContextValue = {
  items: CarouselItem[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  carouselRef: React.RefObject<FlatList<CarouselItem> | null>;
  dotsListRef: React.RefObject<FlatList<number> | null>;
  isDotsPressed: boolean;
  setIsDotsPressed: (value: boolean) => void;
  onViewableItemsChanged: (info: { viewableItems: ViewToken<CarouselItem>[] }) => void;
  onScrollToIndexFailed: () => void;
};

export const CarouselContext = createContext<CarouselContextValue | undefined>(undefined);

export function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a Carousel component");
  }

  return context;
}
