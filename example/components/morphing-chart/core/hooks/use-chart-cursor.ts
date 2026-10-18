import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Haptics from "expo-haptics";
import {
  Gesture,
  type ComposedGesture,
} from "react-native-gesture-handler";
import {
  Easing,
  runOnJS,
  type SharedValue,
  useFrameCallback,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Platform } from "react-native";
import { CHART_HEIGHT } from "@/components/morphing-chart/core/model/geometry";
import type { CursorPoint } from "@/components/morphing-chart/core/types";
import { getChartCursorPoint } from "@/components/morphing-chart/core/model/cursor";
import {
  CURSOR_ENTRY_SPRING,
  CURSOR_FADE_DURATION,
  CURSOR_SCALE_DURATION,
  CURSOR_SCALE_START,
} from "@/components/morphing-chart/core/model/chart-config";

type UseChartCursorOptions = {
  points: CursorPoint[];
  graphWidth: number;
  chartWidth: number;
};

export type ChartCursorState = {
  clearCursor: () => void;
  cursor: CursorPoint | null;
  cursorIndex: number | null;
  cursorIndexShared: SharedValue<number>;
  isScrubbing: boolean;
  cursorScale: SharedValue<number>;
  cursorX: SharedValue<number>;
  cursorY: SharedValue<number>;
  fadeProgress: SharedValue<number>;
  panGesture: ComposedGesture;
  stopScrubbing: () => void;
};

function impactHaptic() {
  if (Platform.OS !== "web") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

// coordinate cursor interaction visibility and haptics
export function useChartCursor({
  points,
  graphWidth,
  chartWidth,
}: UseChartCursorOptions): ChartCursorState {
  const [cursor, setCursor] = useState<CursorPoint | null>(null);
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);
  // keep held cursors separate from active scrubbing
  const [isScrubbing, setIsScrubbing] = useState(false);
  const committedCursorIndex = useSharedValue(-1);
  const cursorIndexShared = useSharedValue(-1);
  // keep the gesture stable while shared values receive new chart data
  const pointsShared = useSharedValue(points);
  const graphWidthShared = useSharedValue(graphWidth);
  const scrubbingActive = useSharedValue(0);
  const panEnded = useSharedValue(0);
  const pendingReactCommit = useSharedValue(0);
  const releaseRequested = useSharedValue(0);
  const commitVersion = useSharedValue(0);
  const latestCommitVersionRef = useRef(0);
  const cursorActive = useSharedValue(0);
  const fadeStarted = useSharedValue(0);
  const fadeOutStarted = useSharedValue(0);

  const cursorScale = useSharedValue(CURSOR_SCALE_START);
  const cursorX = useSharedValue(chartWidth);
  const cursorY = useSharedValue(CHART_HEIGHT);
  const fadeProgress = useSharedValue(0);

  useLayoutEffect(() => {
    pointsShared.value = points;
    graphWidthShared.value = graphWidth;
  }, [graphWidth, graphWidthShared, points, pointsShared]);

  const commitCursorState = useCallback(
    (
      cursorPoint: CursorPoint,
      safeIndex: number,
      stopScrubbing = false,
      version = 0,
    ) => {
      // ignore queued samples older than the latest release commit
      if (version < latestCommitVersionRef.current) return;
      latestCommitVersionRef.current = version;

      // return the readout to slots while the cursor label finishes fading
      if (stopScrubbing) {
        setCursor(null);
        setCursorIndex(safeIndex);
        setIsScrubbing(false);
        return;
      }

      setCursor(cursorPoint);
      setCursorIndex(safeIndex);
    },
    [],
  );

  const beginScrubbing = useCallback(() => {
    setIsScrubbing(true);
  }, []);

  const scheduleStopScrubbing = useCallback(() => {
    setIsScrubbing(false);
  }, []);

  // bridge at most one cursor sample from each ui frame
  useFrameCallback(() => {
    "worklet";

    if (!pendingReactCommit.value && !releaseRequested.value) return;
    // keep active pan values on the ui thread and bridge discrete commits
    if (scrubbingActive.value === 1 && releaseRequested.value === 0) {
      pendingReactCommit.value = 0;
      return;
    }

    const cursorPoint = getChartCursorPoint(
      pointsShared.value,
      cursorX.value,
      graphWidthShared.value,
    );
    if (!cursorPoint) return;

    const safeIndex = cursorIndexShared.value;
    const stopAfterCommit = releaseRequested.value === 1;
    const version = commitVersion.value;
    pendingReactCommit.value = 0;
    releaseRequested.value = 0;
    runOnJS(commitCursorState)(
      cursorPoint,
      safeIndex,
      stopAfterCommit,
      version,
    );
  }, true);

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

    cursorScale.value = CURSOR_SCALE_START;
    cursorScale.value = withSpring(1, CURSOR_ENTRY_SPRING);
    fadeProgress.value = 0;
    fadeProgress.value = withTiming(1, {
      duration: CURSOR_FADE_DURATION,
      easing: Easing.in(Easing.quad),
    });
  }, [cursorScale, fadeProgress]);

  const updateCursor = useCallback(
    (x: number, forceReactCommit = false) => {
      "worklet";

      const currentPoints = pointsShared.value;
      const currentGraphWidth = graphWidthShared.value;

      if (currentPoints.length === 0) return;

      const clampedX = Math.max(0, Math.min(currentGraphWidth, x));
      const cursorPoint = getChartCursorPoint(
        currentPoints,
        clampedX,
        currentGraphWidth,
      );
      if (!cursorPoint) return;

      const rawIndex = Math.round(
        (clampedX / Math.max(1, currentGraphWidth)) *
          (currentPoints.length - 1),
      );
      const safeIndex = Math.max(
        0,
        Math.min(currentPoints.length - 1, rawIndex),
      );

      cursorIndexShared.value = safeIndex;

      if (!fadeStarted.value) {
        fadeStarted.value = 1;
        cursorActive.value = 1;
        startCursorEntry();
      }

      cursorX.value = cursorPoint.x;
      cursorY.value = cursorPoint.y;

      if (forceReactCommit || committedCursorIndex.value !== safeIndex) {
        committedCursorIndex.value = safeIndex;
        commitVersion.value += 1;
        if (scrubbingActive.value === 0 || forceReactCommit) {
          pendingReactCommit.value = 1;
        }
      }

      if (fadeOutStarted.value) {
        fadeOutStarted.value = 0;
        startCursorEntry();
      }
    },
    [
      committedCursorIndex,
      cursorActive,
      cursorX,
      cursorY,
      fadeOutStarted,
      fadeStarted,
      graphWidthShared,
      cursorIndexShared,
      commitVersion,
      pendingReactCommit,
      pointsShared,
      scrubbingActive,
      startCursorEntry,
    ],
  );

  const finishCursor = useCallback(() => {
    setCursor(null);
    setCursorIndex(null);
  }, []);

  const stopScrubbing = useCallback(() => {
    setIsScrubbing(false);
  }, []);

  const clearCursor = useCallback(() => {
    "worklet";

    scrubbingActive.value = 0;
    committedCursorIndex.value = -1;

    if (!cursorActive.value || fadeOutStarted.value) return;

    fadeOutStarted.value = 1;
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
          cursorIndexShared.value = -1;
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
    cursorIndexShared,
    cursorScale,
    fadeOutStarted,
    fadeProgress,
    fadeStarted,
    finishCursor,
    scrubbingActive,
  ]);

  const panGesture = useMemo(
    () => {
      const pan = Gesture.Pan()
        .onStart((event) => {
          "worklet";

          panEnded.value = 0;
          releaseRequested.value = 0;
          scrubbingActive.value = 1;
          updateCursor(event.x);
          runOnJS(beginScrubbing)();
          runOnJS(impactHaptic)();
        })
        .onUpdate((event) => {
          "worklet";

          updateCursor(event.x);
        })
        .onEnd((event) => {
          "worklet";

          // commit the final point before returning to slots
          panEnded.value = 1;
          scrubbingActive.value = 0;
          updateCursor(event.x);

          const finalPoint = getChartCursorPoint(
            pointsShared.value,
            cursorX.value,
            graphWidthShared.value,
          );
          const finalIndex = cursorIndexShared.value;
          const finalVersion = commitVersion.value + 1;
          commitVersion.value = finalVersion;
          pendingReactCommit.value = 0;
          releaseRequested.value = 0;

          if (finalPoint) {
            // bridge release immediately as a discrete event
            runOnJS(commitCursorState)(
              finalPoint,
              finalIndex,
              true,
              finalVersion,
            );
          }
          clearCursor();
        })
        .onFinalize(() => {
          "worklet";

          const completed = panEnded.value === 1;
          panEnded.value = 0;
          scrubbingActive.value = 0;
          if (!completed) {
            commitVersion.value += 1;
            pendingReactCommit.value = 1;
            releaseRequested.value = 1;
          }
          clearCursor();
        });

      const tap = Gesture.Tap()
        // keep a stationary press alive until pan movement begins
        .maxDuration(10_000)
        .onBegin((event) => {
          "worklet";

          scrubbingActive.value = 0;
          updateCursor(event.x);
        })
        .onEnd((_event, success) => {
          "worklet";

          if (success) {
            runOnJS(scheduleStopScrubbing)();
            clearCursor();
          }
        });

      return Gesture.Race(pan, tap);
    },
    [
      clearCursor,
      beginScrubbing,
      graphWidthShared,
      panEnded,
      pendingReactCommit,
      pointsShared,
      releaseRequested,
      scrubbingActive,
      scheduleStopScrubbing,
      updateCursor,
    ],
  );

  return {
    clearCursor,
    cursor,
    cursorIndex,
    cursorIndexShared,
    isScrubbing,
    cursorScale,
    cursorX,
    cursorY,
    fadeProgress,
    panGesture,
    stopScrubbing,
  };
}
