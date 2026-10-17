import React from "react";
import {
  GestureDetector,
  type ComposedGesture,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Text, View } from "react-native";
import type { CursorPoint } from "@/components/flux-chart/core/types";
import type { RangeType } from "@/components/flux-chart/data/chart-data";
import { CHART_HEIGHT } from "@/components/flux-chart/core/model/geometry";
import {
  ChartCanvas,
  type ChartCanvasProps,
} from "@/components/flux-chart/core/components/chart-canvas";
import { getCursorLabel } from "@/components/flux-chart/core/model/chart-formatters";
import { Pills } from "@/components/flux-chart/core/components/pills";

type ChartAreaProps = Pick<
  ChartCanvasProps,
  | "animatedGraphWidth"
  | "cursorScale"
  | "cursorX"
  | "cursorY"
  | "fadeProgress"
  | "fillBottomColor"
  | "fillTopColor"
  | "futureLineColor"
  | "lineColor"
  | "morphedYValues"
  | "showFill"
> & {
  chartWidth: number;
  contentWidth: number;
  cursorIndex: number | null;
  graphWidth: number;
  onRangeSelect: (range: RangeType) => void;
  panGesture: ComposedGesture;
  points: CursorPoint[];
  selected: RangeType;
};

/** Composes the interactive plot, cursor label, and range selector. */
export function ChartArea({
  animatedGraphWidth,
  chartWidth,
  contentWidth,
  cursorIndex,
  cursorScale,
  cursorX,
  cursorY,
  fadeProgress,
  fillBottomColor,
  fillTopColor,
  futureLineColor,
  graphWidth,
  lineColor,
  morphedYValues,
  onRangeSelect,
  panGesture,
  points,
  selected,
  showFill,
}: ChartAreaProps) {
  const cursorPillWidth = useSharedValue(60);
  const cursorLabel = getCursorLabel(
    selected,
    cursorIndex ?? 0,
    points.length,
  );
  const handleCursorPillLayout = React.useCallback(
    (event: { nativeEvent: { layout: { width: number } } }) => {
      cursorPillWidth.value = Math.max(1, event.nativeEvent.layout.width);
    },
    [cursorPillWidth],
  );
  const animatedCursorPillStyle = useAnimatedStyle(() => ({
    opacity: fadeProgress.value,
    left: Math.max(
      0,
      Math.min(
        Math.max(0, graphWidth - cursorPillWidth.value),
        cursorX.value - cursorPillWidth.value / 2,
      ),
    ),
  }), [graphWidth]);

  return (
    <>
      <View
        className="mt-4 overflow-visible"
        style={{ width: chartWidth, height: CHART_HEIGHT }}
      >
        <GestureDetector gesture={panGesture}>
          <View
            className="relative"
            style={{ width: chartWidth, height: CHART_HEIGHT }}
          >
            <ChartCanvas
              animatedGraphWidth={animatedGraphWidth}
              chartWidth={chartWidth}
              cursorScale={cursorScale}
              cursorX={cursorX}
              cursorY={cursorY}
              fadeProgress={fadeProgress}
              fillBottomColor={fillBottomColor}
              fillTopColor={fillTopColor}
              futureLineColor={futureLineColor}
              lineColor={lineColor}
              morphedYValues={morphedYValues}
              showFill={showFill}
            />
            <Animated.View
              pointerEvents="none"
              className="absolute top-1.5"
              onLayout={handleCursorPillLayout}
              style={animatedCursorPillStyle}
            >
              <Text
                numberOfLines={1}
                className="rounded-full bg-[#F6F7F7] px-2 font-sf-medium text-[14px] leading-4.25 text-[#999999]"
                style={{
                  minHeight: 26,
                  paddingVertical: 4,
                  color: "#999999",
                  fontFamily: "Sf-medium",
                  fontSize: 14,
                  lineHeight: 17,
                }}
              >
                {cursorLabel}
              </Text>
            </Animated.View>
          </View>
        </GestureDetector>
      </View>

      <View className="-mt-2">
        <Pills
          width={Math.min(272, contentWidth)}
          selected={selected}
          onSelect={onRangeSelect}
        />
      </View>

      <View
        className="mt-8 h-px bg-[#F1F1F1]"
        style={{ width: contentWidth }}
      />
    </>
  );
}
