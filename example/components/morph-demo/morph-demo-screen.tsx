import React, { useCallback } from "react";
import { type ListRenderItem, View } from "react-native";
import {
  Carousel,
  CarouselContent,
  type CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import { carouselItems, examplePages } from "./demo-data";
import { DemoFooter, DemoPageScroll } from "./demo-chrome";
import {
  AnimationLayerDemoPage,
  AutoSizeDemoPage,
  ButtonDemoPage,
  ConfirmationDemoPage,
  PressableSplitDemoPage,
  EditorDemoPage,
  NumbersDemoPage,
  NumberIdentityDemoPage,
  SlotValuesDemoPage,
  SlotsDemoPage,
  TextIdentityDemoPage,
  WordsDemoPage,
} from "./demo-pages";
import { useDemoMetrics } from "./use-demo-metrics";
import { useDemoState } from "./use-demo-state";

type MorphDemoInnerProps = {
  readonly height: number;
  readonly width: number;
};

function MorphDemoInner({ height, width }: MorphDemoInnerProps) {
  const { currentIndex } = useCarousel();
  const state = useDemoState(currentIndex);
  const metrics = useDemoMetrics({
    height,
    width,
    fontSize: state.fontSize,
  });

  const renderExamplePage = useCallback<ListRenderItem<CarouselItem>>(
    ({ item }) => {
      const page = examplePages[item];
      const isNearbyPage = Math.abs(item - currentIndex) <= 1;

      if (!isNearbyPage) {
        return (
          <DemoPageScroll metrics={metrics}>
            <View style={{ flex: 1 }} />
          </DemoPageScroll>
        );
      }

      const content =
        page?.id === "textIdentity" ? (
          <TextIdentityDemoPage metrics={metrics} state={state} />
        ) : page?.id === "numberIdentity" ? (
          <NumberIdentityDemoPage metrics={metrics} state={state} />
        ) : page?.id === "animationLayer" ? (
          <AnimationLayerDemoPage metrics={metrics} state={state} />
        ) : page?.id === "autoSize" ? (
          <AutoSizeDemoPage metrics={metrics} state={state} />
        ) : page?.id === "editor" ? (
          <EditorDemoPage metrics={metrics} state={state} />
        ) : page?.id === "words" ? (
          <WordsDemoPage metrics={metrics} state={state} />
        ) : page?.id === "button" ? (
          <ButtonDemoPage metrics={metrics} state={state} />
        ) : page?.id === "confirmation" ? (
          <ConfirmationDemoPage metrics={metrics} state={state} />
        ) : page?.id === "pressableSplit" ? (
          <PressableSplitDemoPage metrics={metrics} state={state} />
        ) : page?.id === "slots" ? (
          <SlotsDemoPage metrics={metrics} state={state} />
        ) : page?.id === "slotValues" ? (
          <SlotValuesDemoPage metrics={metrics} state={state} />
        ) : (
          <NumbersDemoPage metrics={metrics} state={state} />
        );

      return <DemoPageScroll metrics={metrics}>{content}</DemoPageScroll>;
    },
    [currentIndex, metrics, state]
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
      }}
    >
      <CarouselContent renderItem={renderExamplePage} width={width} />
      {examplePages[currentIndex]?.id === "confirmation" ||
      examplePages[currentIndex]?.id === "pressableSplit" ? null : (
        <DemoFooter
          metrics={metrics}
          onReverse={state.reverse}
          onMorph={state.morph}
        />
      )}
    </View>
  );
}

type MorphDemoScreenProps = {
  readonly height: number;
  readonly width: number;
};

export function MorphDemoScreen({ height, width }: MorphDemoScreenProps) {
  return (
    <Carousel
      items={carouselItems}
      style={{ flex: 1, backgroundColor: "#ffffff" }}
    >
      <MorphDemoInner width={width} height={height} />
    </Carousel>
  );
}
