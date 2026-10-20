import React, { useCallback, useMemo, useState } from "react";
import type { TextStyle } from "react-native";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import { DemoPageScroll, PreviewStage } from "@/components/morph-demo/demo-chrome";
import { useDemoTheme } from "@/components/morph-demo/demo-theme";
import type { DemoPageProps } from "@/components/morph-demo/demo-pages/types";
import { useDemoMetrics } from "@/components/morph-demo/use-demo-metrics";
import { ButtonsGrid } from "./ui";

const previewContainerStyle = {
  width: "100%",
  alignSelf: "center",
} as const;

const NumberInputPreview = React.memo(function NumberInputPreview({
  value,
}: {
  readonly value: string;
}) {
  const theme = useDemoTheme();
  const textStyle = useMemo<TextStyle>(
    () => ({
      color: theme.primary,
      fontFamily: "Sf-semibold",
      fontSize: 72,
      fontVariant: ["tabular-nums"],
      textAlign: "center",
    }),
    [theme.primary],
  );
  const formattedValue = useMemo(() => {
    const [integer, fraction] = value.split(".");
    const groupedInteger = Number(integer || 0).toLocaleString("en-US");
    return `$${groupedInteger}${fraction === undefined ? "" : `.${fraction}`}`;
  }, [value]);

  return (
    <Laminar
      text={formattedValue}
      variant="slots"
      slotMode="reelStep"
      animationPreset="smooth"
      shadow
      fontSize={72}
      align="center"
      clipToBounds={false}
      containerStyle={previewContainerStyle}
      style={textStyle}
    />
  );
});

function NumberInputPage({ height, width }: DemoPageProps) {
  const [input, setInput] = useState("0");
  const metrics = useDemoMetrics({ height, width, fontSize: 72 });
  const updateInput = useCallback((value: string) => setInput(value), []);
  const backspace = useCallback((value: string) => setInput(value), []);
  const reset = useCallback(() => setInput("0"), []);

  return (
    <View style={{ flex: 1 }}>
      <DemoPageScroll metrics={metrics}>
        <PreviewStage metrics={metrics}>
          <NumberInputPreview value={input} />
        </PreviewStage>
        <View style={{ flex: 1, minHeight: metrics.controlStackGap }} />
        <ButtonsGrid
          input={input}
          onUpdate={updateInput}
          onBackspace={backspace}
          onReset={reset}
        />
      </DemoPageScroll>
    </View>
  );
}

export const NumberInputDemoPage = React.memo(NumberInputPage);
