import React, { FC } from "react";
import { LayoutChangeEvent, Pressable } from "react-native";
import Reanimated, {
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type Props = {
  index: number;
  tabName: string;
  indexDecimal: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

export const TabItem: FC<Props> = ({
  index,
  tabName,
  indexDecimal,
  activeColor,
  inactiveColor,
  onPress,
  onLayout,
}) => {
  const rTextStyle = useAnimatedStyle(() => {
    const progress = Math.min(
      Math.max(indexDecimal.value, index - 1),
      index + 1,
    );

    return {
      color: interpolateColor(
        progress,
        [index - 1, index, index + 1],
        [inactiveColor, activeColor, inactiveColor],
      ),
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      accessibilityRole="tab"
      style={styles.tab}
    >
      <Reanimated.Text style={[styles.text, rTextStyle]}>
        {tabName}
      </Reanimated.Text>
    </Pressable>
  );
};

const styles = {
  tab: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderCurve: "continuous" as const,
    zIndex: 2,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Sf-medium",
  },
};
