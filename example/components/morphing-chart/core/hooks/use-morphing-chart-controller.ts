import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChartDataBySource,
  DataSourceOption,
  RangeType,
} from "@/components/morphing-chart/data/chart-data";
import { CHART_DATA_BY_SOURCE } from "@/components/morphing-chart/data/chart-data";
import {
  REFERENCE_GRAPH_EXTENT,
} from "@/components/morphing-chart/core/model/chart-config";
import { getCursorDisplayValue } from "@/components/morphing-chart/core/model/cursor-values";
import { buildChartPoints, buildChartYValues } from "@/components/morphing-chart/core/model/series";
import { useChartCursor } from "@/components/morphing-chart/core/hooks/use-chart-cursor";
import { useChartMorph } from "@/components/morphing-chart/core/hooks/use-chart-morph";

type UseMorphingChartControllerOptions = {
  chartWidth: number;
  chartData?: ChartDataBySource;
  initialRange?: RangeType;
  source?: DataSourceOption;
};

/** Coordinates the chart's selected range, data model, and specialized hooks. */
export function useMorphingChartController({
  chartWidth,
  chartData,
  initialRange = "1M",
  source = "Revenue",
}: UseMorphingChartControllerOptions) {
  const [selected, setSelected] = useState<RangeType>(initialRange);
  const sourceData = chartData ?? CHART_DATA_BY_SOURCE[source];
  const data = sourceData.chartDataSets[selected];
  const meta = sourceData.rangeMetadata[selected];
  const graphWidth = chartWidth * REFERENCE_GRAPH_EXTENT[selected];
  const points = useMemo(
    () => buildChartPoints(data, graphWidth),
    [data, graphWidth],
  );
  const targetYValues = useMemo(() => buildChartYValues(data), [data]);
  const {
    animateTo,
    animatedGraphWidth,
    morphedYValues,
  } = useChartMorph({
    initialGraphWidth: graphWidth,
    initialYValues: targetYValues,
  });
  const {
    clearCursor,
    cursor,
    cursorIndex,
    cursorScale,
    cursorX,
    cursorY,
    fadeProgress,
    panGesture,
  } = useChartCursor({
    chartWidth,
    graphWidth,
    points,
  });
  const previousSource = useRef(source);

  useEffect(() => {
    if (previousSource.current === source) return;

    animateTo(targetYValues, graphWidth);
    clearCursor();
    previousSource.current = source;
  }, [animateTo, clearCursor, graphWidth, source, targetYValues]);

  const handleRangePress = useCallback(
    (range: RangeType) => {
      if (range !== selected) {
        animateTo(
          buildChartYValues(sourceData.chartDataSets[range]),
          chartWidth * REFERENCE_GRAPH_EXTENT[range],
        );
      }

      clearCursor();
      setSelected(range);
    },
    [
      animateTo,
      chartWidth,
      clearCursor,
      selected,
      sourceData.chartDataSets,
    ],
  );

  const displayValue = getCursorDisplayValue(
    selected,
    meta.totalValue,
    cursor,
    graphWidth,
  );

  return {
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
  };
}

export type MorphingChartController = ReturnType<typeof useMorphingChartController>;
