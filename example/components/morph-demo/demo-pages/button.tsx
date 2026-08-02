import React from "react";
import { Laminar } from "react-native-laminar";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { DemoPageLayout, sameMetrics, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import { SymbolView } from "expo-symbols";

function ButtonPage({ metrics, state }: DemoPageProps) {
  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <PressableScale
          onPress={state.cycleButtonWord}
          style={{
            alignSelf: "center",
            minHeight: state.fontSize * 1.42,
            borderRadius: 36,
            backgroundColor: "#007aff",
            paddingHorizontal: state.fontSize * 0.72,
            paddingVertical: state.fontSize * 0.22,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Laminar
            text={state.buttonWord}
            autoSize
            leading={{
              "Sending Request": (
                <SymbolView name="faceid" size={23} tintColor="#ffffff" />
              ),
              "Request Sent!": (
                <SymbolView
                  name="checkmark.circle.fill"
                  size={23}
                  tintColor="#ffffff"
                />
              ),
            }}
            leadingGap={4}
            animationPreset="default"
            clipToBounds={false}
            style={{
              color: "#ffffff",
              fontFamily: "Sf-semibold",
              fontSize: 32,
            }}
          />
        </PressableScale>
      }
      settings={
        <>
          {settingsRow({
            label: "Button Text",
            value: state.buttonWord,
            onPress: state.cycleButtonWord,
          })}
          {settingsRow({ label: "Surface", value: "Pressable" })}
          {settingsRow({ label: "Auto Size", value: "On" })}
        </>
      }
    />
  );
}

export const ButtonDemoPage = React.memo(
  ButtonPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.buttonWord === next.state.buttonWord &&
    previous.state.fontSize === next.state.fontSize &&
    previous.state.cycleButtonWord === next.state.cycleButtonWord,
);
