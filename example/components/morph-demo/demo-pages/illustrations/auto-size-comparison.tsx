import React from "react";
import { Text, View } from "react-native";
import { Laminar } from "react-native-laminar";
import { MechanismFrame, teachingDurationMs } from "../shared";

export function AutoSizeComparison({ value }: { readonly value: string }) {
  return (
    <MechanismFrame>
      <View style={{ alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ width: 32, color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 16, textAlign: "right" }}>
            off
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "#c7c7cc",
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 7,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Laminar
              text={value}
              animationDuration={teachingDurationMs}
              animationPreset="smooth"
              autoSize={false}
              clipToBounds={false}
              fontSize={17}
              stagger={0}
              containerStyle={{ alignSelf: "center" }}
              style={{ color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 17, textAlign: "center" }}
            />
          </View>
        </View>
      </View>
    </MechanismFrame>
  );
}
