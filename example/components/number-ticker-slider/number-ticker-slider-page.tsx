import React from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { DemoPageProps } from "@/components/morph-demo/demo-pages/types";
import { useDemoTheme } from "@/components/morph-demo/demo-theme";
import { useNumberTickerSlider } from "./core";
import {
  EarningsSummary,
  GrowthChart,
  InitialDeposit,
  getNumberTickerSliderColors,
} from "./ui";

function NumberTickerSliderPage({ height, width }: DemoPageProps) {
  const theme = useDemoTheme();
  const colors = getNumberTickerSliderColors(theme.isDark, theme.background);
  const { progress, store } = useNumberTickerSlider();
  const horizontalInset = Math.min(32, Math.max(24, width * 0.082));
  const contentWidth = Math.max(0, width - horizontalInset * 2);
  const chartHeight = Math.min(242, Math.max(188, height * 0.27));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingBottom: 12,
        justifyContent: "space-between",
      }}
    >
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <EarningsSummary
        store={store}
        width={contentWidth}
        isDark={theme.isDark}
        secondaryColor={colors.secondary}
      />

      <View style={{ width: contentWidth, alignSelf: "center" }}>
        <GrowthChart
          width={contentWidth}
          height={chartHeight}
          axisColor={colors.secondary}
          isDark={theme.isDark}
        />
      </View>

      <InitialDeposit
        progress={progress}
        contentWidth={contentWidth}
        horizontalInset={horizontalInset}
        primaryColor={colors.primary}
        secondaryColor={colors.secondary}
        accentColor={colors.accent}
        trackColor={colors.track}
      />
    </View>
  );
}

export const NumberTickerSliderDemoPage = React.memo(NumberTickerSliderPage);
