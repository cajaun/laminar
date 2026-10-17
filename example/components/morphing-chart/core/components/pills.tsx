import React from "react";
import { Pressable, Text, View } from "react-native";
import type { RangeType } from "@/components/morphing-chart/data/chart-data";
import { useMorphingChartTheme } from "@/components/morphing-chart/ui/morphing-chart-theme";

const RANGES: RangeType[] = ["1H", "1D", "1W", "1M", "1Y"];

type PillsProps = {
  width?: number;
  selected: RangeType;
  onSelect: (range: RangeType, index: number) => void;
};

function PillsComponent({ width, selected, onSelect }: PillsProps) {
  const theme = useMorphingChartTheme();
  return (
    <View
      className="flex-row items-center justify-between bg-transparent px-1"
      style={width ? { width } : undefined}
      accessibilityRole="tablist"
    >
      {RANGES.map((range, index) => {
        const isSelected = range === selected;

        return (
          <Pressable
            key={range}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(range, index)}
            className="h-8.5 w-8.5 items-center justify-center rounded-full"
            style={({ pressed }) => ({
              backgroundColor: isSelected ? theme.selectedRange : "transparent",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              className="font-sf-semibold text-[16px] leading-4.75"
              style={{ color: isSelected ? theme.primary : theme.secondary }}
            >
              {range}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const Pills = React.memo(PillsComponent);
