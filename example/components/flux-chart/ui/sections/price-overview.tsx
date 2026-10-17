import React from "react";
import { Text, View } from "react-native";
import type { RangeMeta } from "@/components/flux-chart/data/chart-data";
import type { FluxAsset } from "@/components/flux-chart/ui/assets/asset-config";
import { REFERENCE_GREEN } from "@/components/flux-chart/core/model/chart-config";
import {
  formatPercent,
} from "@/components/flux-chart/core/model/chart-formatters";
import { getCursorDisplayPercent } from "@/components/flux-chart/core/model/cursor-values";
import { SFIcon } from "@/components/flux-chart/ui/primitives/sf-icon";

type PriceOverviewProps = {
  asset: FluxAsset;
  displayValue: number;
  meta: RangeMeta;
  priceFractionDigits: number;
  width: number;
};

export function PriceOverview({
  asset,
  displayValue,
  meta,
  priceFractionDigits,
  width,
}: PriceOverviewProps) {
  const displayPercentChange = getCursorDisplayPercent(
    meta.percentChange,
    meta.totalValue,
    displayValue,
  );
  const percentText = formatPercent(displayPercentChange);
  const priceText = `$${displayValue.toLocaleString("en-US", {
    minimumFractionDigits: priceFractionDigits,
    maximumFractionDigits: priceFractionDigits,
  })}`;
  const priceTextStyle = {
    color: "#111318",
    fontFamily: "Sf-bold",
    fontWeight: "700" as const,
    lineHeight: 36,
  };

  return (
    <View
      className="mt-6 flex-row items-end justify-between"
      style={{ width }}
    >
      <View>
        <View className="mb-0.5 flex-row items-center gap-2">
          <Text className="font-sf-bold text-[30px] leading-9 text-[#1D1D1F]">
            Ethereum
          </Text>
          {asset === "ethereum" ? (
            <SFIcon
              name="checkmark.seal.fill"
              size={31}
              color="#4CAEFF"
              weight="bold"
              fallback="✓"
              fallbackSize={25}
            />
          ) : null}
        </View>
        <Text
          className="font-sf-bold text-[30px] leading-9 tracking-[-1.5px]"
          style={priceTextStyle}
        >
          {priceText}
        </Text>
      </View>
      <View className="items-end pb-1.25">
        <View className="h-7.5 w-27.5 flex-row items-center justify-end gap-1">
          <SFIcon
            name="arrow.up"
            size={28}
            color={REFERENCE_GREEN}
            weight="bold"
            fallback="↑"
            fallbackSize={28}
          />
          <Text
            className="font-sf-bold text-[24px] leading-7.5 tracking-[-1.5px]"
            style={{
              color: REFERENCE_GREEN,
              fontFamily: "Sf-bold",
              fontWeight: "700",
              lineHeight: 30,
            }}
          >
            {percentText}
          </Text>
        </View>
      </View>
    </View>
  );
}
