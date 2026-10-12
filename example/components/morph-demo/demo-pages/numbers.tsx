import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import { useNumbersDemoState } from "../use-demo-state";

function NumbersPage({ height, width }: DemoPageProps) {
  const state = useNumbersDemoState();

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
          variant="number"
          animationPreset="default"
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

export const NumbersDemoPage = React.memo(NumbersPage);
