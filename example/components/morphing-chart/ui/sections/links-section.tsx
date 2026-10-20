import React from "react";
import { Pressable, Text, View } from "react-native";
import { SFIcon } from "@/components/morphing-chart/ui/primitives/sf-icon";
import { useMorphingChartTheme } from "@/components/morphing-chart/ui/morphing-chart-theme";

type LinksSectionProps = {
  width: number;
};

type LinkPillProps = {
  children: React.ReactNode;
  icon: React.ReactNode;
  width: number;
};

function LinkPill({ children, icon, width }: LinkPillProps) {
  const theme = useMorphingChartTheme();

  return (
    <Pressable
      accessibilityRole="link"
      className="h-10 flex-row items-center justify-center gap-2 rounded-full"
      style={{ width, backgroundColor: theme.section }}
    >
      {icon}
      <Text
        className="font-sf-medium text-[18px] leading-5"
        style={{ color: theme.primary }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

function LinksSectionComponent({ width }: LinksSectionProps) {
  const theme = useMorphingChartTheme();

  return (
    <View className="mt-8" style={{ width }}>
      <View className="flex-row items-center gap-3">
        <SFIcon
          name="link"
          size={20}
          color={theme.secondary}
          weight="medium"
          fallback="↗"
          fallbackSize={20}
        />
        <Text
          className="font-sf-semibold text-[20px] leading-6"
          style={{ color: theme.primary }}
        >
          Links
        </Text>
      </View>

      <View className="mt-6 flex-row flex-wrap gap-3">
        <LinkPill
          width={116}
          icon={
            <SFIcon
              name="globe"
              size={18}
              color={theme.secondary}
              weight="medium"
              fallback="◎"
              fallbackSize={18}
            />
          }
        >
          Website
        </LinkPill>
        <LinkPill
          width={130}
          icon={
            <Text
              aria-hidden
              className="font-sf-medium text-[22px] leading-5"
              style={{ color: theme.secondary }}
            >
              𝕏
            </Text>
          }
        >
          X (Twitter)
        </LinkPill>
      </View>
    </View>
  );
}

export const LinksSection = React.memo(LinksSectionComponent);
