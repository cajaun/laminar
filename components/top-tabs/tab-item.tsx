import React, { FC } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
} from "react-native";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const _defaultColor = "#a3a3a3";
const _activeColor = "#171717";

export const _homePostsListWidth = Dimensions.get("window").width;

export type TabItemProps = {
  index: number;
  label: string;
  horizontalListOffsetX: SharedValue<number>;
  onPressIn: () => void;
  onPressOut: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

export const TabItem: FC<TabItemProps> = ({
  index,
  label,
  horizontalListOffsetX,
  onPressIn,
  onPressOut,
  onLayout,
}) => {
  const rTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        horizontalListOffsetX.value / _homePostsListWidth, // normalized scroll position
        [index - 1, index, index + 1], // interpolation range for adjacent tabs
        [_defaultColor, _activeColor, _defaultColor]
      ),
    };
  });

  return (
    <Pressable
      className="py-2 px-1"
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLayout={onLayout}
    >
      <Animated.Text style={rTextStyle} className="font-semibold text-lg">
        {label}
      </Animated.Text>
    </Pressable>
  );
};
