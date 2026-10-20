import { useCallback, useRef } from "react";
import { usePathValue, type SkPath } from "@shopify/react-native-skia";
import {
  Easing,
  runOnUI,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CHART_MORPH_DURATION } from "@/components/morphing-chart/core/model/chart-config";
import {
  createFillPath,
  createLinePath,
  writeFillPath,
  writeLinePath,
} from "@/components/morphing-chart/core/rendering/path-writers";
import type { RangeType } from "@/components/morphing-chart/data/chart-data";

type UseChartMorphOptions = {
  initialYValues: number[];
  initialGraphWidth: number;
  initialRange: RangeType;
  layoutWidth: number;
  showFill?: boolean;
};

// keep chart range morph state on the ui thread
export function useChartMorph({
  initialYValues,
  initialGraphWidth,
  initialRange,
  layoutWidth,
  showFill = false,
}: UseChartMorphOptions) {
  // store initial geometry in refs so range presses avoid js path rebuilds
  const initialPathsRef = useRef<{
    layoutWidth: number;
    line: SkPath;
    fill: SkPath;
  } | null>(null);

  if (
    initialPathsRef.current === null ||
    initialPathsRef.current.layoutWidth !== layoutWidth
  ) {
    initialPathsRef.current = {
      layoutWidth,
      line: createLinePath(initialYValues, initialGraphWidth),
      fill: createFillPath(initialYValues, initialGraphWidth),
    };
  }

  const initialLinePath = initialPathsRef.current.line;
  const initialFillPath = initialPathsRef.current.fill;
  const morphFromLinePath = useSharedValue(initialLinePath);
  const morphToLinePath = useSharedValue(initialLinePath);
  const morphFromFillPath = useSharedValue(initialFillPath);
  const morphToFillPath = useSharedValue(initialFillPath);
  const morphProgress = useSharedValue(1);
  const rangeSelectionProgress = useSharedValue(1);
  const rangeTransitionFrom = useSharedValue(initialRange);
  const rangeTransitionTo = useSharedValue(initialRange);
  const graphWidthFrom = useSharedValue(initialGraphWidth);
  const graphWidthTo = useSharedValue(initialGraphWidth);

  const animatedLinePath = usePathValue((path) => {
    "worklet";

    morphToLinePath.value.interpolate(
      morphFromLinePath.value,
      morphProgress.value,
      path,
    );
  });
  const animatedFillPath = usePathValue((path) => {
    "worklet";

    if (!showFill) {
      path.reset();
      return;
    }

    morphToFillPath.value.interpolate(
      morphFromFillPath.value,
      morphProgress.value,
      path,
    );
  });

  // animate line geometry and horizontal reveal from one clock
  const animatedGraphWidth = useDerivedValue(() => {
    return (
      graphWidthFrom.value +
      (graphWidthTo.value - graphWidthFrom.value) * morphProgress.value
    );
  });

  const animateTo = useCallback(
    (
      nextYValues: number[],
      nextGraphWidth: number,
      animateRangeSelection: boolean,
      rangeTransition?: { from: RangeType; to: RangeType },
    ) => {
      runOnUI(
        (
          nextValues: readonly number[],
          toWidth: number,
          animateRangeSelection: boolean,
          rangeTransition?: { from: RangeType; to: RangeType },
        ) => {
          "worklet";

          const currentProgress = morphProgress.value;
          const currentLinePath = morphToLinePath.value.interpolate(
            morphFromLinePath.value,
            currentProgress,
          );
          const currentFillPath = morphToFillPath.value.interpolate(
            morphFromFillPath.value,
            currentProgress,
          );
          const currentGraphWidth =
            graphWidthFrom.value +
            (graphWidthTo.value - graphWidthFrom.value) * currentProgress;

          if (currentLinePath) morphFromLinePath.value = currentLinePath;
          if (currentFillPath) morphFromFillPath.value = currentFillPath;
          // build the target path on the ui thread
          morphToLinePath.value.reset();
          writeLinePath(morphToLinePath.value, nextValues, toWidth);
          morphToFillPath.value.reset();
          writeFillPath(morphToFillPath.value, nextValues, toWidth);
          graphWidthFrom.value = currentGraphWidth;
          graphWidthTo.value = toWidth;
          morphProgress.value = 0;
          const transition = {
            duration: CHART_MORPH_DURATION,
            easing: Easing.out(Easing.cubic),
          };
          morphProgress.value = withTiming(1, transition);
          if (animateRangeSelection) {
            if (rangeTransition) {
              rangeTransitionFrom.value = rangeTransition.from;
              rangeTransitionTo.value = rangeTransition.to;
            }
            rangeSelectionProgress.value = 0;
            rangeSelectionProgress.value = withTiming(1, transition);
          }
        },
      )(nextYValues, nextGraphWidth, animateRangeSelection, rangeTransition);
    },
    [
      graphWidthFrom,
      graphWidthTo,
      morphFromFillPath,
      morphFromLinePath,
      morphProgress,
      morphToFillPath,
      morphToLinePath,
      rangeTransitionFrom,
      rangeTransitionTo,
      rangeSelectionProgress,
    ],
  );

  return {
    animatedFillPath,
    animatedGraphWidth,
    animatedLinePath,
    animateTo,
    rangeSelectionProgress,
    rangeTransitionFrom,
    rangeTransitionTo,
  };
}

export type ChartMorphState = ReturnType<typeof useChartMorph>;
