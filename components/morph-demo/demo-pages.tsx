import React from "react";
import { Text, View } from "react-native";
import type { TextStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Section as FormSection, Text as FormText } from "@/components/ui/form";
import { Laminar } from "laminar";
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

function IdentityCell({
  unit,
  survives,
  current,
}: {
  readonly unit: string;
  readonly survives: boolean;
  readonly current: boolean;
}) {
  const isEmpty = unit.length === 0;
  const surviveProgress = useSharedValue(survives ? 1 : 0);
  const currentProgress = useSharedValue(current ? 1 : 0);
  const visibleProgress = useSharedValue(isEmpty ? 0 : 1);

  React.useEffect(() => {
    surviveProgress.value = withTiming(survives ? 1 : 0, {
      duration: identityColorDurationMs,
    });
  }, [survives, surviveProgress]);

  React.useEffect(() => {
    currentProgress.value = withTiming(current ? 1 : 0, {
      duration: identityColorDurationMs,
    });
  }, [current, currentProgress]);

  React.useEffect(() => {
    visibleProgress.value = withTiming(isEmpty ? 0 : 1, {
      duration: identityColorDurationMs,
    });
  }, [isEmpty, visibleProgress]);

  const animatedCellStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      surviveProgress.value,
      [0, 1],
      ["#d1d1d6", teachingBlue]
    ),
    backgroundColor: interpolateColor(
      currentProgress.value,
      [0, 1],
      ["#ffffff", "#eef6ff"]
    ),
    opacity: visibleProgress.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      surviveProgress.value,
      [0, 1],
      ["#8e8e93", teachingBlue]
    ),
    opacity: visibleProgress.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 34,
          height: 37,
          borderRadius: 10,
          borderWidth: 1,
          borderStyle: survives ? "solid" : "dashed",
          alignItems: "center",
          justifyContent: "center",
        },
        animatedCellStyle,
      ]}
    >
      <Animated.Text
        style={[
          {
            fontFamily: "Sf-semibold",
            fontSize: 18,
            textAlign: "center",
          },
          animatedTextStyle,
        ]}
      >
        {unit}
      </Animated.Text>
    </Animated.View>
  );
}

function computeSharedUnitIndexes(fromValue: string, toValue: string) {
  const fromUnits = fromValue.split("");
  const toUnits = toValue.split("");
  const usedToIndexes = new Set<number>();
  const fromIndexes = new Set<number>();
  const toIndexes = new Set<number>();

  fromUnits.forEach((unit, fromIndex) => {
    const toIndex = toUnits.findIndex(
      (nextUnit, candidateIndex) =>
        nextUnit === unit && !usedToIndexes.has(candidateIndex)
    );

    if (toIndex >= 0) {
      usedToIndexes.add(toIndex);
      fromIndexes.add(fromIndex);
      toIndexes.add(toIndex);
    }
  });

  return { fromIndexes, toIndexes };
}

function padUnits(value: string, length: number) {
  const units = value.split("");
  return [
    ...units,
    ...Array<string>(Math.max(0, length - units.length)).fill(""),
  ].slice(0, length);
}

function IdentityMap({
  value,
  nextValue,
}: {
  readonly value: string;
  readonly nextValue: string;
}) {
  const cellCount = 7;
  const sharedIndexes = React.useMemo(
    () => computeSharedUnitIndexes(value, nextValue),
    [nextValue, value]
  );
  const rows = [
    {
      label: "now",
      units: padUnits(value, cellCount),
      survivors: sharedIndexes.fromIndexes,
      current: true,
    },
    {
      label: "next",
      units: padUnits(nextValue, cellCount),
      survivors: sharedIndexes.toIndexes,
      current: false,
    },
  ] as const;

  return (
    <MechanismFrame>
      <View style={{ gap: 7 }}>
        {rows.map((row) => (
          <View
            key={row.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <Text
              style={{
                width: 32,
                color: "#8e8e93",
                fontFamily: "Sf-semibold",
                fontSize: 15,
                textAlign: "right",
              }}
            >
              {row.label}
            </Text>
            {row.units.map((unit, index) => {
              return (
                <IdentityCell
                  key={`${row.label}:slot:${index}`}
                  unit={unit}
                  current={row.current}
                  survives={row.survivors.has(index)}
                />
              );
            })}
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
        solid blue glyphs keep their keys
      </Text>
    </MechanismFrame>
  );
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

function ProbeTokenDiagram({ value }: { readonly value: string }) {
  return (
    <MechanismFrame>
      <View style={{ gap: 8, alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text
            style={{
              width: 48,
              color: teachingBlue,
              fontFamily: "Sf-semibold",
              fontSize: 17,
              textAlign: "right",
            }}
          >
            space
          </Text>
          <View
            style={{
              width: 74,
              height: 42,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: teachingBlue,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f7fbff",
            }}
          >
            <Text
              style={{
                color: "#c7c7cc",
                fontFamily: "Sf-semibold",
                fontSize: 20,
                fontVariant: ["tabular-nums"],
              }}
            >
              {value}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text
            style={{
              width: 48,
              color: "#8e8e93",
              fontFamily: "Sf-semibold",
              fontSize: 17,
              textAlign: "right",
            }}
          >
            digit
          </Text>
          <View
            style={{
              width: 74,
              height: 42,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "#d1d1d6",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Laminar
              text={value}
              variant="number"
              animationDuration={teachingDurationMs}
              animationPreset="default"
              autoSize={false}
              clipToBounds={false}
              fontSize={30}
              stagger={0}
              containerStyle={{ alignSelf: "center" }}
              style={{
                color: "#000000",
                fontFamily: "Sf-semibold",
                fontSize: 30,
                fontVariant: ["tabular-nums"],
                textAlign: "center",
              }}
            />
          </View>
        </View>
      </View>
    </MechanismFrame>
  );
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
        <TeachingLabel>stable keys keep matching glyphs alive</TeachingLabel>
        <IdentityMap
          value={state.textIdentityWord}
          nextValue={state.nextTextIdentityWord}
        />
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
        {settingsRow({ label: "Reverse", value: state.previousNumberLaneValue })}
        {settingsRow({ label: "Morph", value: state.nextNumberLaneValue })}
      </SettingsSection>
    </>
  );
}

export function AnimationLayerDemoPage({ metrics, state }: DemoPageProps) {
  return (
    <>
      <PreviewStage metrics={metrics}>
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
        <TeachingLabel>the dashed space stays fixed</TeachingLabel>
        <ProbeTokenDiagram value={state.animationLayerValue} />
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
            backgroundColor: "#7ce2fe",
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
