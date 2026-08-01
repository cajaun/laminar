import React from "react";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  settingsRow,
  TeachingLabel,
  sameMetrics,
  showcaseTextStyle,
  teachingDurationMs,
} from "./shared";
import { LaneStrip } from "./illustrations";
import type { DemoPageProps } from "./types";

function NumberIdentityPage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <>
          <Laminar
            text={state.numberLaneValue}
            variant="number"
            animationDuration={teachingDurationMs}
            animationPreset="snappy"
            autoSize
            clipToBounds={false}
            fontSize={54}
            stagger={0}
            containerStyle={{ alignSelf: "center" }}
            style={[showcaseTextStyle, { fontSize: 54, fontVariant: ["tabular-nums"] }]}
          />
          <TeachingLabel>place value starts with fixed lanes</TeachingLabel>
          <LaneStrip value={state.numberLaneValue} />
        </>
      }
      settings={
        <>
          {settingsRow({ label: "Number", value: state.numberLaneValue, onPress: state.morph })}
          {settingsRow({ label: "Direction", value: "Up / Down" })}
          {settingsRow({ label: "Lanes", value: "Fixed width" })}
        </>
      }
    />
  );
}

export const NumberIdentityDemoPage = React.memo(
  NumberIdentityPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.numberLaneValue === next.state.numberLaneValue &&
    previous.state.morph === next.state.morph
);
