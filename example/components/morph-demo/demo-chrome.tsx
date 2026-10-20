import React from "react";
import { Text, View } from "react-native";
import { PressableScale } from "@/shared/ui/pressable-scale";
import type { DemoMetrics } from "./use-demo-metrics";
import { useDemoTheme } from "./demo-theme";

type PreviewStageProps = {
  readonly metrics: DemoMetrics;
  readonly fill?: boolean;
  readonly children: React.ReactNode;
};

export function PreviewStage({
  metrics,
  fill = false,
  children,
}: PreviewStageProps) {
  return (
    <View
      style={{
        width: "100%",
        minHeight: metrics.previewMinHeight,
        flex: fill ? 1 : undefined,
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

export const DemoFooter = React.memo(function DemoFooter({
  metrics,
  onReverse,
  onMorph,
}: DemoFooterProps) {
  const theme = useDemoTheme();

  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: metrics.horizontalInset,
        paddingTop: 0,
        paddingBottom: metrics.footerPaddingBottom,
        backgroundColor: theme.background,
      }}
    >
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
            backgroundColor: theme.buttonSurface,
          }}
        >
          <Text
            className="text-2xl"
            style={{
              color: theme.buttonSurfaceForeground,
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
            backgroundColor: theme.actionSurface,
          }}
        >
          <Text
            className="text-2xl"
            style={{
              color: theme.actionForeground,
              fontFamily: "Sf-bold",
            }}
          >
            Morph
          </Text>
        </PressableScale>
      </View>
    </View>
  );
});
