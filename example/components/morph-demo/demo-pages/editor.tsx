import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import { useEditorDemoState } from "../use-demo-state";

function EditorPage({ height, width }: DemoPageProps) {
  const state = useEditorDemoState();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={state.fontSize}
      onReverse={state.reverse}
      onMorph={state.morph}
      preview={
        <Laminar
          text={state.editorWord}
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
          {settingsRow({ label: "Word", value: state.editorWord, onPress: state.cycleEditorWord })}
          {settingsRow({ label: "Font Size", value: `${state.fontSize}pt`, onPress: state.cycleFontSize })}
          {settingsRow({ label: "Font Weight", value: state.fontWeight.label, onPress: state.cycleFontWeight })}
        </>
      }
    />
  );
}

export const EditorDemoPage = React.memo(EditorPage);
