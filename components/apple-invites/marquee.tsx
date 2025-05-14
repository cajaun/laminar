import React, { FC, memo } from "react";
import { View } from "react-native";
import { _itemWidth, MarqueeItem } from "./marquee-item";
import {
  Easing,
  SharedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";


const _defaultScrollSpeed = 40; // Units per second

type Props = {
  events: any[];
  scrollOffsetX: SharedValue<number>;
};

const MarqueeComponent: FC<Props> = ({ events, scrollOffsetX }) => {
  const scrollSpeed = useSharedValue(_defaultScrollSpeed);

  const allItemsWidth = events.length * _itemWidth;

  useFrameCallback((frameInfo) => {
    // deltaSeconds is important to handle different device frame rates (30, 60, 120 etc.)
    const deltaSeconds = (frameInfo?.timeSincePreviousFrame ?? 0) / 1000;
    scrollOffsetX.value += scrollSpeed.value * deltaSeconds;
  });

  const gesture = Gesture.Pan()
    .onBegin(() => {
      scrollSpeed.value = 0;
    })
    .onChange((event) => {
      scrollOffsetX.value -= event.changeX;
    })
    .onFinalize((event) => {
      scrollSpeed.value = -event.velocityX;
      scrollSpeed.value = withTiming(_defaultScrollSpeed, {
        duration: 1000,
        easing: Easing.out(Easing.quad),
      });
    });

  return (
    <GestureDetector gesture={gesture}>
      <View className="h-full flex-row ">
        {events.map((event, index) => (
          <MarqueeItem
            key={event.id}
            imageSrc={event.image}
            title={event.title}
            description={event.description}
            index={index}
            scrollOffsetX={scrollOffsetX}
            allItemsWidth={allItemsWidth}
          />
        ))}
      </View>
    </GestureDetector>
  );
};

export const Marquee = memo(MarqueeComponent);


