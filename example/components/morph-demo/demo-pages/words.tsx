import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import { useWordsDemoState } from "../use-demo-state";

function WordsPage({ height, width }: DemoPageProps) {
  const state = useWordsDemoState();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={state.fontSize}
      onReverse={state.reverse}
      onMorph={state.morph}
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

export const WordsDemoPage = React.memo(WordsPage);
