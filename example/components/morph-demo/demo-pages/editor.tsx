import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, sameMetrics, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";

function EditorPage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
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

export const EditorDemoPage = React.memo(
  EditorPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.editorWord === next.state.editorWord &&
    previous.state.fontSize === next.state.fontSize &&
    previous.state.fontWeight === next.state.fontWeight &&
    previous.state.cycleEditorWord === next.state.cycleEditorWord &&
    previous.state.cycleFontSize === next.state.cycleFontSize &&
    previous.state.cycleFontWeight === next.state.cycleFontWeight
);
