import React from "react";
import { Laminar } from "react-native-laminar";
import { showcaseTextStyle, teachingDurationMs } from "../shared";

export function NoProbeDigit({ value }: { readonly value: string }) {
  return (
    <Laminar
      key={value}
      text={value}
      variant="text"
      animationDuration={teachingDurationMs}
      animationPreset="default"
      autoSize
      clipToBounds={false}
      fontSize={62}
      stagger={0}
      containerStyle={{ alignSelf: "center" }}
      style={[showcaseTextStyle, { fontSize: 62, fontVariant: ["tabular-nums"] }]}
    />
  );
}
