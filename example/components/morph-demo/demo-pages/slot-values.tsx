import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, sameMetrics, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";

function SlotValuesPage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <Laminar
          text={state.slotValue}
          variant="slots"
          animationPreset="smooth"
          autoSize
          clipToBounds={false}
          fontSize={state.fontSize}
          containerStyle={{ alignSelf: "center" }}
          style={{ color: "#000000", fontFamily: "Sf-semibold", fontSize: state.fontSize, fontVariant: ["tabular-nums"], textAlign: "center" }}
        />
      }
      settings={
        <>
          {settingsRow({ label: "Slot Value", value: state.slotValue, onPress: state.cycleSlots })}
          {settingsRow({ label: "Reverse", value: state.previousSlotValue })}
          {settingsRow({ label: "Morph", value: state.nextSlotValue })}
        </>
      }
    />
  );
}

export const SlotValuesDemoPage = React.memo(
  SlotValuesPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.slotValue === next.state.slotValue &&
    previous.state.previousSlotValue === next.state.previousSlotValue &&
    previous.state.nextSlotValue === next.state.nextSlotValue &&
    previous.state.cycleSlots === next.state.cycleSlots
);
