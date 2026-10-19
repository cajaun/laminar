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
  getCachedCursorDisplayValues,
  getCursorDisplayValue,
} from "@/components/morphing-chart/core/model/cursor-values";
import {
  getCachedChartPoints,
  getCachedChartYValues,
} from "@/components/morphing-chart/core/model/series";
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
  const [rangeTransitionFrom, setRangeTransitionFrom] =
    useState<RangeType | null>(null);
  const sourceData = chartData ?? CHART_DATA_BY_SOURCE[source];
  const data = sourceData.chartDataSets[selected];
  const meta = sourceData.rangeMetadata[selected];
  const graphWidth = chartWidth * REFERENCE_GRAPH_EXTENT[selected];
  const points = useMemo(
    () => getCachedChartPoints(data, graphWidth),
    [data, graphWidth],
  );
  const targetYValues = useMemo(() => getCachedChartYValues(data), [data]);
  const {
    animatedFillPath,
    animateTo,
    animatedGraphWidth,
    animatedLinePath,
    rangeSelectionProgress,
  } = useChartMorph({
    initialGraphWidth: graphWidth,
    initialYValues: targetYValues,
    layoutWidth: chartWidth,
    showFill,
  });
  const {
    clearCursor,
    clearCursorReadout,
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
  const numberMode: MorphNumberMode = isScrubbing ? "ticker" : "slots";

  // start chart and readout motion from the same committed range update
  useLayoutEffect(() => {
    const previous = previousSelection.current;
    const rangeChanged = previous.selected !== selected;
    const sourceChanged = previous.source !== source;

    if (!rangeChanged && !sourceChanged) return;

    previousSelection.current = { source, selected };
    animateTo(targetYValues, graphWidth, rangeChanged);

    if (sourceChanged) {
      stopScrubbing();
      clearCursorReadout();
      clearCursor();
    }
  }, [
    animateTo,
    clearCursor,
    clearCursorReadout,
    graphWidth,
    selected,
    source,
    stopScrubbing,
    targetYValues,
  ]);

  const handleRangePress = useCallback(
    (range: RangeType) => {
      if (range === selectedRef.current) return;

      setRangeTransitionFrom(selectedRef.current);
      rangeSelectionProgress.value = 0;
      stopScrubbing();
      clearCursorReadout();
      clearCursor();
      setSelected(range);
    },
    [
      clearCursor,
      clearCursorReadout,
      rangeSelectionProgress,
      stopScrubbing,
    ],
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

      return getCachedCursorDisplayValues(
        selected,
        meta.totalValue,
        points,
        graphWidth,
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
    rangeSelectionProgress,
    rangeTransitionFrom,
    selected,
    slotStartValue,
    tickerValues,
  };
}

export type MorphingChartController = ReturnType<typeof useMorphingChartController>;
