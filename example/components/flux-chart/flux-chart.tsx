import React from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@/helpers/use-header-height";
import type { DataSourceOption, RangeType } from "@/components/flux-chart/data";
import { ChartArea, useFluxChartController } from "@/components/flux-chart/core";
import type { FluxAsset } from "@/components/flux-chart/ui";
import {
  AssetHeader,
  FLUX_ASSET_CONFIG,
  LinksSection,
  OwnedByCard,
  PortfolioSummary,
  PriceOverview,
  StatsSection,
} from "@/components/flux-chart/ui";

export type FluxChartProps = {
  asset?: FluxAsset;
  initialRange?: RangeType;
  showFill?: boolean;
  source?: DataSourceOption;
};

/** Public chart feature: page composition only; behavior lives in the controller and hooks. */
export function FluxChart({
  asset = "ethereum",
  initialRange = "1H",
  showFill = false,
  source = "Revenue",
}: FluxChartProps = {}) {
  const { bottom } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(560, Math.max(320, screenWidth - 48));
  const assetConfig = FLUX_ASSET_CONFIG[asset];
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
  } = useFluxChartController({
    chartWidth,
    initialRange,
    source,
  });

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingTop: headerHeight + 8,
        paddingBottom: Math.max(24, bottom + 24),
      }}
    >
      <StatusBar style="dark" />

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
        fillBottomColor={assetConfig.fillBottomColor}
        fillTopColor={assetConfig.fillTopColor}
        futureLineColor={assetConfig.futureLineColor}
        graphWidth={graphWidth}
        lineColor={assetConfig.lineColor}
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
