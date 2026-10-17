import React from "react";
import { Text, View } from "react-native";
import type { MorphingAsset } from "@/components/morphing-chart/ui/assets/asset-config";
import { MORPHING_ASSET_CONFIG } from "@/components/morphing-chart/ui/assets/asset-config";
import { EthereumIcon } from "@/components/morphing-chart/ui/assets/ethereum-icon";
import { useMorphingChartTheme } from "@/components/morphing-chart/ui/morphing-chart-theme";

type PortfolioSummaryProps = {
  asset: MorphingAsset;
  width: number;
};

function PortfolioSummaryComponent({ asset, width }: PortfolioSummaryProps) {
  const assetConfig = MORPHING_ASSET_CONFIG[asset];
  const theme = useMorphingChartTheme();

  return (
    <View
      className="mt-6 h-14 flex-row items-center justify-around"
      style={{ width }}
    >
      <View className="flex-1 items-center gap-1">
        <Text
          className="font-sf-medium text-[20px] leading-6"
          style={{ color: theme.secondary }}
        >
          Balance
        </Text>
        <View className="flex-row items-center gap-2">
          <EthereumIcon size={16} />
          <Text
            className="font-sf-bold text-[23px] leading-7"
            style={{ color: theme.primary }}
          >
            {assetConfig.balance}
          </Text>
        </View>
      </View>

      <View
        className="h-12 w-[0.5px]"
        style={{ backgroundColor: theme.divider }}
      />

      <View className="flex-1 items-center gap-1">
        <Text
          className="font-sf-medium text-[20px] leading-6"
          style={{ color: theme.secondary }}
        >
          Value
        </Text>
        <Text
          className="font-sf-bold text-[23px] leading-7"
          style={{ color: theme.primary }}
        >
          {assetConfig.value}
        </Text>
      </View>
    </View>
  );
}

export const PortfolioSummary = React.memo(PortfolioSummaryComponent);
