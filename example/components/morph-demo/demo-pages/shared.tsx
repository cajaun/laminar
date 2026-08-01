import React from "react";
import { Text, View } from "react-native";
import type { TextStyle } from "react-native";
import { Section as FormSection, Text as FormText } from "@/components/ui/form";
import { PreviewStage } from "../demo-chrome";
import type { DemoMetrics } from "../use-demo-metrics";
import type { DemoPageProps } from "./types";

export const showcaseTextStyle: TextStyle = {
  color: "#000000",
  fontFamily: "Sf-semibold",
  textAlign: "center",
};

export const teachingBlue = "#007aff";
export const teachingDurationMs = 700;

type SettingsSectionProps = {
  readonly metrics: DemoMetrics;
  readonly children: React.ReactNode;
};

export function SettingsSection({ metrics, children }: SettingsSectionProps) {
  return (
    <FormSection
      outerStyle={{ paddingHorizontal: 0 }}
      style={{ backgroundColor: "#f8f8f8", borderRadius: metrics.panelRadius }}
      separatorInset="content"
    >
      {children}
    </FormSection>
  );
}

type SettingsRowOptions = {
  readonly label: string;
  readonly value: string;
  readonly onPress?: () => void;
};

export function settingsRow({ label, value, onPress }: SettingsRowOptions) {
  return (
    <FormText
      bold
      onPress={onPress}
      style={{ color: "#989898" }}
      hint={
        <FormText bold numberOfLines={1} style={{ color: "#007aff" }}>
          {value}
        </FormText>
      }
    >
      {label}
    </FormText>
  );
}

export function DemoPageLayout({
  metrics,
  preview,
  settings,
}: Pick<DemoPageProps, "metrics"> & {
  readonly preview: React.ReactNode;
  readonly settings: React.ReactNode;
}) {
  return (
    <>
      <PreviewStage metrics={metrics}>{preview}</PreviewStage>
      <View style={{ flex: 1 }} />
      <SettingsSection metrics={metrics}>{settings}</SettingsSection>
    </>
  );
}

export function TeachingLabel({ children }: { readonly children: React.ReactNode }) {
  return (
    <Text
      style={{
        marginTop: 16,
        color: teachingBlue,
        fontFamily: "Sf-semibold",
        fontSize: 17,
        textAlign: "center",
      }}
    >
      {children}
    </Text>
  );
}

export function MechanismFrame({ children }: { readonly children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 12, alignItems: "center" }}>{children}</View>
  );
}

export function sameMetrics(previous: DemoPageProps, next: DemoPageProps) {
  return previous.metrics === next.metrics;
}
