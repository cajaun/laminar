import React from "react";
import { Text, View } from "react-native";
import type { FluxAsset } from "@/components/flux-chart/ui/assets/asset-config";
import { REFERENCE_GRAY } from "@/components/flux-chart/core/model/chart-config";
import { EthereumIcon } from "@/components/flux-chart/ui/assets/ethereum-icon";
import { SFIcon } from "@/components/flux-chart/ui/primitives/sf-icon";
import { UsdcIcon } from "@/components/flux-chart/ui/assets/usdc-icon";

type PortfolioSummaryProps = {
  asset: FluxAsset;
  width: number;
};

function PortfolioSummaryComponent({ asset, width }: PortfolioSummaryProps) {
  return (
    <>
      <View className="mt-2.5 min-h-21.5 flex-row items-center justify-around" style={{ width }}>
        <View className="flex-1 items-center gap-2">
          <View className="flex-row items-center gap-1.5">
            <Text className="font-sf-medium text-[20px] leading-6 text-[#8E8E93]">
              Balance
            </Text>
            <View className="relative h-5.75 w-9.5">
              <View className="absolute left-0 top-0 z-10">
                <EthereumIcon size={23} />
              </View>
              {asset === "usdc" ? (
                <View className="absolute left-3 top-0 z-0">
                  <UsdcIcon size={23} />
                </View>
              ) : (
                <View className="absolute left-3 top-0 h-5.75 w-5.75 items-center justify-center rounded-full bg-[#243855]">
                  <View className="h-3 w-2.5 rotate-[-18deg] rounded-xs border-2 border-[#4CAEFF]" />
                </View>
              )}
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            {asset === "usdc" ? <UsdcIcon size={22} /> : <EthereumIcon size={22} />}
            <Text className="font-sf-bold text-[23px] leading-7 text-[#111318]">
              {asset === "usdc" ? "19.491" : "0.01017"}
            </Text>
          </View>
        </View>

        <View className="h-14.5 w-[0.5px] bg-[#ECEFF2]" />

        <View className="flex-1 items-center gap-2">
          <Text className="font-sf-medium text-[20px] leading-6 text-[#8E8E93]">
            Value
          </Text>
          <Text className="font-sf-bold text-[23px] leading-7 text-[#111318]">
            {asset === "usdc" ? "$19.49" : "$25.45"}
          </Text>
        </View>
      </View>

      <View className="mt-2 flex-row items-center gap-2" style={{ width }}>
        <View className="h-[0.5px] flex-1 bg-[#ECEFF2]" />
        <Text className="font-sf-medium text-[19px] leading-6 text-[#999999]">
          See Breakdown
        </Text>
        <SFIcon
          name="chevron.down"
          size={14}
          color={REFERENCE_GRAY}
          weight="semibold"
          fallback="⌄"
          fallbackSize={14}
        />
        <View className="h-[0.5px] flex-1 bg-[#ECEFF2]" />
      </View>
    </>
  );
}

export const PortfolioSummary = React.memo(PortfolioSummaryComponent);
