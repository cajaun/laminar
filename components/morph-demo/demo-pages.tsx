import React from "react";
import { Text, View } from "react-native";
import type { TextStyle } from "react-native";
import { Section as FormSection, Text as FormText } from "@/components/ui/form";
import { Laminar } from "react-native-laminar";
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

const showcaseTextStyle: TextStyle = {
  color: "#000000",
  fontFamily: "Sf-semibold",
  textAlign: "center",
};

const teachingBlue = "#007aff";
const mechanismTopGap = 12;
const teachingDurationMs = 700;
const identityColorDurationMs = 220;

function TeachingLabel({ children }: { readonly children: React.ReactNode }) {
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

function MechanismFrame({ children }: { readonly children: React.ReactNode }) {
  return (
    <View
      style={{
        marginTop: mechanismTopGap,
        alignItems: "center",
      }}
    >
      {children}
    </View>
  );
}


function NoLcsLaminar(props: React.ComponentProps<typeof Laminar>) {
  return <Laminar key={String(props.text)} {...props} />;
}


function readLaneUnits(value: string) {
  const lead = value.match(/^\D*/)?.[0] ?? "";
  const tail = value.slice(lead.length);
  const laneCount = 6;
  const tailUnits = tail.split("");

  return {
    lead,
    lanes: [
      ...Array<string>(Math.max(0, laneCount - tailUnits.length)).fill(""),
      ...tailUnits,
    ].slice(-laneCount),
  };
}

function LaneStrip({ value }: { readonly value: string }) {
  const { lead, lanes } = readLaneUnits(value);

  return (
    <MechanismFrame>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <View
          style={{
            width: 40,
            height: 42,
            borderRadius: 10,
            borderWidth: lead ? 1 : 0,
            borderStyle: "dashed",
            borderColor: "#c7c7cc",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: lead ? "#f8f8f8" : "transparent",
          }}
        >
          <Text
            style={{
              color: "#8e8e93",
              fontFamily: "Sf-semibold",
              fontSize: 21,
            }}
          >
            {lead}
          </Text>
        </View>

        {lanes.map((unit, index) => (
          <View
            key={`lane:${index}`}
            style={{
              width: 40,
              height: 42,
              borderRadius: 10,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: teachingBlue,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f7fbff",
            }}
          >
            <Laminar
              text={unit}
              variant="number"
              animationDuration={teachingDurationMs}
              animationPreset="snappy"
              autoSize={false}
              clipToBounds={false}
              fontSize={22}
              stagger={0}
              containerStyle={{ alignSelf: "center" }}
              style={{
                color: unit ? "#1c1c1e" : "#c7c7cc",
                fontFamily: "Sf-semibold",
                fontSize: 22,
                fontVariant: ["tabular-nums"],
                textAlign: "center",
              }}
            />
          </View>
        ))}
      </View>
      <Text
        style={{
          marginTop: 8,
          color: "#8e8e93",
          fontFamily: "Sf-semibold",
          fontSize: 15,
          textAlign: "center",
        }}
      >
        right edge stays fixed
      </Text>
    </MechanismFrame>
  );
}

function NoProbeDigit({ value }: { readonly value: string }) {
  return <Laminar key={value} text={value} variant="text" animationDuration={teachingDurationMs} animationPreset="default" autoSize clipToBounds={false} fontSize={62} stagger={0} containerStyle={{ alignSelf: "center" }} style={[showcaseTextStyle, { fontSize: 62, fontVariant: ["tabular-nums"] }]} />;
}

function AutoSizeComparison({ value }: { readonly value: string }) {
  return (
    <MechanismFrame>
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text
            style={{
              width: 32,
              color: "#8e8e93",
              fontFamily: "Sf-semibold",
              fontSize: 16,
              textAlign: "right",
            }}
          >
            off
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "#c7c7cc",
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 7,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Laminar
              text={value}
              animationDuration={teachingDurationMs}
              animationPreset="smooth"
              autoSize={false}
              clipToBounds={false}
              fontSize={17}
              stagger={0}
              containerStyle={{ alignSelf: "center" }}
              style={{
                color: "#8e8e93",
                fontFamily: "Sf-semibold",
                fontSize: 17,
                textAlign: "center",
              }}
            />
          </View>
        </View>
      </View>
    </MechanismFrame>
  );
}

export function TextIdentityDemoPage({ metrics, state }: DemoPageProps) {
  return (
    <>
      <PreviewStage metrics={metrics}>
        <Laminar
          text={state.textIdentityWord}
          animationDuration={teachingDurationMs}
          animationPreset="default"
          autoSize
          clipToBounds={false}
          fontSize={56}
          stagger={0.04}
          containerStyle={{ alignSelf: "center" }}
          style={[showcaseTextStyle, { fontSize: 56 }]}
        />
        <TeachingLabel>matching glyphs hold position with LCS</TeachingLabel>
        <MechanismFrame>
          <Text
            style={{
              color: "#8e8e93",
              fontFamily: "Sf-semibold",
              fontSize: 13,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            without LCS
          </Text>
          <NoLcsLaminar
            text={state.textIdentityWord}
            animationDuration={teachingDurationMs}
            animationPreset="default"
            autoSize
            clipToBounds={false}
            fontSize={56}
            stagger={0.04}
            containerStyle={{ alignSelf: "center" }}
            style={[showcaseTextStyle, { fontSize: 56 }]}
          />
        </MechanismFrame>
      </PreviewStage>

      <View style={{ flex: 1 }} />

      <SettingsSection metrics={metrics}>
        {settingsRow({
          label: "Text",
          value: state.textIdentityWord,
          onPress: state.morph,
        })}
        {settingsRow({ label: "Identity", value: "LCS" })}
        {settingsRow({ label: "Speed", value: "Readable" })}
      </SettingsSection>
    </>
  );
}

export function NumberIdentityDemoPage({ metrics, state }: DemoPageProps) {
  return (
    <>
      <PreviewStage metrics={metrics}>
        <Laminar
          text={state.numberLaneValue}
          variant="number"
          animationDuration={teachingDurationMs}
          animationPreset="snappy"
          autoSize
          clipToBounds={false}
          fontSize={54}
          stagger={0}
          containerStyle={{ alignSelf: "center" }}
          style={[
            showcaseTextStyle,
            {
              fontSize: 54,
              fontVariant: ["tabular-nums"],
            },
          ]}
        />
        <TeachingLabel>place value starts with fixed lanes</TeachingLabel>
        <LaneStrip value={state.numberLaneValue} />
      </PreviewStage>

      <View style={{ flex: 1 }} />

      <SettingsSection metrics={metrics}>
        {settingsRow({
          label: "Number",
          value: state.numberLaneValue,
          onPress: state.morph,
        })}
        {settingsRow({ label: "Direction", value: "Up / Down" })}
        {settingsRow({ label: "Lanes", value: "Fixed width" })}
      </SettingsSection>
    </>
  );
}

export function AnimationLayerDemoPage({ metrics, state }: DemoPageProps) {
  return (
    <>
      <PreviewStage metrics={metrics}>
        <View
          style={{
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: teachingBlue,
            borderRadius: 16,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#f7fbff",
          }}
        >
          <Laminar
            text={state.animationLayerValue}
            variant="number"
            animationDuration={teachingDurationMs}
            animationPreset="default"
            autoSize
            clipToBounds={false}
            fontSize={62}
            stagger={0}
            containerStyle={{ alignSelf: "center" }}
            style={[
              showcaseTextStyle,
              {
                fontSize: 62,
                fontVariant: ["tabular-nums"],
              },
            ]}
          />
        </View>
        <TeachingLabel>probe token holds the lane width during swap</TeachingLabel>
        <MechanismFrame>
          <Text
            style={{
              color: "#8e8e93",
              fontFamily: "Sf-semibold",
              fontSize: 13,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            without probe
          </Text>
          <View
            style={{
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: "#c7c7cc",
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
          >
            <NoProbeDigit value={state.animationLayerValue} />
          </View>
        </MechanismFrame>
      </PreviewStage>

      <View style={{ flex: 1 }} />

      <SettingsSection metrics={metrics}>
        {settingsRow({
          label: "Digit",
          value: state.animationLayerValue,
          onPress: state.morph,
        })}
        {settingsRow({ label: "Layer", value: "Space + digit" })}
        {settingsRow({ label: "Speed", value: "Readable" })}
      </SettingsSection>
    </>
  );
}

export function AutoSizeDemoPage({ metrics, state }: DemoPageProps) {
  return (
    <>
      <PreviewStage metrics={metrics}>
        <View
          style={{
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: "#007aff",
            borderRadius: 16,
            paddingHorizontal: 18,
            paddingVertical: 12,
          }}
        >
          <Laminar
            text={state.autoSizeValue}
            animationDuration={teachingDurationMs}
            animationPreset="smooth"
            autoSize
            clipToBounds={false}
            fontSize={32}
            stagger={0.035}
            containerStyle={{ alignSelf: "center" }}
            style={[showcaseTextStyle, { fontSize: 32 }]}
          />
        </View>
        <TeachingLabel>autoSize animates this dashed border</TeachingLabel>
        <AutoSizeComparison value={state.autoSizeValue} />
      </PreviewStage>

      <View style={{ flex: 1 }} />

      <SettingsSection metrics={metrics}>
        {settingsRow({
          label: "String",
          value: state.autoSizeValue,
          onPress: state.morph,
        })}
        {settingsRow({ label: "Auto Size", value: "On" })}
        {settingsRow({ label: "Container", value: "Measured" })}
      </SettingsSection>
    </>
  );
}

export function EditorDemoPage({ metrics, state }: DemoPageProps) {
  return (
    <>
      <PreviewStage metrics={metrics}>
        <Laminar
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
        <Laminar
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
            backgroundColor: "#007aff",
            paddingHorizontal: state.fontSize * 0.72,
            paddingVertical: state.fontSize * 0.22,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Laminar
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
              fontSize: 32,
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
        <Laminar
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
