import React from "react";
import { Text, View } from "react-native";
import { REFERENCE_GRAY } from "@/components/morphing-chart/core/model/chart-config";
import { SFIcon } from "@/components/morphing-chart/ui/primitives/sf-icon";
import { useMorphingChartTheme } from "@/components/morphing-chart/ui/morphing-chart-theme";

type StatsSectionProps = {
  width: number;
};

type StatRowProps = {
  icon: React.ComponentProps<typeof SFIcon>;
  label: string;
  value: string;
  highlighted?: boolean;
  theme: ReturnType<typeof useMorphingChartTheme>;
};

function StatRow({ icon, label, value, highlighted = false, theme }: StatRowProps) {
  return (
    <View
      className={`h-12 flex-row items-center justify-between px-3 ${
        highlighted ? "rounded-2xl" : ""
      }`}
      style={highlighted ? { backgroundColor: theme.section } : undefined}
    >
      <View className="flex-row items-center gap-3">
        <SFIcon {...icon} />
        <Text
          className="font-sf-medium text-[18px] leading-6"
          style={{ color: theme.secondary }}
        >
          {label}
        </Text>
      </View>
      <Text
        className="font-sf-medium text-[18px] leading-6"
        style={{ color: theme.primary }}
      >
        {value}
      </Text>
    </View>
  );
}

function StatsSectionComponent({ width }: StatsSectionProps) {
  const theme = useMorphingChartTheme();

  return (
    <View className="mt-10" style={{ width }}>
      <View className="flex-row items-center gap-4">
        <View className="h-px flex-1" style={{ backgroundColor: theme.divider }} />
        <Text
          className="font-sf-semibold text-[16px] leading-5"
          style={{ color: theme.secondary }}
        >
          STATS
        </Text>
        <View className="h-px flex-1" style={{ backgroundColor: theme.divider }} />
      </View>

      <View className="mt-7 flex-row items-center">
        <View className="flex-1 items-center gap-1">
          <Text
            className="font-sf-medium text-[20px] leading-6"
            style={{ color: theme.secondary }}
          >
            Rank
          </Text>
          <Text
            className="font-sf-semibold text-[24px] leading-7"
            style={{ color: theme.primary }}
          >
            #76
          </Text>
        </View>
        <View className="h-12 w-px" style={{ backgroundColor: theme.divider }} />
        <View className="flex-1 items-center gap-1">
          <Text
            className="font-sf-medium text-[20px] leading-6"
            style={{ color: theme.secondary }}
          >
            Market Cap
          </Text>
          <Text
            className="font-sf-semibold text-[24px] leading-7"
            style={{ color: theme.primary }}
          >
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
          theme={theme}
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
          theme={theme}
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
          theme={theme}
        />
      </View>

      
    </View>
  );
}

export const StatsSection = React.memo(StatsSectionComponent);
