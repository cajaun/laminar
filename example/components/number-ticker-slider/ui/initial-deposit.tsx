import React from "react";
import { Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { AnimatedSlider } from "@/components/animated-slider";

type InitialDepositProps = {
  readonly progress: SharedValue<number>;
  readonly contentWidth: number;
  readonly horizontalInset: number;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly accentColor: string;
  readonly trackColor: string;
};

export const InitialDeposit = React.memo(function InitialDeposit({
  progress,
  contentWidth,
  horizontalInset,
  primaryColor,
  secondaryColor,
  accentColor,
  trackColor,
}: InitialDepositProps) {
  const pickerSize = 35;

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        paddingHorizontal: horizontalInset,
      }}
    >
      <Text
        style={{
          color: secondaryColor,
          fontFamily: "Sf-semibold",
          fontSize: 16,
          lineHeight: 22,
          textAlign: "center",
        }}
      >
        Initial Deposit
      </Text>
      <Text
        style={{
          marginTop: 4,
          color: primaryColor,
          fontFamily: "Sf-bold",
          fontSize: 36,
          lineHeight: 44,
          textAlign: "center",
        }}
      >
        $100,000
      </Text>
      <View style={{ width: "100%", marginTop: 34 }}>
        <AnimatedSlider
          progress={progress}
          initialProgress={0}
          pickerSize={pickerSize}
          color={accentColor}
          trackColor={trackColor}
          style={{
            width: Math.max(0, contentWidth - pickerSize),
            height: 8,
            marginHorizontal: pickerSize / 2,
          }}
        />
      </View>
      <PressableScale
        style={{
          width: "100%",
          height: 52,
          marginTop: 47,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: accentColor,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: "Sf-bold",
            fontSize: 22,
            lineHeight: 28,
          }}
        >
          Add Money
        </Text>
      </PressableScale>
    </View>
  );
});
