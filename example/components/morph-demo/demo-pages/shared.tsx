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
import { useDemoTheme } from "../demo-theme";
import type { DemoTheme } from "../demo-theme";

export function showcaseTextStyle(theme: DemoTheme): TextStyle {
  return {
    color: theme.primary,
    fontFamily: "Sf-semibold",
    textAlign: "center",
  };
}

export const teachingBlue = "#007aff";

type SettingsSectionProps<T> = {
  readonly metrics: DemoMetrics;
  readonly store: DemoSnapshotStore<T>;
  readonly renderSettings: (
    state: CyclicValueSnapshot<T>,
    theme: DemoTheme,
  ) => React.ReactNode;
};

export function SettingsSection<T>({
  metrics,
  store,
  renderSettings,
}: SettingsSectionProps<T>) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();

  return (
    <FormSection
      outerStyle={{ paddingHorizontal: 0 }}
      style={{ backgroundColor: theme.panel, borderRadius: metrics.panelRadius }}
      separatorInset="content"
    >
      {renderSettings(state, theme)}
    </FormSection>
  );
}

type SettingsRowOptions = {
  readonly label: string;
  readonly value: React.ReactNode;
  readonly onPress?: () => void;
  readonly theme: DemoTheme;
};

export function settingsRow({ label, value, onPress, theme }: SettingsRowOptions) {
  const hint =
    typeof value === "string" ? (
      <FormText bold numberOfLines={1} style={{ color: theme.accent }}>
        {value}
      </FormText>
    ) : (
      value
    );

  return (
    <FormText
      bold
      onPress={onPress}
      style={{ color: theme.tertiary }}
      hint={hint}
    >
      {label}
    </FormText>
  );
}

type SettingsValueProps<T> = {
  readonly store: DemoSnapshotStore<T>;
  readonly select: (snapshot: CyclicValueSnapshot<T>) => string;
  readonly theme: DemoTheme;
};

const SettingsValue = React.memo(function SettingsValue<T>({
  store,
  select,
  theme,
}: SettingsValueProps<T>) {
  const snapshot = useCyclicValueStoreSnapshot(store);

  return (
    <FormText bold numberOfLines={1} style={{ color: theme.accent }}>
      {select(snapshot)}
    </FormText>
  );
}) as <T>(props: SettingsValueProps<T>) => React.ReactElement;

export function settingsValue<T>({
  store,
  select,
  theme,
}: SettingsValueProps<T>) {
  return <SettingsValue store={store} select={select} theme={theme} />;
}

type DemoPageLayoutProps<T> = {
  readonly height: number;
  readonly width: number;
  readonly fontSize: number;
  readonly onReverse: () => void;
  readonly onMorph: () => void;
  readonly preview: React.ReactNode;
  readonly settingsStore: DemoSnapshotStore<T>;
  readonly renderSettings?: (
    state: CyclicValueSnapshot<T>,
    theme: DemoTheme,
  ) => React.ReactNode;
  readonly renderStaticSettings?: (theme: DemoTheme) => React.ReactNode;
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
  renderStaticSettings,
}: DemoPageLayoutProps<T>) {
  const metrics = useDemoMetrics({ height, width, fontSize });

  return (
    <View style={{ flex: 1 }}>
      <DemoPageScroll metrics={metrics}>
        <PreviewStage metrics={metrics}>{preview}</PreviewStage>
        <View style={{ flex: 1, minHeight: metrics.controlStackGap }} />
        {renderStaticSettings ? (
          <StaticSettingsSection
            metrics={metrics}
            renderSettings={renderStaticSettings}
          />
        ) : renderSettings ? (
          <SettingsSection
            metrics={metrics}
            store={settingsStore}
            renderSettings={renderSettings}
          />
        ) : null}
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

function StaticSettingsSection({
  metrics,
  renderSettings,
}: {
  readonly metrics: DemoMetrics;
  readonly renderSettings: (theme: DemoTheme) => React.ReactNode;
}) {
  const theme = useDemoTheme();

  return (
    <FormSection
      outerStyle={{ paddingHorizontal: 0 }}
      style={{ backgroundColor: theme.panel, borderRadius: metrics.panelRadius }}
      separatorInset="content"
    >
      {renderSettings(theme)}
    </FormSection>
  );
}

export const TeachingLabel = React.memo(function TeachingLabel({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const theme = useDemoTheme();

  return (
    <Text
      style={{
        marginTop: 16,
        color: theme.accent,
        fontFamily: "Sf-semibold",
        fontSize: 17,
        textAlign: "center",
      }}
    >
      {children}
    </Text>
  );
});

export function MechanismFrame({ children }: { readonly children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 12, alignItems: "center" }}>{children}</View>
  );
}
