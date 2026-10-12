import React from "react";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  settingsRow,
  TeachingLabel,
  showcaseTextStyle,
  teachingDurationMs,
  teachingBlue,
} from "./shared";
import { AutoSizeComparison } from "./illustrations";
import type { DemoPageProps } from "./types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useAutoSizeDemoState,
} from "../use-demo-state";

function AutoSizePage({ height, width }: DemoPageProps) {
  const state = useAutoSizeDemoState();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={state.reverse}
      onMorph={state.morph}
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

export const AutoSizeDemoPage = React.memo(AutoSizePage);
