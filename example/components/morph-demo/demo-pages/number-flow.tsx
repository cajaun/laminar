import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, sameMetrics, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";

function NumberFlowPage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <>
          <Laminar
            text={state.numberFlowValue}
            variant="number"
            numberMode="ticker"
            fontSize={32}
            autoSize
            align="left"
            style={{
              color: "#000000",
              fontFamily: "Sf-semibold",
            }}
          />
        </>
      }
      settings={
        <>
          {settingsRow({
            label: "Number Flow",
            value: state.numberFlowValue,
            onPress: state.cycleNumberFlow,
          })}
          {settingsRow({
            label: "Reverse",
            value: state.previousNumberFlowValue,
          })}
          {settingsRow({ label: "Next", value: state.nextNumberFlowValue })}
        </>
      }
    />
  );
}

export const NumberFlowDemoPage = React.memo(
  NumberFlowPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.numberFlowValue === next.state.numberFlowValue &&
    previous.state.previousNumberFlowValue ===
      next.state.previousNumberFlowValue &&
    previous.state.nextNumberFlowValue === next.state.nextNumberFlowValue &&
    previous.state.cycleNumberFlow === next.state.cycleNumberFlow
);
