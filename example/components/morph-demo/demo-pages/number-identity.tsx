import React from "react";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  settingsRow,
  TeachingLabel,
  showcaseTextStyle,
  teachingDurationMs,
} from "./shared";
import { LaneStrip } from "./illustrations";
import type { DemoPageProps } from "./types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useNumberIdentityDemoState,
} from "../use-demo-state";

function NumberIdentityPage({ height, width }: DemoPageProps) {
  const state = useNumberIdentityDemoState();

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
            text={state.numberLaneValue}
            variant="number"
            animationDuration={teachingDurationMs}
            animationPreset="snappy"
            autoSize
            clipToBounds={false}
            fontSize={54}
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

export const NumberIdentityDemoPage = React.memo(NumberIdentityPage);
