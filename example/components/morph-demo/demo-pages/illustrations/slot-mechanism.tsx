import React from "react";
import { Text, View } from "react-native";
import { MechanismFrame, TeachingLabel, teachingBlue } from "../shared";

function slotDigits(value: string) {
  return value.replace(/\D/g, "").slice(-4).padStart(4, " ").split("");
}

type SlotMechanismProps = {
  readonly current: string;
  readonly previous: string;
  readonly next: string;
};

export function SlotMechanism({ current, previous, next }: SlotMechanismProps) {
  const currentDigits = slotDigits(current);
  const previousDigits = slotDigits(previous);
  const nextDigits = slotDigits(next);

  return (
    <MechanismFrame>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1.5, borderStyle: "dashed", borderColor: teachingBlue, borderRadius: 16, backgroundColor: "#f7fbff" }}>
        <Text style={{ color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 20 }}>$</Text>
        {currentDigits.map((digit, index) => (
          <View key={`slot:${index}`} style={{ width: 30, height: 58, overflow: "hidden", borderWidth: 1, borderStyle: "dashed", borderColor: teachingBlue, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }}>
            <Text style={{ height: 18, color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 14 }}>{nextDigits[index]}</Text>
            <View style={{ width: "100%", height: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#eaf4ff" }}>
              <Text style={{ color: "#1c1c1e", fontFamily: "Sf-semibold", fontSize: 18 }}>{digit}</Text>
            </View>
            <Text style={{ height: 18, color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 14 }}>{previousDigits[index]}</Text>
          </View>
        ))}
      </View>
      <TeachingLabel>one reel rolls inside each digit slot</TeachingLabel>
      <Text style={{ marginTop: 6, color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 15, textAlign: "center" }}>
        the highlighted row is the current value
      </Text>
    </MechanismFrame>
  );
}
