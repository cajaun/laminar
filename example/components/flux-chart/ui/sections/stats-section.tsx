import React from "react";
import { Text, View } from "react-native";
import { REFERENCE_GRAY } from "@/components/flux-chart/core/model/chart-config";
import { SFIcon } from "@/components/flux-chart/ui/primitives/sf-icon";

type StatsSectionProps = {
  width: number;
};

type StatRowProps = {
  icon: React.ComponentProps<typeof SFIcon>;
  label: string;
  value: string;
  highlighted?: boolean;
};

function StatRow({ icon, label, value, highlighted = false }: StatRowProps) {
  return (
    <View
      className={`h-12 flex-row items-center justify-between px-3 ${
        highlighted ? "rounded-2xl bg-[#F6F7F9]" : ""
      }`}
    >
      <View className="flex-row items-center gap-3">
        <SFIcon {...icon} />
        <Text className="font-sf-medium text-[18px] leading-6 text-[#999999]">
          {label}
        </Text>
      </View>
      <Text className="font-sf-medium text-[18px] leading-6 text-[#222222]">
        {value}
      </Text>
    </View>
  );
}

function StatsSectionComponent({ width }: StatsSectionProps) {
  return (
    <View className="mt-10" style={{ width }}>
      <View className="flex-row items-center gap-4">
        <View className="h-px flex-1 bg-[#F0F0F0]" />
        <Text className="font-sf-bold text-[16px] leading-5 text-[#999999]">
          STATS
        </Text>
        <View className="h-px flex-1 bg-[#F0F0F0]" />
      </View>

      <View className="mt-7 flex-row items-center">
        <View className="flex-1 items-center gap-1">
          <Text className="font-sf-medium text-[20px] leading-6 text-[#999999]">
            Rank
          </Text>
          <Text className="font-sf-bold text-[24px] leading-7 text-[#111318]">
            #76
          </Text>
        </View>
        <View className="h-12 w-px bg-[#F0F0F0]" />
        <View className="flex-1 items-center gap-1">
          <Text className="font-sf-medium text-[20px] leading-6 text-[#999999]">
            Market Cap
          </Text>
          <Text className="font-sf-bold text-[24px] leading-7 text-[#111318]">
            $994.4m
          </Text>
        </View>
      </View>

      <View className="mt-8 gap-1">
        <StatRow
          icon={{
            name: "chart.line.uptrend.xyaxis",
            size: 24,
            color: REFERENCE_GRAY,
            weight: "medium",
            fallback: "⌁",
            fallbackSize: 24,
          }}
          label="24h Volume"
          value="$0"
        />
        <StatRow
          icon={{
            name: "chart.bar",
            size: 24,
            color: REFERENCE_GRAY,
            weight: "medium",
            fallback: "▥",
            fallbackSize: 22,
          }}
          label="Total Supply"
          value="10,633,303,296"
          highlighted
        />
        <StatRow
          icon={{
            name: "chart.pie",
            size: 24,
            color: REFERENCE_GRAY,
            weight: "medium",
            fallback: "◷",
            fallbackSize: 22,
          }}
          label="Circulating Supply"
          value="10,633,303,296"
        />
      </View>

      
    </View>
  );
}

export const StatsSection = React.memo(StatsSectionComponent);
