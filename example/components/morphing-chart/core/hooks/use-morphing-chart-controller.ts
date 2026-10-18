import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ChartDataBySource,
  DataSourceOption,
  RangeType,
} from "@/components/morphing-chart/data/chart-data";
import { CHART_DATA_BY_SOURCE } from "@/components/morphing-chart/data/chart-data";
import {
  REFERENCE_GRAPH_EXTENT,
} from "@/components/morphing-chart/core/model/chart-config";
import {
  getCursorLabel,
} from "@/components/morphing-chart/core/model/chart-formatters";
import {
  getCursorDisplayValue,
} from "@/components/morphing-chart/core/model/cursor-values";
import { buildChartPoints, buildChartYValues } from "@/components/morphing-chart/core/model/series";
import { useChartCursor } from "@/components/morphing-chart/core/hooks/use-chart-cursor";
import { useChartMorph } from "@/components/morphing-chart/core/hooks/use-chart-morph";
import type { MorphNumberMode } from "react-native-laminar";

const EMPTY_TICKER_VALUES: readonly number[] = [];
const EMPTY_CURSOR_LABELS: readonly string[] = [];

type UseMorphingChartControllerOptions = {
  chartWidth: number;
  chartData?: ChartDataBySource;
  initialRange?: RangeType;
  showFill?: boolean;
  source?: DataSourceOption;
};

// coordinate range data chart motion and cursor state
export function useMorphingChartController({
  chartWidth,
  chartData,
  initialRange = "1M",
  showFill = false,
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
    animatedFillPath,
    animateTo,
    animatedGraphWidth,
    animatedLinePath,
  } = useChartMorph({
    initialGraphWidth: graphWidth,
    initialYValues: targetYValues,
    layoutWidth: chartWidth,
    showFill,
  });
  const {
    clearCursor,
    cursor,
    cursorIndex,
    cursorIndexShared,
    cursorScale,
    cursorX,
    cursorY,
    fadeProgress,
    isScrubbing,
    panGesture,
    releasedCursor,
    stopScrubbing,
  } = useChartCursor({
    chartWidth,
    graphWidth,
    points,
  });
  const previousSelection = useRef({ source, selected });
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const handlerStartedRangeRef = useRef<RangeType | null>(null);
  const numberMode: MorphNumberMode = isScrubbing ? "ticker" : "slots";

  // start chart motion in the press handler before the range state commit
  useLayoutEffect(() => {
    const previous = previousSelection.current;
    const rangeChanged = previous.selected !== selected;
    const sourceChanged = previous.source !== source;

    if (!rangeChanged && !sourceChanged) return;

    previousSelection.current = { source, selected };
    const startedInHandler = handlerStartedRangeRef.current === selected;
    handlerStartedRangeRef.current = null;

    if (!startedInHandler) {
      animateTo(targetYValues, graphWidth);
    }

    if (sourceChanged) {
      stopScrubbing();
      clearCursor();
    }
  }, [
    animateTo,
    clearCursor,
    graphWidth,
    selected,
    source,
    stopScrubbing,
    targetYValues,
  ]);

  const handleRangePress = useCallback(
    (range: RangeType) => {
      if (range === selectedRef.current) return;

      const nextData = sourceData.chartDataSets[range];
      const nextGraphWidth = chartWidth * REFERENCE_GRAPH_EXTENT[range];
      const nextYValues = buildChartYValues(nextData);

      handlerStartedRangeRef.current = range;
      stopScrubbing();
      clearCursor();
      animateTo(nextYValues, nextGraphWidth);
      setSelected(range);
    },
    [animateTo, chartWidth, clearCursor, sourceData, stopScrubbing],
  );

  const displayValue = getCursorDisplayValue(
    selected,
    meta.totalValue,
    cursor,
    graphWidth,
  );
  const slotStartValue = releasedCursor
    ? getCursorDisplayValue(selected, meta.totalValue, releasedCursor, graphWidth)
    : null;
  // prepare ticker values only while scrubbing uses the shared index
  const tickerValues = useMemo(
    () => {
      // skip ticker formatting while slots show the settled state
      if (!isScrubbing) return EMPTY_TICKER_VALUES;

      return points.map((point) =>
        getCursorDisplayValue(selected, meta.totalValue, point, graphWidth),
      );
    },
    [graphWidth, isScrubbing, meta.totalValue, points, selected],
  );
  const cursorLabels = useMemo(
    () => {
      // skip cursor label formatting until the cursor becomes visible
      if (!isScrubbing && cursorIndex === null) return EMPTY_CURSOR_LABELS;

      return points.map((_point, index) =>
        getCursorLabel(selected, index, points.length),
      );
    },
    [cursorIndex, isScrubbing, points, selected],
  );
  return {
    animatedFillPath,
    animatedGraphWidth,
    animatedLinePath,
    cursorIndex,
    cursorIndexShared,
    cursorScale,
    cursorX,
    cursorY,
    cursorLabels,
    displayValue,
    fadeProgress,
    graphWidth,
    handleRangePress,
    meta,
    numberMode,
    panGesture,
    points,
    selected,
    slotStartValue,
    tickerValues,
  };
}

export type MorphingChartController = ReturnType<typeof useMorphingChartController>;
