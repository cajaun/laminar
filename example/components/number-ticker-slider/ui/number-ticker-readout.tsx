import React from "react";
import { View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Laminar } from "react-native-laminar";
import { useCyclicValueStoreSnapshot } from "@/components/morph-demo/use-demo-state";
import type { NumberTickerStore } from "../core/types";

type NumberTickerReadoutProps = {
  readonly store: NumberTickerStore;
  readonly width: number;
  readonly isDark: boolean;
};

export const NumberTickerReadout = React.memo(function NumberTickerReadout({
  store,
  width,
  isDark,
}: NumberTickerReadoutProps) {
  const state = useCyclicValueStoreSnapshot(store);
  const fontSize = Math.min(66, Math.max(48, width * 0.164));

  return (
    <MaskedView
      style={{ width: "100%", height: fontSize * 1.5 }}
      maskElement={
        <View
          collapsable={false}
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Laminar
            text={state.value}
            variant="number"
            numberMode="ticker"
            animationPreset="ticker"
            fractionScale={0.66}
            fontSize={70}
            autoSize
            align="center"
            containerStyle={{ alignSelf: "center" }}
            style={{
              color: "black",
              fontFamily: "Sf-bold",
              textAlign: "center",
            }}
          />
        </View>
      }
    >
      <LinearGradient
        colors={
          isDark
            ? ["#B4D2FF", "#A6AFFA", "#998DFF"]
            : ["#0787F9", "#4187F7", "#8F83FF"]
        }
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: "100%", height: "100%" }}
      />
    </MaskedView>
  );
});
