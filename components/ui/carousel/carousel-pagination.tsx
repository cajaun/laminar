import * as Haptics from "expo-haptics";
import type { FC } from "react";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { CarouselDot, DOT_CONTAINER_WIDTH } from "./carousel-dot";
import { useCarousel } from "./carousel-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const _containerDefaultBgColor = "rgba(255,255,255,0)";
const _containerPressedBgColor = "rgba(255,255,255,0.1)";

interface CarouselPaginationProps {
  defaultDotColor?: string;
  activeDotColor?: string;
}

export const CarouselPagination: FC<CarouselPaginationProps> = ({
  defaultDotColor = "#525252",
  activeDotColor = "#3b82f6",
}) => {
  const {
    items,
    currentIndex,
    setCurrentIndex,
    carouselRef,
    dotsListRef,
    isDotsPressed,
    setIsDotsPressed,
  } = useCarousel();

  const listOffsetX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      listOffsetX.value = event.contentOffset.x;
    },
  });

  const translateXStep = items.length > 10 ? 12 : 15;
  const prevTranslateX = useSharedValue(0);

  const handleImageIndexChange = (action: "increase" | "decrease") => {
    const index = action === "increase" ? currentIndex + 1 : currentIndex - 1;

    if (index < 0 || index >= items.length) {
      return;
    }

    setCurrentIndex(index);

    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (index >= 0 && index < items.length) {
      carouselRef.current?.scrollToIndex({
        animated: false,
        index,
      });
    }
  };

  const handleFinalize = () => {
    if (!isDotsPressed) {
      return;
    }

    setIsDotsPressed(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      prevTranslateX.value = 0;
    })
    .onUpdate((event) => {
      if (!isDotsPressed) {
        return;
      }

      const translateX = event.translationX;

      if (translateX - prevTranslateX.value > translateXStep) {
        scheduleOnRN(handleImageIndexChange, "increase");
        prevTranslateX.value = translateX;
      }

      if (translateX - prevTranslateX.value < -translateXStep) {
        scheduleOnRN(handleImageIndexChange, "decrease");
        prevTranslateX.value = translateX;
      }
    })
    .onFinalize(() => {
      scheduleOnRN(handleFinalize);
    });

  const rContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        isDotsPressed ? _containerPressedBgColor : _containerDefaultBgColor,
        { duration: 150 }
      ),
    };
  });

  if (items.length <= 1) {
    return null;
  }

  return (
    <GestureDetector gesture={gesture}>
      <AnimatedPressable
        style={[styles.container, rContainerStyle]}
        onLongPress={() => {
          setIsDotsPressed(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        delayLongPress={200}
      >
        <View
          style={{
            width: DOT_CONTAINER_WIDTH * (items.length > 5 ? 7 : items.length),
          }}
        >
          <Animated.FlatList
            ref={dotsListRef}
            data={Array.from({
              length: items.length > 5 ? items.length + 4 : items.length,
            }).map((_, index) => index)}
            keyExtractor={(item) => String(item)}
            renderItem={({ item }) => (
              <CarouselDot
                index={item}
                listOffsetX={listOffsetX}
                isActive={items.length > 5 ? item === currentIndex + 2 : item === currentIndex}
                totalImages={items.length}
                defaultDotColor={defaultDotColor}
                activeDotColor={activeDotColor}
              />
            )}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          />
        </View>
      </AnimatedPressable>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 999,
    borderCurve: "continuous",
  },
});
