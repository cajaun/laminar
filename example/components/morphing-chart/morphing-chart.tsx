import React from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@/helpers/use-header-height";
import type { DataSourceOption, RangeType } from "@/components/morphing-chart/data";
import { ChartArea } from "@/components/morphing-chart/core/components/chart-area";
import { useMorphingChartController } from "@/components/morphing-chart/core/hooks/use-morphing-chart-controller";
import type { MorphingAsset } from "@/components/morphing-chart/ui/assets/asset-config";
import { MORPHING_ASSET_CONFIG } from "@/components/morphing-chart/ui/assets/asset-config";
import { AssetHeader } from "@/components/morphing-chart/ui/sections/asset-header";
import { LinksSection } from "@/components/morphing-chart/ui/sections/links-section";
import { OwnedByCard } from "@/components/morphing-chart/ui/sections/owned-by-card";
import { PortfolioSummary } from "@/components/morphing-chart/ui/sections/portfolio-summary";
import { PriceOverview } from "@/components/morphing-chart/ui/sections/price-overview";
import { StatsSection } from "@/components/morphing-chart/ui/sections/stats-section";
import { useMorphingChartTheme } from "@/components/morphing-chart/ui/morphing-chart-theme";

export type MorphingChartProps = {
  asset?: MorphingAsset;
  initialRange?: RangeType;
  showFill?: boolean;
  source?: DataSourceOption;
};

type IdleRuntime = typeof globalThis & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

// schedule detail work after the navigation transition
function scheduleIdle(callback: () => void): () => void {
  const runtime = globalThis as IdleRuntime;

  if (!runtime.requestIdleCallback) {
    return () => {};
  }

  const handle = runtime.requestIdleCallback(callback, { timeout: 500 });

  return () => runtime.cancelIdleCallback?.(handle);
}

// compose the chart page from the controller and detail sections
export function MorphingChart({
  asset = "ethereum",
  initialRange = "1H",
  showFill = false,
  source = "Revenue",
}: MorphingChartProps = {}) {
  const [detailsReady, setDetailsReady] = React.useState(false);
  const { bottom } = useSafeAreaInsets();
  const theme = useMorphingChartTheme();
  const headerHeight = useHeaderHeight();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(560, Math.max(320, screenWidth - 48));
  const assetConfig = MORPHING_ASSET_CONFIG[asset];
  const chartWidth = screenWidth;

  React.useEffect(() => {
    // mount static detail sections in one idle commit
    return scheduleIdle(() => setDetailsReady(true));
  }, []);

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
      <MorphingChartInteractive
        asset={asset}
        chartWidth={chartWidth}
        contentWidth={contentWidth}
        initialRange={initialRange}
        priceFractionDigits={assetConfig.priceFractionDigits}
        showFill={showFill}
        source={source}
      />
      {detailsReady ? (
        <PortfolioSummary asset={asset} width={contentWidth} />
      ) : null}
      {detailsReady ? (
        <OwnedByCard asset={asset} width={contentWidth} />
      ) : null}
      {detailsReady ? <LinksSection width={contentWidth} /> : null}
      {detailsReady ? <StatsSection width={contentWidth} /> : null}
    </ScrollView>
  );
}

type MorphingChartInteractiveProps = {
  asset: MorphingAsset;
  chartWidth: number;
  contentWidth: number;
  initialRange: RangeType;
  priceFractionDigits: number;
  showFill: boolean;
  source: DataSourceOption;
};

// keep high frequency chart state below the page shell
const MorphingChartInteractive = React.memo(function MorphingChartInteractive({
  asset,
  chartWidth,
  contentWidth,
  initialRange,
  priceFractionDigits,
  showFill,
  source,
}: MorphingChartInteractiveProps) {
  const theme = useMorphingChartTheme();
  const {
    animatedFillPath,
    animatedGraphWidth,
    animatedLinePath,
    cursorIndexShared,
    cursorScale,
    cursorX,
    cursorY,
    cursorLabels,
    displayValue,
    fadeProgress,
    handleRangePress,
    meta,
    numberMode,
    panGesture,
    selected,
    slotStartValue,
    tickerValues,
  } = useMorphingChartController({
    chartWidth,
    initialRange,
    showFill,
    source,
  });

  return (
    <>
      <PriceOverview
        cursorIndexShared={cursorIndexShared}
        displayValue={displayValue}
        meta={meta}
        asset={asset}
        numberMode={numberMode}
        priceFractionDigits={priceFractionDigits}
        slotStartValue={slotStartValue}
        tickerValues={tickerValues}
        width={contentWidth}
      />
      <ChartArea
        animatedFillPath={animatedFillPath}
        animatedGraphWidth={animatedGraphWidth}
        animatedLinePath={animatedLinePath}
        chartWidth={chartWidth}
        contentWidth={contentWidth}
        cursorIndexShared={cursorIndexShared}
        cursorLabels={cursorLabels}
        cursorScale={cursorScale}
        cursorX={cursorX}
        cursorY={cursorY}
        fadeProgress={fadeProgress}
        fillBottomColor={theme.chartLine}
        fillTopColor={theme.chartLine}
        futureLineColor={theme.chartFutureLine}
        lineColor={theme.chartLine}
        onRangeSelect={handleRangePress}
        panGesture={panGesture}
        selected={selected}
        showFill={showFill}
      />
    </>
  );
});
