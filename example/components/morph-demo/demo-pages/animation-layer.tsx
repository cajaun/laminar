import React from "react";
import { Text, View } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  MechanismFrame,
  settingsRow,
  TeachingLabel,
  sameMetrics,
  showcaseTextStyle,
  teachingBlue,
  teachingDurationMs,
} from "./shared";
import { NoProbeDigit } from "./illustrations";
import type { DemoPageProps } from "./types";

function AnimationLayerPage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <>
          <View style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: teachingBlue, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#f7fbff" }}>
            <Laminar
              text={state.animationLayerValue}
              variant="number"
              animationDuration={teachingDurationMs}
              animationPreset="default"
              autoSize
              clipToBounds={false}
              fontSize={62}
              stagger={0}
              containerStyle={{ alignSelf: "center" }}
              style={[showcaseTextStyle, { fontSize: 62, fontVariant: ["tabular-nums"] }]}
            />
          </View>
          <TeachingLabel>probe token holds the lane width during swap</TeachingLabel>
          <MechanismFrame>
            <Text style={{ color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>
              without probe
            </Text>
            <View style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: "#c7c7cc", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10 }}>
              <NoProbeDigit value={state.animationLayerValue} />
            </View>
          </MechanismFrame>
        </>
      }
      settings={
        <>
          {settingsRow({ label: "Digit", value: state.animationLayerValue, onPress: state.morph })}
          {settingsRow({ label: "Layer", value: "Space + digit" })}
          {settingsRow({ label: "Speed", value: "Readable" })}
        </>
      }
    />
  );
}

export const AnimationLayerDemoPage = React.memo(
  AnimationLayerPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.animationLayerValue === next.state.animationLayerValue &&
    previous.state.morph === next.state.morph
);
