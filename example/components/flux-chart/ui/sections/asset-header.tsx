import React from "react";
import { View } from "react-native";
import type { FluxAsset } from "@/components/flux-chart/ui/assets/asset-config";
import { EthereumIcon } from "@/components/flux-chart/ui/assets/ethereum-icon";
import { SFIcon } from "@/components/flux-chart/ui/primitives/sf-icon";
import { UsdcIcon } from "@/components/flux-chart/ui/assets/usdc-icon";

type AssetHeaderProps = {
  asset: FluxAsset;
  width: number;
};

function AssetHeaderComponent({ asset, width }: AssetHeaderProps) {
  return (
    <View className="max-w-140" style={{ width }}>
      <View className="h-1 w-9 self-center rounded-full bg-[#E4E7EB]" />
      <View className="mt-5.5 flex-row items-center justify-between">
        <View className="h-13.5 w-13.5 items-center justify-center rounded-full bg-white p-1">
          {asset === "usdc" ? <UsdcIcon /> : <EthereumIcon />}
        </View>
        <View className="flex-row items-center gap-4">
          <SFIcon
            name="star.fill"
            size={31}
            color="#E1E4E8"
            weight="medium"
            fallback="★"
          />
          <SFIcon
            name="ellipsis"
            size={26}
            color="#A3A3A3"
            weight="bold"
            fallback="•••"
            fallbackSize={16}
          />
        </View>
      </View>
    </View>
  );
}

export const AssetHeader = React.memo(AssetHeaderComponent);
