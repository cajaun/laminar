import React from "react";
import { Text } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  MechanismFrame,
  settingsRow,
  TeachingLabel,
  sameMetrics,
  showcaseTextStyle,
  teachingDurationMs,
} from "./shared";
import { NoLcsLaminar } from "./illustrations";
import type { DemoPageProps } from "./types";

function TextIdentityPage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <>
          <Laminar
            text={state.textIdentityWord}
            animationDuration={teachingDurationMs}
            animationPreset="default"
            autoSize
            clipToBounds={false}
            fontSize={56}
            stagger={0.04}
            containerStyle={{ alignSelf: "center" }}
            style={[showcaseTextStyle, { fontSize: 56 }]}
          />
          <TeachingLabel>matching glyphs hold position with LCS</TeachingLabel>
          <MechanismFrame>
            <Text style={{ color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>
              without LCS
            </Text>
            <NoLcsLaminar
              text={state.textIdentityWord}
              animationDuration={teachingDurationMs}
              animationPreset="default"
              autoSize
              clipToBounds={false}
              fontSize={56}
              stagger={0.04}
              containerStyle={{ alignSelf: "center" }}
              style={[showcaseTextStyle, { fontSize: 56 }]}
            />
          </MechanismFrame>
        </>
      }
      settings={
        <>
          {settingsRow({ label: "Text", value: state.textIdentityWord, onPress: state.morph })}
          {settingsRow({ label: "Identity", value: "LCS" })}
          {settingsRow({ label: "Speed", value: "Readable" })}
        </>
      }
    />
  );
}

export const TextIdentityDemoPage = React.memo(
  TextIdentityPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.textIdentityWord === next.state.textIdentityWord &&
    previous.state.morph === next.state.morph
);
