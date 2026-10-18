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

type UseChartMorphOptions = {
  initialYValues: number[];
  initialGraphWidth: number;
  layoutWidth: number;
  showFill?: boolean;
};

// own ui thread state for chart range morphs
export function useChartMorph({
  initialYValues,
  initialGraphWidth,
  layoutWidth,
  showFill = false,
}: UseChartMorphOptions) {
  // keep initial geometry in refs so range presses avoid js path rebuilds
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

  // drive line geometry and horizontal reveal from one clock
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
    ) => {
      runOnUI(
        (
          nextValues: readonly number[],
          toWidth: number,
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
          morphProgress.value = withTiming(1, {
            duration: CHART_MORPH_DURATION,
            easing: Easing.out(Easing.cubic),
          });
        },
      )(nextYValues, nextGraphWidth);
    },
    [
      graphWidthFrom,
      graphWidthTo,
      morphFromFillPath,
      morphFromLinePath,
      morphProgress,
      morphToFillPath,
      morphToLinePath,
    ],
  );

  return {
    animatedFillPath,
    animatedGraphWidth,
    animatedLinePath,
    animateTo,
  };
}

export type ChartMorphState = ReturnType<typeof useChartMorph>;
