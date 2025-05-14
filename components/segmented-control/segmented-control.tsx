import React, { FC } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const _padding = 3;

type TabItemType = {
  key: string;
  label: string;
};

type TabItemProps = {
  title: string;
  active: boolean;
  onPress: () => void;
};

const TabItem: FC<TabItemProps> = ({ title, active, onPress }) => {

  // animated style for the tab text, changing color based on active state
  const rTextStyle = useAnimatedStyle(() => ({
    color: withTiming(active ? "#000000" : "#000000"),
    // transform: [{ scale: withTiming(active ? 1.05 : 0.95) }],
  }));

  return (
    <Pressable className="flex-1 items-center py-[6px] " onPress={onPress}>
      <Animated.Text className="font-medium" style={rTextStyle}>
        {title}
      </Animated.Text>
    </Pressable>
  );
};

type Props = {
  tabs: TabItemType[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
};

export const SegmentedControl: FC<Props> = ({
  tabs,
  activeIndex,
  setActiveIndex,
}) => {

   // shared value for the width of the tabs container (used for indicator calculation)
  const tabsWidth = useSharedValue(0);

  const rIndicatorStyle = useAnimatedStyle(() => {
    const tabCount = tabs.length;
    const tabWidth = (tabsWidth.value - _padding * 2) / tabCount;

    return {
      width: tabWidth, // set the indicator width to match the tab width
      left: withTiming(tabWidth * activeIndex + _padding, { duration: 200 }),
    };
  });

  return (
    <View
      className="rounded-lg bg-[#E3E2EA]  flex-row items-center relative"
      style={{ padding: _padding }}
      onLayout={(e) => (tabsWidth.value = e.nativeEvent.layout.width)}
    >
      <Animated.View
        className="absolute rounded-lg bg-white shadow-sm "
        style={[rIndicatorStyle, { top: _padding, bottom: _padding }]}
      />
      {tabs.map((tab, index) => (
        <TabItem
          key={tab.key}
          title={tab.label}
          active={index === activeIndex}
          onPress={() => setActiveIndex(index)}
        />
      ))}
    </View>
  );
};
