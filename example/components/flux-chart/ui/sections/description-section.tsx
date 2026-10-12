import React from "react";
import { Text, View } from "react-native";
import { ETHEREUM_DESCRIPTION_PARAGRAPHS } from "@/components/flux-chart/ui/content";
import { REFERENCE_GRAY } from "@/components/flux-chart/core/model/chart-config";
import { SFIcon } from "@/components/flux-chart/ui/primitives/sf-icon";

type DescriptionSectionProps = {
  width: number;
};

function DescriptionSectionComponent({ width }: DescriptionSectionProps) {
  return (
    <View className="mt-7.5" style={{ width }}>
      <View className="flex-row items-center gap-3">
        <SFIcon
          name="line.3.horizontal"
          size={20}
          color={REFERENCE_GRAY}
          weight="medium"
          fallback="☰"
          fallbackSize={18}
        />
        <Text className="font-sf-bold text-[21px] leading-6.5 text-[#111318]">
          Description
        </Text>
      </View>
      <View className="mt-3.5">
        {ETHEREUM_DESCRIPTION_PARAGRAPHS.map((paragraph, index) => (
          <Text
            key={paragraph.slice(0, 24)}
            className={`${index > 0 ? "mt-3.5 " : ""}font-sf-medium text-[18px] leading-6 text-[#999999]`}
          >
            {paragraph}
          </Text>
        ))}
      </View>
    </View>
  );
}

export const DescriptionSection = React.memo(DescriptionSectionComponent);
