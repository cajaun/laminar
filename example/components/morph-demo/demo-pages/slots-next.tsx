import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import { useSlotsDemoState } from "../use-demo-state";

function SlotsNextPage({ height, width }: DemoPageProps) {
  const state = useSlotsDemoState();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={state.fontSize}
      onReverse={state.reverse}
      onMorph={state.morph}
      preview={
        <Laminar
          text={state.numberValue}
          variant="slots"
          animationPreset="smooth"
          shadow={{ color: "#FFFFFF", size: 12 }}
          autoSize
          clipToBounds={false}
          fontSize={state.fontSize}
          containerStyle={{ alignSelf: "center" }}
          style={{
            color: "#000000",
            fontFamily: "Sf-semibold",
            fontSize: state.fontSize,
            fontVariant: ["tabular-nums"],
            textAlign: "center",
          }}
        />
      }
      settings={
        <>
          {settingsRow({ label: "Number", value: state.numberValue, onPress: state.cycleNumber })}
          {settingsRow({ label: "Reverse", value: state.previousNumberValue })}
          {settingsRow({ label: "Next", value: state.nextNumberValue })}
        </>
      }
    />
  );
}

export const SlotsNextDemoPage = React.memo(SlotsNextPage);
