import React, { FC, PropsWithChildren } from "react";
import { useWindowDimensions,  Platform } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type Props = {
  index: number;
  activeTabIndex: SharedValue<number>;
  prevActiveTabIndex: SharedValue<number>;
  isHorizontalListScrollingX: SharedValue<boolean>;
};

export const ItemContainer: FC<PropsWithChildren<Props>> = ({
  children,
  index,
  activeTabIndex,
  prevActiveTabIndex,
  isHorizontalListScrollingX,
}) => {
  const { width } = useWindowDimensions();

  
  const rContainerStyle = useAnimatedStyle(() => {

     // skip animation logic for Android to avoid potential layout bugs and improve performance
    if (Platform.OS === "android") {
      return {};
    }


    //  if the active tab is more than one index away and this item is not active,
    // hide it by setting opacity to 0 
    //  helps reduce rendering cost on iOS
    if (
      Math.abs(activeTabIndex.value - prevActiveTabIndex.value) > 1 &&
      index !== activeTabIndex.value &&
      !isHorizontalListScrollingX.value
    ) {
      return { };
    }

    return {
      transform: [],
    };
  });

  return (
    <Animated.View
      style={[{ width }, rContainerStyle]}
      className="bg-white "
    >
      {children}
    </Animated.View>
  );
};
