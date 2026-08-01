import React from "react";
import { Laminar } from "react-native-laminar";
import { PreviewStage } from "../demo-chrome";
import { sameMetrics } from "./shared";
import type { DemoPageProps } from "./types";
import { Pressable, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { PressableScale } from "@/shared/ui/pressable-scale";

function ConfirmationPage({ metrics, state }: DemoPageProps) {
  return (
    <PreviewStage metrics={metrics}>
      <View
        style={{
          width: "70%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PressableScale
          onPress={state.cycleConfirmation}
          className="rounded-full"
          style={{
            alignSelf: "center",
            backgroundColor: "#000000",
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            borderCurve: "continuous",
          }}
        >
          <Laminar
            text={state.confirmationWord}
            leading={
              state.confirmationWord === "Confirm" ? (
                <SymbolView
                  name="faceid"
                  size={23}
                  tintColor="#ffffff"
                />
              ) : undefined
            }
            leadingGap={5}
            autoSize={false}
            align="center"
            animationPreset="default"
            clipToBounds={false}
            containerStyle={{ width: "100%" }}
            style={{
              color: "#ffffff",
              fontFamily: "Sf-bold",
              textAlign: "center",
            }}
            className="text-2xl"
          />
        </PressableScale>
      </View>
    </PreviewStage>
  );
}

export const ConfirmationDemoPage = React.memo(
  ConfirmationPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.confirmationWord === next.state.confirmationWord &&
    previous.state.fontSize === next.state.fontSize &&
    previous.state.cycleConfirmation === next.state.cycleConfirmation,
);
