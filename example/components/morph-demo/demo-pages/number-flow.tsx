import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useNumberFlowDemoState,
} from "../use-demo-state";

function NumberFlowPage({ height, width }: DemoPageProps) {
  const state = useNumberFlowDemoState();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={state.reverse}
      onMorph={state.morph}
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

export const NumberFlowDemoPage = React.memo(NumberFlowPage);
