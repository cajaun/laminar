import React from "react";
import { Text, View } from "react-native";
import type { TextStyle } from "react-native";
import { Section as FormSection, Text as FormText } from "@/components/ui/form";
import {
  DemoFooter,
  DemoPageScroll,
  PreviewStage,
} from "../demo-chrome";
import { useDemoMetrics, type DemoMetrics } from "../use-demo-metrics";
import {
  useCyclicValueStoreSnapshot,
  type CyclicValueSnapshot,
  type DemoSnapshotStore,
} from "../use-demo-state";

export const showcaseTextStyle: TextStyle = {
  color: "#000000",
  fontFamily: "Sf-semibold",
  textAlign: "center",
};

export const teachingBlue = "#007aff";
export const teachingDurationMs = 700;

type SettingsSectionProps<T> = {
  readonly metrics: DemoMetrics;
  readonly store: DemoSnapshotStore<T>;
  readonly renderSettings: (state: CyclicValueSnapshot<T>) => React.ReactNode;
};

export function SettingsSection<T>({
  metrics,
  store,
  renderSettings,
}: SettingsSectionProps<T>) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <FormSection
      outerStyle={{ paddingHorizontal: 0 }}
      style={{ backgroundColor: "#f8f8f8", borderRadius: metrics.panelRadius }}
      separatorInset="content"
    >
      {renderSettings(state)}
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

type DemoPageLayoutProps<T> = {
  readonly height: number;
  readonly width: number;
  readonly fontSize: number;
  readonly onReverse: () => void;
  readonly onMorph: () => void;
  readonly preview: React.ReactNode;
  readonly settingsStore: DemoSnapshotStore<T>;
  readonly renderSettings: (state: CyclicValueSnapshot<T>) => React.ReactNode;
};

function DemoPageLayoutImpl<T>({
  height,
  width,
  fontSize,
  onReverse,
  onMorph,
  preview,
  settingsStore,
  renderSettings,
}: DemoPageLayoutProps<T>) {
  const metrics = useDemoMetrics({ height, width, fontSize });

  return (
    <View style={{ flex: 1 }}>
      <DemoPageScroll metrics={metrics}>
        <PreviewStage metrics={metrics}>{preview}</PreviewStage>
        <View style={{ flex: 1 }} />
        <SettingsSection
          metrics={metrics}
          store={settingsStore}
          renderSettings={renderSettings}
        />
      </DemoPageScroll>
      <DemoFooter
        metrics={metrics}
        onReverse={onReverse}
        onMorph={onMorph}
      />
    </View>
  );
}

export const DemoPageLayout = React.memo(
  DemoPageLayoutImpl
) as typeof DemoPageLayoutImpl;

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
