import React from "react";
import { Pressable, Text, View } from "react-native";
import type { RangeType } from "@/components/flux-chart/data/chart-data";

const RANGES: RangeType[] = ["1H", "1D", "1W", "1M", "1Y"];

type PillsProps = {
  width?: number;
  selected: RangeType;
  onSelect: (range: RangeType, index: number) => void;
};

function PillsComponent({ width, selected, onSelect }: PillsProps) {
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
            className={`h-8.5 w-8.5 items-center justify-center rounded-full ${isSelected ? "bg-[#D9D9D9]" : ""}`}
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
          >
            <Text
              className={`font-sf-semibold text-[16px] leading-4.75 ${isSelected ? "text-black" : "text-[#999999]"}`}
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
