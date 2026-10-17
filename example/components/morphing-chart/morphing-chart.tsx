import React from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@/helpers/use-header-height";
import type { DataSourceOption, RangeType } from "@/components/morphing-chart/data";
import { ChartArea, useMorphingChartController } from "@/components/morphing-chart/core";
import type { MorphingAsset } from "@/components/morphing-chart/ui";
import {
  AssetHeader,
  MORPHING_ASSET_CONFIG,
  LinksSection,
  OwnedByCard,
  PortfolioSummary,
  PriceOverview,
  StatsSection,
  useMorphingChartTheme,
} from "@/components/morphing-chart/ui";

export type MorphingChartProps = {
  asset?: MorphingAsset;
  initialRange?: RangeType;
  showFill?: boolean;
  source?: DataSourceOption;
};

/** Public chart feature: page composition only; behavior lives in the controller and hooks. */
export function MorphingChart({
  asset = "ethereum",
  initialRange = "1H",
  showFill = false,
  source = "Revenue",
}: MorphingChartProps = {}) {
  const { bottom } = useSafeAreaInsets();
  const theme = useMorphingChartTheme();
  const headerHeight = useHeaderHeight();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(560, Math.max(320, screenWidth - 48));
  const assetConfig = MORPHING_ASSET_CONFIG[asset];
  const chartWidth = screenWidth;
  const {
    animatedGraphWidth,
    cursorIndex,
    cursorScale,
    cursorX,
    cursorY,
    displayValue,
    fadeProgress,
    graphWidth,
    handleRangePress,
    meta,
    morphedYValues,
    panGesture,
    points,
    selected,
  } = useMorphingChartController({
    chartWidth,
    initialRange,
    source,
  });

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: "center",
        backgroundColor: theme.background,
        paddingTop: headerHeight + 8,
        paddingBottom: Math.max(24, bottom + 24),
      }}
    >
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      <AssetHeader asset={asset} width={contentWidth} />
      <PriceOverview
        displayValue={displayValue}
        meta={meta}
        asset={asset}
        priceFractionDigits={assetConfig.priceFractionDigits}
        width={contentWidth}
      />
      <ChartArea
        animatedGraphWidth={animatedGraphWidth}
        chartWidth={chartWidth}
        contentWidth={contentWidth}
        cursorIndex={cursorIndex}
        cursorScale={cursorScale}
        cursorX={cursorX}
        cursorY={cursorY}
        fadeProgress={fadeProgress}
        fillBottomColor={theme.chartLine}
        fillTopColor={theme.chartLine}
        futureLineColor={theme.chartFutureLine}
        graphWidth={graphWidth}
        lineColor={theme.chartLine}
        morphedYValues={morphedYValues}
        onRangeSelect={handleRangePress}
        panGesture={panGesture}
        points={points}
        selected={selected}
        showFill={showFill}
      />
      <PortfolioSummary asset={asset} width={contentWidth} />
      <OwnedByCard asset={asset} width={contentWidth} />
      <LinksSection width={contentWidth} />
      <StatsSection width={contentWidth} />
    </ScrollView>
  );
}
