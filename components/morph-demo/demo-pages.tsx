import React from "react";
import { View } from "react-native";
import type { TextStyle } from "react-native";
import { Section as FormSection, Text as FormText } from "@/components/ui/form";
import { MorphingText } from "@/morphing-text";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { PreviewStage } from "./demo-chrome";
import type { DemoMetrics } from "./use-demo-metrics";
import type { DemoState } from "./use-demo-state";

type DemoPageProps = {
  readonly metrics: DemoMetrics;
  readonly state: DemoState;
};

type SettingsSectionProps = {
  readonly metrics: DemoMetrics;
  readonly children: React.ReactNode;
};

function SettingsSection({ metrics, children }: SettingsSectionProps) {
  return (
    <FormSection
      outerStyle={{
        paddingHorizontal: 0,
      }}
      style={{
        backgroundColor: "#f8f8f8",
        borderRadius: metrics.panelRadius,
      }}
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

function settingsRow({ label, value, onPress }: SettingsRowOptions) {
  return (
    <FormText
      key={label}
      bold
      onPress={onPress}
      style={settingLabelStyle}
      hint={
        <FormText bold numberOfLines={1} style={settingHintStyle}>
          {value}
        </FormText>
      }
    >
      {label}
    </FormText>
  );
}

const settingLabelStyle: TextStyle = {
  color: "#989898",
};

const settingHintStyle: TextStyle = {
  color: "#007aff",
};

export function EditorDemoPage({ metrics, state }: DemoPageProps) {
  return (
    <>
      <PreviewStage metrics={metrics}>
        <MorphingText
          text={state.editorWord}
          autoSize={false}
          animationPreset="default"
          fontSize={state.fontSize}
          clipToBounds={false}
          containerStyle={{
            alignSelf: "center",
          }}
          style={{
            color: "#000000",
            fontFamily: state.fontWeight.fontFamily,
            fontSize: state.fontSize,
            textAlign: "center",
          }}
        />
      </PreviewStage>

      <View style={{ flex: 1 }} />

      <SettingsSection metrics={metrics}>
        {settingsRow({
          label: "Word",
          value: state.editorWord,
          onPress: state.cycleEditorWord,
        })}
        {settingsRow({
          label: "Font Size",
          value: `${state.fontSize}pt`,
          onPress: state.cycleFontSize,
        })}
        {settingsRow({
          label: "Font Weight",
          value: state.fontWeight.label,
          onPress: state.cycleFontWeight,
        })}
      </SettingsSection>
    </>
  );
}

export function WordsDemoPage({ metrics, state }: DemoPageProps) {
  return (
    <>
      <PreviewStage metrics={metrics}>
        <MorphingText
          text={state.standaloneWord}
          autoSize={false}
          animationPreset="smooth"
          fontSize={state.fontSize}
          clipToBounds={false}
          containerStyle={{
            alignSelf: "center",
          }}
          style={{
            color: "#000000",
            fontFamily: state.fontWeight.fontFamily,
            fontSize: state.fontSize,
            textAlign: "center",
          }}
        />
      </PreviewStage>

      <View style={{ flex: 1 }} />

      <SettingsSection metrics={metrics}>
        {settingsRow({
          label: "Word",
          value: state.standaloneWord,
          onPress: state.cycleStandaloneWord,
        })}
        {settingsRow({ label: "Variant", value: "Text" })}
        {settingsRow({ label: "Auto Size", value: "Off" })}
      </SettingsSection>
    </>
  );
}

export function ButtonDemoPage({ metrics, state }: DemoPageProps) {
  return (
    <>
      <PreviewStage metrics={metrics}>
        <PressableScale
          onPress={state.cycleButtonWord}
          style={{
            alignSelf: "center",
            minHeight: state.fontSize * 1.42,
            borderRadius: 36,
            backgroundColor: "#7ce2fe",
            paddingHorizontal: state.fontSize * 0.72,
            paddingVertical: state.fontSize * 0.22,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MorphingText
            text={state.buttonWord}
            autoSize
            animationPreset="default"
            fontSize={state.fontSize}
            clipToBounds={false}
            containerStyle={{
              alignSelf: "center",
            }}
            style={{
              color: "#ffffff",
              fontFamily: "Sf-semibold",
              fontSize: state.fontSize,
              textAlign: "center",
            }}
          />
        </PressableScale>
      </PreviewStage>

      <View style={{ flex: 1 }} />

      <SettingsSection metrics={metrics}>
        {settingsRow({
          label: "Button Text",
          value: state.buttonWord,
          onPress: state.cycleButtonWord,
        })}
        {settingsRow({ label: "Surface", value: "Pressable" })}
        {settingsRow({ label: "Auto Size", value: "On" })}
      </SettingsSection>
    </>
  );
}

export function NumbersDemoPage({ metrics, state }: DemoPageProps) {
  return (
    <>
      <PreviewStage metrics={metrics}>
        <MorphingText
          text={state.numberValue}
          variant="number"
          animationPreset="snappy"
          fontSize={state.fontSize}
          clipToBounds={false}
          containerStyle={{
            alignSelf: "center",
          }}
          style={{
            color: "#000000",
            fontFamily: "Sf-semibold",
            fontSize: state.fontSize,
            fontVariant: ["tabular-nums"],
            textAlign: "center",
          }}
        />
      </PreviewStage>

      <View style={{ flex: 1 }} />

      <SettingsSection metrics={metrics}>
        {settingsRow({
          label: "Number",
          value: state.numberValue,
          onPress: state.cycleNumber,
        })}
        {settingsRow({
          label: "Reverse",
          value: state.previousNumberValue,
        })}
        {settingsRow({
          label: "Morph",
          value: state.nextNumberValue,
        })}
      </SettingsSection>
    </>
  );
}
