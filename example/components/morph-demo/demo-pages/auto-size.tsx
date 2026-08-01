import React from "react";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  settingsRow,
  TeachingLabel,
  sameMetrics,
  showcaseTextStyle,
  teachingDurationMs,
  teachingBlue,
} from "./shared";
import { AutoSizeComparison } from "./illustrations";
import type { DemoPageProps } from "./types";

function AutoSizePage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <>
          <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: teachingBlue, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 12 }}>
            <Laminar
              text={state.autoSizeValue}
              animationDuration={teachingDurationMs}
              animationPreset="smooth"
              autoSize
              clipToBounds={false}
              fontSize={32}
              stagger={0.035}
              style={[showcaseTextStyle, { fontSize: 32 }]}
            />
          </View>
          <TeachingLabel>autoSize animates this dashed border</TeachingLabel>
          <AutoSizeComparison value={state.autoSizeValue} />
        </>
      }
      settings={
        <>
          {settingsRow({ label: "String", value: state.autoSizeValue, onPress: state.morph })}
          {settingsRow({ label: "Auto Size", value: "On" })}
          {settingsRow({ label: "Container", value: "Measured" })}
        </>
      }
    />
  );
}

export const AutoSizeDemoPage = React.memo(
  AutoSizePage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.autoSizeValue === next.state.autoSizeValue &&
    previous.state.morph === next.state.morph
);
