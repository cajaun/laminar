import React from "react";
import { View } from "react-native";
import type { MorphingAsset } from "@/components/morphing-chart/ui/assets/asset-config";
import { EthereumIcon } from "@/components/morphing-chart/ui/assets/ethereum-icon";
import { SFIcon } from "@/components/morphing-chart/ui/primitives/sf-icon";
import { useMorphingChartTheme } from "@/components/morphing-chart/ui/morphing-chart-theme";

type AssetHeaderProps = {
  asset: MorphingAsset;
  width: number;
};

function AssetHeaderComponent({ asset, width }: AssetHeaderProps) {
  const theme = useMorphingChartTheme();

  return (
    <View className="max-w-140" style={{ width }}>
      <View
        className="h-[5px] w-9 self-center rounded-full"
        style={{ backgroundColor: theme.headerHandle }}
      />
      <View className="mt-5.5 flex-row items-center justify-between">
        <View
          className="h-13.5 w-13.5 items-center justify-center rounded-full p-1"
          style={{ backgroundColor: theme.background }}
        >
          <EthereumIcon />
        </View>
        <View className="flex-row items-center gap-4">
          <SFIcon
            name="star.fill"
            size={31}
            color={theme.favorite}
            weight="medium"
            fallback="★"
          />
          <SFIcon
            name="ellipsis"
            size={26}
            color={theme.icon}
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
