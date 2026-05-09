import React, { useCallback, useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import { MorphingText } from "@/morphing-text";
import { PressableScale } from "@/shared/ui/pressable-scale";

const words = ["Craft", "Creative"] as const;
const statusLines = [
  "Waiting for sync",
  "Streaming updates",
  "Ready to publish",
  "Cajaun",
] as const;
const balances = ["$35.99", "$24.89", "$17.38", "$3.15"] as const;
const shrinkBalances = ["$148.21", "$43.21", "$987.21", "$18.21"] as const;
const growthRates = ["+1.2%", "-0.4%", "+18.9%", "+3.1%"] as const;
const latencies = ["1,281 ms", "943 ms", "12 ms", "87 ms"] as const;

const contentContainerStyle = {
  flexGrow: 1,
  alignItems: "center" as const,
  gap: 22,
  paddingHorizontal: 24,
  paddingVertical: 48,
};

const headerStackStyle = {
  alignItems: "center" as const,
  gap: 6,
};

const exampleStackStyle = {
  width: "100%" as const,
  alignItems: "center" as const,
  gap: 10,
};

const pillStyle = {
  textColor: "#000",
};

const ExamplePanel = React.memo(function ExamplePanel({
  label,
  caption,
  text,
  onPress,
  buttonTitle,
  variant,
  animationPreset = "snappy",
  fontSize = 28,
}: {
  label: string;
  caption: string;
  text: string;
  onPress: () => void;
  buttonTitle: string;
  variant?: "text" | "number";
  animationPreset?: "default" | "smooth" | "snappy" | "bouncy";
  fontSize?: number;
}) {
  return (
    <View style={exampleStackStyle}>
      <Text style={{ fontSize: 13, letterSpacing: 0.3, color: "#666666" }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 11,
          letterSpacing: 0.2,
          color: "#9a9a9a",
          textAlign: "center",
        }}
      >
        {caption}
      </Text>
      {/* <PressableScale onPress={onPress} > */}
        <MorphingText
          text={text}
          variant={variant}
          className="font-sf-bold text-black"
          fontSize={fontSize}
          animationPreset={animationPreset}
        />
      {/* </PressableScale> */}
      <Button title={buttonTitle} onPress={onPress} />
    </View>
  );
});

ExamplePanel.displayName = "ExamplePanel";

export default function Index() {
  const [wordIndex, setWordIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [balanceIndex, setBalanceIndex] = useState(0);
  const [shrinkBalanceIndex, setShrinkBalanceIndex] = useState(0);
  const [growthIndex, setGrowthIndex] = useState(0);
  const [latencyIndex, setLatencyIndex] = useState(0);

  const cycleWord = useCallback(
    () => setWordIndex((index) => (index + 1) % words.length),
    []
  );
  const cycleStatus = useCallback(
    () => setStatusIndex((index) => (index + 1) % statusLines.length),
    []
  );
  const cycleBalance = useCallback(
    () => setBalanceIndex((index) => (index + 1) % balances.length),
    []
  );
  const cycleShrinkBalance = useCallback(
    () =>
      setShrinkBalanceIndex((index) => (index + 1) % shrinkBalances.length),
    []
  );
  const cycleGrowth = useCallback(
    () => setGrowthIndex((index) => (index + 1) % growthRates.length),
    []
  );
  const cycleLatency = useCallback(
    () => setLatencyIndex((index) => (index + 1) % latencies.length),
    []
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={contentContainerStyle}
    >
      <View style={headerStackStyle}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#1b1b1b" }}>
          MorphingText
        </Text>
        <Text style={{ fontSize: 14, color: "#7d7d7d", textAlign: "center" }}>
          Tap any example or use its button to cycle values.
        </Text>
      </View>

      <ExamplePanel
        label="Text / Snappy"
        caption="Short brand words with the faster preset."
        text={words[wordIndex]}
        onPress={cycleWord}
        buttonTitle="Next Word"
        animationPreset="snappy"
      />

      <ExamplePanel
        label="Text / Smooth"
        caption="Longer phrases to check auto-sizing and calmer motion."
        text={statusLines[statusIndex]}
        onPress={cycleStatus}
        buttonTitle="Next Status"
        animationPreset="smooth"
      />

      <ExamplePanel
        label="Number / Balance"
        caption="Mixed growth and shrink transitions on a currency value."
        text={balances[balanceIndex]}
        onPress={cycleBalance}
        buttonTitle="Next Balance"
        variant="number"
        animationPreset="snappy"
      />

      <ExamplePanel
        label="Number / Shrink Case"
        caption="Focused on the large-to-small reflow case we just tuned."
        text={shrinkBalances[shrinkBalanceIndex]}
        onPress={cycleShrinkBalance}
        buttonTitle="Next Shrink Case"
        variant="number"
        animationPreset="snappy"
      />

      <ExamplePanel
        label="Number / Percent"
        caption="Prefix and suffix characters around a changing numeric core."
        text={growthRates[growthIndex]}
        onPress={cycleGrowth}
        buttonTitle="Next Percent"
        variant="number"
        animationPreset="smooth"
      />

      <ExamplePanel
        label="Number / Latency"
        caption="Comma grouping and unit suffixes with the bouncy preset."
        text={latencies[latencyIndex]}
        onPress={cycleLatency}
        buttonTitle="Next Latency"
        variant="number"
        animationPreset="bouncy"
      />
    </ScrollView>
  );
}
