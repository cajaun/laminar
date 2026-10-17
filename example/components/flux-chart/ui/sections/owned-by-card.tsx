import React from "react";
import { Text, View } from "react-native";
import type { FluxAsset } from "@/components/flux-chart/ui/assets/asset-config";

type OwnedByCardProps = {
  asset: FluxAsset;
  width: number;
};

function OwnedByCardComponent({ asset, width }: OwnedByCardProps) {
  return (
    <View
      className="mt-6 h-11 flex-row items-center justify-center gap-2 rounded-2xl bg-[#F6F7F9]"
      style={{ width }}
    >
      <Text className="font-sf-medium text-[18px] text-[#8E8E93]">
        Owned by
      </Text>
      <View className="h-5 w-5 items-center justify-center rounded-full bg-[#ACD7FC]">
        <View className="relative h-2 w-3 rounded-xs bg-[#3880F7]">
          <View className="absolute -right-px top-0.5 h-0.75 w-0.75 rounded-full bg-[#F7CE7A]" />
        </View>
      </View>
      <Text className="font-sf-bold text-[18px] text-[#222222]">
        valmiera.eth
      </Text>
    </View>
  );
}

export const OwnedByCard = React.memo(OwnedByCardComponent);
