import React from "react";
import { Text, View } from "react-native";
import type { FluxAsset } from "@/components/flux-chart/ui/assets/asset-config";

type OwnedByCardProps = {
  asset: FluxAsset;
  width: number;
};

function OwnedByCardComponent({ asset, width }: OwnedByCardProps) {
  if (asset === "usdc") {
    return (
      <View
        className="mt-6 h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E6E6E6] bg-white"
        style={{ width }}
      >
        <Text className="font-sf-medium text-[18px] text-[#8E8E93]">
          Owned by
        </Text>
        <View className="h-5.5 w-5.5 items-center justify-center rounded-full bg-[#B98961]">
          <Text className="text-[11px]">🧑🏽</Text>
        </View>
        <Text className="font-sf-bold text-[18px] text-[#171A20]">You</Text>
      </View>
    );
  }

  return (
    <View
      className="mt-6 h-11 flex-row items-center justify-center gap-2 rounded-2xl bg-[#F6F7F9]"
      style={{ width }}
    >
      <Text className="font-sf-medium text-[18px] text-[#8E8E93]">
        Owned by
      </Text>
      <View className="h-7 w-7 items-center justify-center rounded-full bg-[#8DE5F1]">
        <View className="relative h-1.75 w-2.25 rounded-xs bg-[#4CAEFF]">
          <View className="absolute -right-px top-0.5 h-0.75 w-0.75 rounded-full bg-[#F5CB45]" />
        </View>
      </View>
      <Text className="font-sf-bold text-[18px] text-[#171A20]">
        valmiera.eth
      </Text>
    </View>
  );
}

export const OwnedByCard = React.memo(OwnedByCardComponent);
