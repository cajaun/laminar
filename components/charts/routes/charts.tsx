import { StyleSheet, Text, View, Pressable } from "react-native";
import React, { useState } from "react";
import Animated, {
  LinearTransition,
  runOnJS,
  useSharedValue,
} from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { MAX_HEIGHT } from "@/components/charts/utils/Chart";
import { timeData } from "@/components/charts/ChartData";
import { Period } from "@/components/charts/types/ChartTypes";
import { TooltipData } from "@/components/charts/types/ChartTypes";
import { getBarDimensions } from "@/components/charts/utils/getBarDimensions";
import { Bars } from "@/components/charts/Bars";
import AnimatedText from "@/components/charts/AnimatedText";
import { SegmentedControl } from "../../segmented-control/segmented-control";
import {
  SafeAreaView,
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type TabItemType = {
  key: string;
  label: string;
};

export default function Charts() {
  const theme = useTheme();
  const periodLabels: Period[] = ["1D", "1W", "1M", "1Y"];
  const periods: TabItemType[] = periodLabels.map((p) => ({
    key: p,
    label: p,
  }));
  const [activeIndex, setActiveIndex] = useState(1);
  const selectedPeriod = periods[activeIndex].key as Period;
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const currentBarIndex = useSharedValue<number | null>(null);
  const data = timeData[selectedPeriod];
  const maxValue = Math.max(...data.map((item) => item.value));
  const { barWidth, gap } = getBarDimensions(selectedPeriod, data.length);
  const { top } = useSafeAreaInsets();

  const showTooltip = (data: TooltipData) => {
    setTooltipData(data);
    currentBarIndex.value = data?.barIndex ?? null;
  };

  const hideTooltip = () => {
    setTooltipData(null);
    currentBarIndex.value = null;
  };

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      const barIndex = Math.floor(e.x / (barWidth + gap));
      if (barIndex >= 0 && barIndex < data.length) {
        runOnJS(showTooltip)({
          value: data[barIndex].value,
          label: data[barIndex].label,
          barIndex: barIndex,
        });
      }
    })
    .onUpdate((e) => {
      const barIndex = Math.floor(e.x / (barWidth + gap));
      if (barIndex >= 0 && barIndex < data.length) {
        runOnJS(showTooltip)({
          value: data[barIndex].value,
          label: data[barIndex].label,
          barIndex: barIndex,
        });
      }
    })
    .onFinalize(() => {
      runOnJS(hideTooltip)();
    });

  return (
    <GestureHandlerRootView className="flex-1 ">
      <SafeAreaView className="px-4 " style={{ paddingTop: top }}>
        <SegmentedControl
          tabs={periods}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      </SafeAreaView>

      <Animated.View
        layout={LinearTransition.springify()}
        className="flex-1 "
        style={{ backgroundColor: theme.colors.background, paddingTop: top }}
      >
        {tooltipData?.value && (
          <View className="items-end pr-5">
            <AnimatedText
              className="text-[35px] font-extrabold "
              style={{ color: theme.colors.text }}
            >
              {`$${tooltipData?.value.toFixed(2)}`}
            </AnimatedText>
          </View>
        )}

        <Animated.View
          layout={LinearTransition.springify()}
          className="items-center justify-center"
          style={{ height: MAX_HEIGHT + 40 }}
        >
          <GestureDetector gesture={gesture}>
            <Animated.View
              layout={LinearTransition.springify()
                .damping(25)
                .mass(1)
                .stiffness(200)}
              className="flex-row "
              style={{ columnGap: gap }}
            >
              {data.map((item, index) => (
                <Bars
                  key={index}
                  item={item}
                  index={index}
                  barWidth={barWidth}
                  selectedPeriod={selectedPeriod}
                  maxValue={maxValue}
                  currentBarIndex={currentBarIndex}
                />
              ))}
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </Animated.View>
    </GestureHandlerRootView>
  );
}
