import React, { useCallback } from "react";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { AnimatedSlider } from "../../components/animated-slider";
import { numberFlowSliderValues } from "../../demo-data";
import {
  useNumberFlowSliderDemoStore,
  useCyclicValueStoreSnapshot,
  DEFAULT_DEMO_FONT_SIZE,
} from "../../use-demo-state";
import { useDemoMetrics } from "../../use-demo-metrics";
import { useDemoTheme } from "../../demo-theme";
import { DemoPageScroll, PreviewStage } from "../../demo-chrome";
import type { DemoPageProps } from "../types";

type NumberFlowStore = ReturnType<typeof useNumberFlowSliderDemoStore>;

const NumberFlowSliderPreview = React.memo(function NumberFlowSliderPreview({
  store,
}: {
  readonly store: NumberFlowStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();

  return (
    <View style={{ width: "100%" }}>
      <Laminar
        text={state.value}
        variant="number"
        numberMode="ticker"
        animationPreset="ticker"
        fontSize={64}
        autoSize
        align="center"
        containerStyle={{ alignSelf: "center" }}
        style={{
          color: theme.primary,
          fontFamily: "Sf-semibold",
          fontSize: 64,
          textAlign: "center",
        }}
      />
    </View>
  );
});

function NumberFlowSliderPage({ height, width }: DemoPageProps) {
  const pickerSize = 35;
  const store = useNumberFlowSliderDemoStore();
  const metrics = useDemoMetrics({
    height,
    width,
    fontSize: DEFAULT_DEMO_FONT_SIZE,
  });
  const theme = useDemoTheme();
  const progress = useSharedValue(0);
  const updateIndex = useCallback(
    (index: number) => store.setIndex(index),
    [store],
  );

  useAnimatedReaction(
    () => Math.round(progress.get() * (numberFlowSliderValues.length - 1)),
    (index, previousIndex) => {
      if (index !== previousIndex) {
        runOnJS(updateIndex)(index);
      }
    },
    [updateIndex],
  );

  return (
    <View style={{ flex: 1 }}>
      <DemoPageScroll metrics={metrics}>
        <PreviewStage metrics={metrics}>
          <NumberFlowSliderPreview store={store} />
        </PreviewStage>
        <View style={{ flex: 1, minHeight: metrics.controlStackGap }} />
      </DemoPageScroll>
      <View
        style={{
          width: "100%",
          paddingHorizontal: metrics.horizontalInset,
          paddingTop: metrics.controlStackGap,
          paddingBottom:
            metrics.controlStackGap + metrics.footerPaddingBottom,
          backgroundColor: theme.background,
        }}
      >
        <AnimatedSlider
          progress={progress}
          pickerSize={pickerSize}
          color={theme.accent}
          trackColor={theme.panel}
          style={{
            width: Math.max(
              0,
              width - metrics.horizontalInset * 2 - pickerSize,
            ),
            marginHorizontal: pickerSize / 2,
            height: 4,
          }}
        />
      </View>
    </View>
  );
}

export const NumberFlowSliderDemoPage = React.memo(NumberFlowSliderPage);
