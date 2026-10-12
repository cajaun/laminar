import { useCallback, useEffect, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import {
  Gesture,
  type ComposedGesture,
} from "react-native-gesture-handler";
import {
  cancelAnimation,
  Easing,
  runOnJS,
  type SharedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Platform } from "react-native";
import { CHART_HEIGHT } from "@/components/flux-chart/core/model/geometry";
import type { CursorPoint } from "@/components/flux-chart/core/types";
import { getChartCursorPoint } from "@/components/flux-chart/core/model/cursor";
import {
  CURSOR_ENTRY_SPRING,
  CURSOR_FADE_DURATION,
  CURSOR_SCALE_DURATION,
  CURSOR_SCALE_START,
} from "@/components/flux-chart/core/model/chart-config";

type UseChartCursorOptions = {
  points: CursorPoint[];
  graphWidth: number;
  chartWidth: number;
};

export type ChartCursorState = {
  clearCursor: () => void;
  cursor: CursorPoint | null;
  cursorIndex: number | null;
  cursorScale: SharedValue<number>;
  cursorX: SharedValue<number>;
  cursorY: SharedValue<number>;
  fadeProgress: SharedValue<number>;
  panGesture: ComposedGesture;
};

function selectHaptic() {
  if (Platform.OS !== "web") void Haptics.selectionAsync();
}

function impactHaptic() {
  if (Platform.OS !== "web") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

/** Owns cursor interaction, visibility transitions, and haptic feedback. */
export function useChartCursor({
  points,
  graphWidth,
  chartWidth,
}: UseChartCursorOptions): ChartCursorState {
  const [cursor, setCursor] = useState<CursorPoint | null>(null);
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);
  const lastHapticIndex = useSharedValue(-1);
  const committedCursorIndex = useSharedValue(-1);
  const cursorActive = useSharedValue(0);
  const fadeStarted = useSharedValue(0);
  const fadeOutStarted = useSharedValue(0);

  const cursorScale = useSharedValue(CURSOR_SCALE_START);
  const cursorX = useSharedValue(chartWidth);
  const cursorY = useSharedValue(CHART_HEIGHT);
  const fadeProgress = useSharedValue(0);

  const commitCursorState = useCallback(
    (cursorPoint: CursorPoint, safeIndex: number) => {
      setCursor(cursorPoint);
      setCursorIndex(safeIndex);
    },
    [],
  );

  useEffect(() => {
    if (cursorIndex === null) {
      fadeStarted.value = 0;
      fadeProgress.value = 0;
      cursorScale.value = CURSOR_SCALE_START;
      cursorX.value = chartWidth;
      cursorY.value = CHART_HEIGHT;
    }
  }, [
    chartWidth,
    cursorIndex,
    cursorScale,
    cursorX,
    cursorY,
    fadeProgress,
    fadeStarted,
  ]);

  const startCursorEntry = useCallback(() => {
    "worklet";

    cancelAnimation(cursorScale);
    cancelAnimation(fadeProgress);
    cursorScale.value = CURSOR_SCALE_START;
    cursorScale.value = withSpring(1, CURSOR_ENTRY_SPRING);
    fadeProgress.value = 0;
    fadeProgress.value = withTiming(1, {
      duration: CURSOR_FADE_DURATION,
      easing: Easing.in(Easing.quad),
    });
  }, [cursorScale, fadeProgress]);

  const updateCursor = useCallback(
    (x: number) => {
      "worklet";

      if (points.length === 0) return;

      const clampedX = Math.max(0, Math.min(graphWidth, x));
      const cursorPoint = getChartCursorPoint(points, clampedX, graphWidth);
      if (!cursorPoint) return;

      const rawIndex = Math.round(
        (clampedX / Math.max(1, graphWidth)) * (points.length - 1),
      );
      const safeIndex = Math.max(0, Math.min(points.length - 1, rawIndex));

      if (lastHapticIndex.value !== safeIndex) {
        lastHapticIndex.value = safeIndex;
        runOnJS(selectHaptic)();
      }

      if (!fadeStarted.value) {
        fadeStarted.value = 1;
        cursorActive.value = 1;
        startCursorEntry();
      }

      cursorX.value = cursorPoint.x;
      cursorY.value = cursorPoint.y;

      if (committedCursorIndex.value !== safeIndex) {
        committedCursorIndex.value = safeIndex;
        runOnJS(commitCursorState)(cursorPoint, safeIndex);
      }

      if (fadeOutStarted.value) {
        fadeOutStarted.value = 0;
        startCursorEntry();
      }
    },
    [
      commitCursorState,
      committedCursorIndex,
      cursorActive,
      cursorX,
      cursorY,
      fadeOutStarted,
      fadeStarted,
      graphWidth,
      lastHapticIndex,
      points,
      startCursorEntry,
    ],
  );

  const finishCursor = useCallback(() => {
    setCursor(null);
    setCursorIndex(null);
  }, []);

  const clearCursor = useCallback(() => {
    "worklet";

    lastHapticIndex.value = -1;
    committedCursorIndex.value = -1;

    if (!cursorActive.value || fadeOutStarted.value) return;

    fadeOutStarted.value = 1;
    cancelAnimation(cursorScale);
    cancelAnimation(fadeProgress);
    cursorScale.value = withTiming(0, {
      duration: CURSOR_SCALE_DURATION,
      easing: Easing.in(Easing.quad),
    });
    fadeProgress.value = withTiming(
      0,
      {
        duration: CURSOR_FADE_DURATION,
        easing: Easing.out(Easing.quad),
      },
      (finished) => {
        "worklet";

        if (finished) {
          cursorActive.value = 0;
          fadeStarted.value = 0;
          fadeOutStarted.value = 0;
          runOnJS(finishCursor)();
        }
      },
    );
  }, [
    committedCursorIndex,
    cursorActive,
    cursorScale,
    fadeOutStarted,
    fadeProgress,
    fadeStarted,
    finishCursor,
    lastHapticIndex,
  ]);

  const panGesture = useMemo(
    () => {
      const pan = Gesture.Pan()
        .onStart(() => {
          "worklet";

          lastHapticIndex.value = -1;
          runOnJS(impactHaptic)();
        })
        .onUpdate((event) => {
          "worklet";

          updateCursor(event.x);
        })
        .onEnd(() => {
          "worklet";

          runOnJS(selectHaptic)();
          clearCursor();
        })
        .onFinalize(() => {
          "worklet";

          clearCursor();
        });

      const tap = Gesture.Tap()
        .maxDuration(60_000)
        .onBegin((event) => {
          "worklet";

          updateCursor(event.x);
        })
        .onEnd((_event, success) => {
          "worklet";

          if (success) clearCursor();
        });

      return Gesture.Race(pan, tap);
    },
    [
      clearCursor,
      lastHapticIndex,
      updateCursor,
    ],
  );

  return {
    clearCursor,
    cursor,
    cursorIndex,
    cursorScale,
    cursorX,
    cursorY,
    fadeProgress,
    panGesture,
  };
}
