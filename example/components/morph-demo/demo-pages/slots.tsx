import React from "react";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  TeachingLabel,
  sameMetrics,
  settingsRow,
} from "./shared";
import { SlotMechanism } from "./illustrations";
import type { DemoPageProps } from "./types";

function SlotsPage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <>
          <Laminar
            text={state.numberValue}
            variant="slots"
            animationPreset="smooth"
            autoSize
            clipToBounds={false}
            fontSize={state.fontSize}
            containerStyle={{ alignSelf: "center" }}
            style={{ color: "#000000", fontFamily: "Sf-semibold", fontSize: state.fontSize, fontVariant: ["tabular-nums"], textAlign: "center" }}
          />
          <TeachingLabel>slot columns preserve each digit's vertical window</TeachingLabel>
          <SlotMechanism
            current={state.numberValue}
            previous={state.previousNumberValue}
            next={state.nextNumberValue}
          />
        </>
      }
      settings={
        <>
          {settingsRow({ label: "Slots", value: state.numberValue, onPress: state.cycleNumber })}
          {settingsRow({ label: "Reverse", value: state.previousNumberValue })}
          {settingsRow({ label: "Morph", value: state.nextNumberValue })}
        </>
      }
    />
  );
}

export const SlotsDemoPage = React.memo(
  SlotsPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.numberValue === next.state.numberValue &&
    previous.state.previousNumberValue === next.state.previousNumberValue &&
    previous.state.nextNumberValue === next.state.nextNumberValue &&
    previous.state.cycleNumber === next.state.cycleNumber
);
