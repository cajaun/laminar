import React, { useCallback, useMemo, useRef, useState } from "react";
import type { TextStyle } from "react-native";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Laminar } from "react-native-laminar";
import { PreviewStage } from "@/components/morph-demo/demo-chrome";
import { useDemoTheme } from "@/components/morph-demo/demo-theme";
import type { DemoPageProps } from "@/components/morph-demo/demo-pages/types";
import { useDemoMetrics } from "@/components/morph-demo/use-demo-metrics";
import {
  ButtonsGrid,
  ContinueButton,
  RecipientField,
  SendHeader,
} from "./ui";

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

function NumberInputController({
  metrics,
}: {
  readonly metrics: ReturnType<typeof useDemoMetrics>;
}) {
  const [input, setInput] = useState("0");
  const inputRef = useRef(input);
  const updateInput = useCallback((value: string) => {
    inputRef.current = value;
    setInput(value);
  }, []);
  const appendDigit = useCallback(
    (digit: number) => {
      const current = inputRef.current;
      const nextValue =
        current === "0" ? String(digit) : `${current}${digit}`;
      if (nextValue.replace(/\D/g, "").length > 11) {
        return;
      }
      updateInput(nextValue);
    },
    [updateInput],
  );
  const addDecimal = useCallback(() => {
    const current = inputRef.current;
    if (!current.includes(".")) {
      updateInput(`${current}.`);
    }
  }, [updateInput]);
  const backspace = useCallback(() => {
    const current = inputRef.current;
    updateInput(current.length === 1 ? "0" : current.slice(0, -1));
  }, [updateInput]);
  const reset = useCallback(() => updateInput("0"), [updateInput]);

  return (
    <View style={{ flex: 1 }}>
      <PreviewStage metrics={metrics} fill>
        <NumberInputPreview value={input} />
      </PreviewStage>
      <ButtonsGrid
        onDigit={appendDigit}
        onDecimal={addDecimal}
        onBackspace={backspace}
        onReset={reset}
      />
    </View>
  );
}

function NumberInputPage({ height, width }: DemoPageProps) {
  const metrics = useDemoMetrics({ height, width, fontSize: 72 });
  const theme = useDemoTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const close = useCallback(() => router.back(), [router]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <View
        style={{
          flex: 1,
          paddingHorizontal: metrics.horizontalInset,
          paddingTop: insets.top,
          paddingBottom: 12,
        }}
      >
        <SendHeader onClose={close} />
        <View style={{ height: 18 }} />
        <RecipientField />
        <NumberInputController metrics={metrics} />
        <View style={{ height: 16 }} />
        <ContinueButton />
      </View>
    </View>
  );
}

export const NumberInputDemoPage = React.memo(NumberInputPage);
