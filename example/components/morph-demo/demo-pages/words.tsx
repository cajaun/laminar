import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, sameMetrics, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";

function WordsPage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <Laminar
          text={state.standaloneWord}
          autoSize={false}
          animationPreset="smooth"
          fontSize={state.fontSize}
          clipToBounds={false}
          align="center"
          style={{ color: "#000000", fontFamily: state.fontWeight.fontFamily, fontSize: state.fontSize }}
        />
      }
      settings={
        <>
          {settingsRow({ label: "Word", value: state.standaloneWord, onPress: state.cycleStandaloneWord })}
          {settingsRow({ label: "Variant", value: "Text" })}
          {settingsRow({ label: "Auto Size", value: "Off" })}
        </>
      }
    />
  );
}

export const WordsDemoPage = React.memo(
  WordsPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.standaloneWord === next.state.standaloneWord &&
    previous.state.fontSize === next.state.fontSize &&
    previous.state.fontWeight === next.state.fontWeight &&
    previous.state.cycleStandaloneWord === next.state.cycleStandaloneWord
);
