import React from "react";
import { Text, View } from "react-native";
import type { FluxAsset } from "@/components/flux-chart/ui/assets/asset-config";
import { FLUX_ASSET_CONFIG } from "@/components/flux-chart/ui/assets/asset-config";
import { EthereumIcon } from "@/components/flux-chart/ui/assets/ethereum-icon";

type PortfolioSummaryProps = {
  asset: FluxAsset;
  width: number;
};

function PortfolioSummaryComponent({ asset, width }: PortfolioSummaryProps) {
  const assetConfig = FLUX_ASSET_CONFIG[asset];

  return (
    <View
      className="mt-6 h-14 flex-row items-center justify-around"
      style={{ width }}
    >
      <View className="flex-1 items-center gap-1">
        <Text className="font-sf-medium text-[20px] leading-6 text-[#999999]">
          Balance
        </Text>
        <View className="flex-row items-center gap-2">
          <EthereumIcon size={16} />
          <Text className="font-sf-bold text-[23px] leading-7 text-[#111318]">
            {assetConfig.balance}
          </Text>
        </View>
      </View>

      <View className="h-12 w-[0.5px] bg-[#F5F5F5]" />

      <View className="flex-1 items-center gap-1">
        <Text className="font-sf-medium text-[20px] leading-6 text-[#999999]">
          Value
        </Text>
        <Text className="font-sf-bold text-[23px] leading-7 text-[#111318]">
          {assetConfig.value}
        </Text>
      </View>
    </View>
  );
}

export const PortfolioSummary = React.memo(PortfolioSummaryComponent);
