import React from "react";
import { Pressable, Text, View } from "react-native";

type UsdcActionsProps = {
  width: number;
};

function UsdcActionsComponent({ width }: UsdcActionsProps) {
  return (
    <View className="mt-7 flex-row gap-5" style={{ width }}>
      {(["Swap", "Send"] as const).map((label) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          className="h-14 flex-1 items-center justify-center rounded-full bg-[#2F86D8]"
          style={({ pressed }) => (pressed ? { opacity: 0.75 } : undefined)}
        >
          <Text className="font-sf-semibold text-[21px] text-white">
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export const UsdcActions = React.memo(UsdcActionsComponent);
