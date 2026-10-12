import { useCallback } from "react";
import {
  Easing,
  runOnUI,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CHART_MORPH_DURATION } from "@/components/flux-chart/core/model/chart-config";

type UseChartMorphOptions = {
  initialYValues: number[];
  initialGraphWidth: number;
};

/** Owns the UI-thread state used to morph one chart range into another. */
export function useChartMorph({
  initialYValues,
  initialGraphWidth,
}: UseChartMorphOptions) {
  const morphFrom = useSharedValue<number[]>(initialYValues);
  const morphTo = useSharedValue<number[]>(initialYValues);
  const morphProgress = useSharedValue(1);
  const graphWidthFrom = useSharedValue(initialGraphWidth);
  const graphWidthTo = useSharedValue(initialGraphWidth);

  const morphedYValues = useDerivedValue(() => {
    const from = morphFrom.value;
    const to = morphTo.value;

    return from.map(
      (value, index) => value + (to[index] - value) * morphProgress.value,
    );
  });

  // One clock drives both the line geometry and the horizontal reveal. This
  // prevents the path and its width from starting on different frames.
  const animatedGraphWidth = useDerivedValue(() => {
    return (
      graphWidthFrom.value +
      (graphWidthTo.value - graphWidthFrom.value) * morphProgress.value
    );
  });

  const animateTo = useCallback(
    (nextYValues: number[], nextGraphWidth: number) => {
      runOnUI((toValues: number[], toWidth: number) => {
        "worklet";

        const currentFrom = morphFrom.value;
        const currentTo = morphTo.value;
        const currentProgress = morphProgress.value;
        const currentYValues = currentFrom.map(
          (value, index) =>
            value + (currentTo[index] - value) * currentProgress,
        );
        const currentGraphWidth =
          graphWidthFrom.value +
          (graphWidthTo.value - graphWidthFrom.value) * currentProgress;

        morphFrom.value = currentYValues;
        morphTo.value = toValues;
        graphWidthFrom.value = currentGraphWidth;
        graphWidthTo.value = toWidth;
        morphProgress.value = 0;
        morphProgress.value = withTiming(1, {
          duration: CHART_MORPH_DURATION,
          easing: Easing.out(Easing.cubic),
        });
      })(nextYValues, nextGraphWidth);
    },
    [graphWidthFrom, graphWidthTo, morphFrom, morphProgress, morphTo],
  );

  return {
    animatedGraphWidth,
    animateTo,
    morphedYValues,
  };
}

export type ChartMorphState = ReturnType<typeof useChartMorph>;
