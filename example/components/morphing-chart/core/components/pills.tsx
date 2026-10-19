import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import type { RangeType } from "@/components/morphing-chart/data/chart-data";
import { useMorphingChartTheme } from "@/components/morphing-chart/ui/morphing-chart-theme";

const RANGES: RangeType[] = ["1H", "1D", "1W", "1M", "1Y"];

type PillsProps = {
  width?: number;
  selected: RangeType;
  transitionFrom: RangeType | null;
  transitionProgress: SharedValue<number>;
  onSelect: (range: RangeType, index: number) => void;
};

type RangePillProps = {
  index: number;
  range: RangeType;
  selectedIndex: number;
  fromIndex: number;
  transitionProgress: SharedValue<number>;
  onSelect: (range: RangeType, index: number) => void;
};

const RangePill = React.memo(function RangePill({
  index,
  range,
  selectedIndex,
  fromIndex,
  transitionProgress,
  onSelect,
}: RangePillProps) {
  const theme = useMorphingChartTheme();

  const selectionStyle = useAnimatedStyle(
    () => {
      const activeProgress =
        index === selectedIndex
          ? transitionProgress.value
          : index === fromIndex
            ? 1 - transitionProgress.value
            : 0;

      return {
        opacity: activeProgress,
        transform: [{ scale: activeProgress }],
      };
    },
    [fromIndex, index, selectedIndex],
  );
  const labelStyle = useAnimatedStyle(
    () => {
      const activeProgress =
        index === selectedIndex
          ? transitionProgress.value
          : index === fromIndex
            ? 1 - transitionProgress.value
            : 0;

      return {
        color: interpolateColor(
          activeProgress,
          [0, 1],
          [theme.secondary, theme.primary],
        ),
      };
    },
    [fromIndex, index, selectedIndex, theme.primary, theme.secondary],
  );

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: index === selectedIndex }}
      hitSlop={8}
      onPress={() => onSelect(range, index)}
      className="h-8.5 w-8.5 items-center justify-center rounded-full"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Animated.View
        pointerEvents="none"
        className="absolute inset-0 rounded-full"
        style={[{ backgroundColor: theme.selectedRange }, selectionStyle]}
      />
      <Animated.Text
        className="font-sf-semibold text-[16px] leading-4.75"
        style={labelStyle}
      >
        {range}
      </Animated.Text>
    </Pressable>
  );
});

function PillsComponent({
  width,
  selected,
  transitionFrom,
  transitionProgress,
  onSelect,
}: PillsProps) {
  const selectedIndex = RANGES.indexOf(selected);
  const fromIndex = transitionFrom ? RANGES.indexOf(transitionFrom) : -1;

  return (
    <View
      className="flex-row items-center justify-between bg-transparent px-1"
      style={width ? { width } : undefined}
      accessibilityRole="tablist"
    >
      {RANGES.map((range, index) => (
        <RangePill
          key={range}
          index={index}
          range={range}
          selectedIndex={selectedIndex}
          fromIndex={fromIndex}
          transitionProgress={transitionProgress}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

export const Pills = React.memo(PillsComponent);
