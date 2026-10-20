import React from "react";
import { Text, View } from "react-native";
import type { NumberTickerStore } from "../core/types";
import { NumberTickerReadout } from "./number-ticker-readout";

type EarningsSummaryProps = {
  readonly store: NumberTickerStore;
  readonly width: number;
  readonly isDark: boolean;
  readonly secondaryColor: string;
};

export const EarningsSummary = React.memo(function EarningsSummary({
  store,
  width,
  isDark,
  secondaryColor,
}: EarningsSummaryProps) {
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          marginTop: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: secondaryColor,
            fontFamily: "Sf-bold",
            fontSize: 20,
            lineHeight: 26,
          }}
        >
          Start Earning 6.00%
        </Text>
        <View
          style={{
            marginLeft: 8,
            width: 16,
            height: 16,
            borderRadius: 8,
            borderWidth: 1.7,
            borderColor: secondaryColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: secondaryColor,
              fontFamily: "Sf-bold",
              fontSize: 11,
              lineHeight: 14,
            }}
          >
            i
          </Text>
        </View>
      </View>

      <View style={{ width: "100%", marginTop: 17 }}>
        <NumberTickerReadout store={store} width={width} isDark={isDark} />
      </View>

      <Text
        style={{
          marginTop: 9,
          color: secondaryColor,
          fontFamily: "Sf-semibold",
          fontSize: 18,
          lineHeight: 24,
          textAlign: "center",
        }}
      >
        Estimated Value in 27 Years
      </Text>
    </View>
  );
});
