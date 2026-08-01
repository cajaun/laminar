import React from "react";
import { Text, View } from "react-native";
import { Laminar } from "react-native-laminar";
import { MechanismFrame, teachingBlue, teachingDurationMs } from "../shared";

function readLaneUnits(value: string) {
  const lead = value.match(/^\D*/)?.[0] ?? "";
  const tailUnits = value.slice(lead.length).split("");

  return {
    lead,
    lanes: [
      ...Array<string>(Math.max(0, 6 - tailUnits.length)).fill(""),
      ...tailUnits,
    ].slice(-6),
  };
}

export function LaneStrip({ value }: { readonly value: string }) {
  const { lead, lanes } = readLaneUnits(value);

  return (
    <MechanismFrame>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
        <View
          style={{
            width: 40,
            height: 42,
            borderRadius: 10,
            borderWidth: lead ? 1 : 0,
            borderStyle: "dashed",
            borderColor: "#c7c7cc",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: lead ? "#f8f8f8" : "transparent",
          }}
        >
          <Text style={{ color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 21 }}>
            {lead}
          </Text>
        </View>

        {lanes.map((unit, index) => (
          <View
            key={`lane:${index}`}
            style={{
              width: 40,
              height: 42,
              borderRadius: 10,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: teachingBlue,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f7fbff",
            }}
          >
            <Laminar
              text={unit}
              variant="number"
              animationDuration={teachingDurationMs}
              animationPreset="snappy"
              autoSize={false}
              clipToBounds={false}
              fontSize={22}
              stagger={0}
              containerStyle={{ alignSelf: "center" }}
              style={{
                color: unit ? "#1c1c1e" : "#c7c7cc",
                fontFamily: "Sf-semibold",
                fontSize: 22,
                fontVariant: ["tabular-nums"],
                textAlign: "center",
              }}
            />
          </View>
        ))}
      </View>
      <Text style={{ marginTop: 8, color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 15, textAlign: "center" }}>
        right edge stays fixed
      </Text>
    </MechanismFrame>
  );
}
