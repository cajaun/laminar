import React from "react";
import {
  GestureDetector,
  type ComposedGesture,
} from "react-native-gesture-handler";
import Animated, {
  type SharedValue,
  createAnimatedComponent,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { TextInput, View } from "react-native";
import type { RangeType } from "@/components/morphing-chart/data/chart-data";
import { CHART_HEIGHT } from "@/components/morphing-chart/core/model/geometry";
import {
  ChartCanvas,
  type ChartCanvasProps,
} from "@/components/morphing-chart/core/components/chart-canvas";
import { Pills } from "@/components/morphing-chart/core/components/pills";
import { useMorphingChartTheme } from "@/components/morphing-chart/ui/morphing-chart-theme";

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
  | "animatedFillPath"
  | "animatedLinePath"
  | "showFill"
> & {
  chartWidth: number;
  contentWidth: number;
  cursorIndexShared: SharedValue<number>;
  cursorLabels: readonly string[];
  onRangeSelect: (range: RangeType) => void;
  panGesture: ComposedGesture;
  rangeSelectionProgress: SharedValue<number>;
  rangeTransitionFrom: SharedValue<RangeType>;
  rangeTransitionTo: SharedValue<RangeType>;
  selected: RangeType;
};

// compose the plot cursor label and range selector
export const ChartArea = React.memo(function ChartArea({
  animatedGraphWidth,
  animatedFillPath,
  animatedLinePath,
  chartWidth,
  contentWidth,
  cursorIndexShared,
  cursorLabels,
  cursorScale,
  cursorX,
  cursorY,
  fadeProgress,
  fillBottomColor,
  fillTopColor,
  futureLineColor,
  lineColor,
  onRangeSelect,
  panGesture,
  rangeSelectionProgress,
  rangeTransitionFrom,
  rangeTransitionTo,
  selected,
  showFill,
}: ChartAreaProps) {
  const theme = useMorphingChartTheme();

  return (
    <>
      <ChartSurface
        animatedFillPath={animatedFillPath}
        animatedGraphWidth={animatedGraphWidth}
        animatedLinePath={animatedLinePath}
        chartWidth={chartWidth}
        cursorIndexShared={cursorIndexShared}
        cursorLabels={cursorLabels}
        cursorScale={cursorScale}
        cursorX={cursorX}
        cursorY={cursorY}
        fadeProgress={fadeProgress}
        fillBottomColor={fillBottomColor}
        fillTopColor={fillTopColor}
        futureLineColor={futureLineColor}
        lineColor={lineColor}
        panGesture={panGesture}
        showFill={showFill}
      />

      <RangeSelector
        contentWidth={contentWidth}
        onRangeSelect={onRangeSelect}
        rangeSelectionProgress={rangeSelectionProgress}
        rangeTransitionFrom={rangeTransitionFrom}
        rangeTransitionTo={rangeTransitionTo}
        selected={selected}
      />

      <View
        className="mt-8 h-px"
        style={{ width: contentWidth, backgroundColor: theme.chartDivider }}
      />
    </>
  );
});

ChartArea.displayName = "ChartArea";

type ChartSurfaceProps = Pick<
  ChartAreaProps,
  | "animatedFillPath"
  | "animatedGraphWidth"
  | "animatedLinePath"
  | "chartWidth"
  | "cursorIndexShared"
  | "cursorLabels"
  | "cursorScale"
  | "cursorX"
  | "cursorY"
  | "fadeProgress"
  | "fillBottomColor"
  | "fillTopColor"
  | "futureLineColor"
  | "lineColor"
  | "panGesture"
  | "showFill"
>;

const ChartSurface = React.memo(function ChartSurface({
  animatedFillPath,
  animatedGraphWidth,
  animatedLinePath,
  chartWidth,
  cursorIndexShared,
  cursorLabels,
  cursorScale,
  cursorX,
  cursorY,
  fadeProgress,
  fillBottomColor,
  fillTopColor,
  futureLineColor,
  lineColor,
  panGesture,
  showFill,
}: ChartSurfaceProps) {
  return (
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
            animatedFillPath={animatedFillPath}
            animatedLinePath={animatedLinePath}
            showFill={showFill}
          />
          <CursorLabel
            animatedGraphWidth={animatedGraphWidth}
            cursorIndexShared={cursorIndexShared}
            cursorLabels={cursorLabels}
            cursorX={cursorX}
            fadeProgress={fadeProgress}
          />
        </View>
      </GestureDetector>
    </View>
  );
});

ChartSurface.displayName = "ChartSurface";

type RangeSelectorProps = {
  contentWidth: number;
  onRangeSelect: (range: RangeType) => void;
  rangeSelectionProgress: SharedValue<number>;
  rangeTransitionFrom: SharedValue<RangeType>;
  rangeTransitionTo: SharedValue<RangeType>;
  selected: RangeType;
};

const RangeSelector = React.memo(function RangeSelector({
  contentWidth,
  onRangeSelect,
  rangeSelectionProgress,
  rangeTransitionFrom,
  rangeTransitionTo,
  selected,
}: RangeSelectorProps) {
  return (
    <View className="mt-4">
      <Pills
        width={Math.min(272, contentWidth)}
        selected={selected}
        transitionFrom={rangeTransitionFrom}
        transitionTo={rangeTransitionTo}
        transitionProgress={rangeSelectionProgress}
        onSelect={onRangeSelect}
      />
    </View>
  );
});

RangeSelector.displayName = "RangeSelector";

type CursorLabelProps = {
  animatedGraphWidth: SharedValue<number>;
  cursorIndexShared: SharedValue<number>;
  cursorLabels: readonly string[];
  cursorX: SharedValue<number>;
  fadeProgress: SharedValue<number>;
};

const AnimatedTextInput = createAnimatedComponent(TextInput);

// keep changing cursor text local to the chart area
const CursorLabel = React.memo(function CursorLabel({
  animatedGraphWidth,
  cursorIndexShared,
  cursorLabels,
  cursorX,
  fadeProgress,
}: CursorLabelProps) {
  const theme = useMorphingChartTheme();
  const cursorPillWidth = useSharedValue(60);
  const animatedProps = useAnimatedProps<{ text: string }>(
    () => {
      "worklet";

      const lastIndex = Math.max(0, cursorLabels.length - 1);
      const index = Math.max(
        0,
        Math.min(lastIndex, Math.round(cursorIndexShared.value)),
      );

      return { text: cursorLabels[index] ?? "" };
    },
    [cursorLabels],
  );

  const handleCursorPillLayout = React.useCallback(
    (event: { nativeEvent: { layout: { width: number } } }) => {
      cursorPillWidth.value = Math.max(1, event.nativeEvent.layout.width);
    },
    [cursorPillWidth],
  );
  const animatedCursorPillStyle = useAnimatedStyle(
    () => ({
      opacity: fadeProgress.value,
      left: Math.max(
        0,
        Math.min(
          Math.max(0, animatedGraphWidth.value - cursorPillWidth.value),
          cursorX.value - cursorPillWidth.value / 2,
        ),
      ),
    }),
    [animatedGraphWidth],
  );
  return (
    <Animated.View
      pointerEvents="none"
      className="absolute top-1.5"
      onLayout={handleCursorPillLayout}
      style={animatedCursorPillStyle}
    >
      <AnimatedTextInput
        accessibilityElementsHidden
        caretHidden
        defaultValue={cursorLabels[0] ?? ""}
        editable={false}
        pointerEvents="none"
        style={{
          minHeight: 26,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: theme.cursorSurface,
          color: theme.secondary,
          fontFamily: "Sf-medium",
          fontSize: 14,
          lineHeight: 17,
        }}
        animatedProps={
          animatedProps as unknown as React.ComponentProps<
            typeof AnimatedTextInput
          >["animatedProps"]
        }
      />
    </Animated.View>
  );
});
