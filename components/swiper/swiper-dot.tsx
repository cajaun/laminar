import React, { type FC } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";



const DOT_SIZE = 6;
const DOT_GAP = 4;
const DOT_CONTAINER_WIDTH = DOT_SIZE + DOT_GAP;

interface CarouselDotProps {
  index: number;
  listOffsetX: SharedValue<number>;
  isActive: boolean;
  totalImages: number;
  defaultDotColor: string;
  activeDotColor: string;
}

export const CarouselDot: FC<CarouselDotProps> = ({
  index,
  listOffsetX,
  defaultDotColor,
  isActive,
  totalImages,
  activeDotColor,
}) => {
  const rDotStyle = useAnimatedStyle(() => {
    if (totalImages < 6) {
      return {
        opacity: 1,
        transform: [
          {
            scale: 1,
          },
        ],
      };
    }

    const hideDot =
      index === 0 || index === 1 || index === totalImages + 2 || index === totalImages + 3;

    const scale = interpolate(
      DOT_CONTAINER_WIDTH * index - listOffsetX.value,
      [
        0,
        DOT_CONTAINER_WIDTH,
        DOT_CONTAINER_WIDTH * 2,
        DOT_CONTAINER_WIDTH * 3,
        DOT_CONTAINER_WIDTH * 4,
        DOT_CONTAINER_WIDTH * 5,
        DOT_CONTAINER_WIDTH * 6,
      ],
      [0.3, 0.7, 1, 1, 1, 0.7, 0.3],
      Extrapolation.CLAMP
    );

    return {
      opacity: hideDot ? 0 : 1,
      transform: [
        {
          scale,
        },
      ],
    };
  });

  return (
    <View className="items-center justify-center" style={styles.dotContainer}>
      <Animated.View
        style={[
          styles.dot,
          rDotStyle,
          { backgroundColor: isActive ? activeDotColor : defaultDotColor },
        ]}
        className="rounded-full"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dotContainer: {
    width: DOT_CONTAINER_WIDTH,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
  },
});

export { DOT_SIZE, DOT_GAP, DOT_CONTAINER_WIDTH };


