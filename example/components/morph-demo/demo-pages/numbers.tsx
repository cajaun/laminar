import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, sameMetrics, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";

function NumbersPage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <Laminar
          text={state.numberValue}
          variant="number"
          animationPreset="snappy"
          fontSize={state.fontSize}
          clipToBounds={false}
          containerStyle={{ alignSelf: "center" }}
          style={{ color: "#000000", fontFamily: "Sf-semibold", fontSize: state.fontSize, fontVariant: ["tabular-nums"], textAlign: "center" }}
        />
      }
      settings={
        <>
          {settingsRow({ label: "Number", value: state.numberValue, onPress: state.cycleNumber })}
          {settingsRow({ label: "Reverse", value: state.previousNumberValue })}
          {settingsRow({ label: "Morph", value: state.nextNumberValue })}
        </>
      }
    />
  );
}

export const NumbersDemoPage = React.memo(
  NumbersPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.numberValue === next.state.numberValue &&
    previous.state.previousNumberValue === next.state.previousNumberValue &&
    previous.state.nextNumberValue === next.state.nextNumberValue &&
    previous.state.cycleNumber === next.state.cycleNumber
);
