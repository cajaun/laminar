import React from "react";
import { Text, View } from "react-native";
import { CarouselPagination } from "@/components/ui/carousel";
import { PressableScale } from "@/shared/ui/pressable-scale";
import type { DemoMetrics } from "./use-demo-metrics";

type PreviewStageProps = {
  readonly metrics: DemoMetrics;
  readonly children: React.ReactNode;
};

export function PreviewStage({ metrics, children }: PreviewStageProps) {
  return (
    <View
      style={{
        width: "100%",
        minHeight: metrics.previewMinHeight,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}

type DemoPageScrollProps = {
  readonly metrics: DemoMetrics;
  readonly children: React.ReactNode;
};

export function DemoPageScroll({ metrics, children }: DemoPageScrollProps) {
  return (
    <View
      style={{
        width: metrics.width,
        flex: 1,
        paddingHorizontal: metrics.horizontalInset,
        paddingTop: metrics.pageTopPadding,
        paddingBottom: metrics.controlStackGap,
      }}
    >
      {children}
    </View>
  );
}

type DemoFooterProps = {
  readonly metrics: DemoMetrics;
  readonly onReverse: () => void;
  readonly onMorph: () => void;
};

export function DemoFooter({ metrics, onReverse, onMorph }: DemoFooterProps) {
  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: metrics.horizontalInset,
        paddingTop: 0,
        paddingBottom: metrics.footerPaddingBottom,
        backgroundColor: "#ffffff",
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: metrics.controlStackGap,
        }}
      >
        <CarouselPagination defaultDotColor="#d7d7d7" activeDotColor="#000000" />
      </View>

      <View
        style={{
          width: "100%",
          flexDirection: "row",
          gap: metrics.buttonGap,
        }}
      >
        <PressableScale
          onPress={onReverse}
          style={{
            flex: 1,
            height: metrics.buttonHeight,
            borderRadius: metrics.buttonHeight / 2,
            paddingHorizontal: metrics.buttonPaddingHorizontal,
            paddingVertical: metrics.buttonPaddingVertical,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Text
            className="text-2xl"
            style={{
              color: "#252525",
              fontFamily: "Sf-bold",
            }}
          >
            Reverse
          </Text>
        </PressableScale>

        <PressableScale
          onPress={onMorph}
          style={{
            flex: 1,
            height: metrics.buttonHeight,
            borderRadius: metrics.buttonHeight / 2,
            paddingHorizontal: metrics.buttonPaddingHorizontal,
            paddingVertical: metrics.buttonPaddingVertical,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
          }}
        >
          <Text
            className="text-2xl"
            style={{
              color: "#ffffff",
              fontFamily: "Sf-bold",
            }}
          >
            Morph
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}
