import React from "react";
import { View, Text } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  MechanismFrame,
  settingsRow,
  settingsValue,
  TeachingLabel,
} from "../shared";
import { NoLcsLaminar } from "../illustrations";
import type { DemoPageProps } from "../types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useCyclicValueStoreSnapshot,
  useTextIdentityDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

const textPreviewContainerStyle = {
  alignSelf: "center" as const,
};

const textPreviewStageStyle = {
  height: 78,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const textMechanismContainerStyle = {
  alignSelf: "center" as const,
};

type TextIdentityStore = ReturnType<typeof useTextIdentityDemoStore>;

const TextIdentityValue = React.memo(function TextIdentityValue({
  store,
  theme,
}: {
  readonly store: TextIdentityStore;
  readonly theme: ReturnType<typeof useDemoTheme>;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const previewTextStyle = React.useMemo(
    () => ({
      color: theme.primary,
      fontFamily: "Sf-semibold" as const,
      fontSize: 62,
      lineHeight: 78,
    }),
    [theme.primary],
  );
  return (
    <Laminar
      text={state.value}
      autoSize
      clipToBounds={false}
      fontSize={62}
      containerStyle={textPreviewContainerStyle}
      style={previewTextStyle}
    />
  );
});

const TextIdentityMechanismPreview = React.memo(function TextIdentityMechanismPreview({
  store,
}: {
  readonly store: TextIdentityStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();
  const mechanismTextStyle = React.useMemo(
    () => ({
      color: theme.secondary,
      fontFamily: "Sf-semibold" as const,
      fontSize: 42,
    }),
    [theme.secondary],
  );
  const mechanismFrameStyle = React.useMemo(
    () => ({
      borderWidth: 1.5,
      borderStyle: "dashed" as const,
      borderColor: theme.accent,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: theme.teachingSurface,
    }),
    [theme.accent, theme.teachingSurface],
  );

  return (
    <MechanismFrame>
      <Text
        style={{
          color: theme.secondary,
          fontFamily: "Sf-semibold",
          fontSize: 13,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        a single text run
      </Text>
      <View style={mechanismFrameStyle}>
        <NoLcsLaminar
          text={state.value}
          autoSize
          clipToBounds={false}
          fontSize={42}
          containerStyle={textMechanismContainerStyle}
          style={mechanismTextStyle}
        />
      </View>
    </MechanismFrame>
  );
});

const TextIdentityPreview = React.memo(function TextIdentityPreview({
  store,
}: {
  readonly store: TextIdentityStore;
}) {
  const theme = useDemoTheme();

  return (
    <>
      <View style={textPreviewStageStyle}>
        <TextIdentityValue store={store} theme={theme} />
      </View>
      <TeachingLabel>matching glyphs stay in place as the word changes</TeachingLabel>
      <TextIdentityMechanismPreview store={store} />
    </>
  );
});

function TextIdentityPage({ height, width }: DemoPageProps) {
  const store = useTextIdentityDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<TextIdentityPreview store={store} />}
      settingsStore={store}
      renderStaticSettings={(theme) => (
        <>
          {settingsRow({
            label: "Text",
            value: settingsValue({
              store,
              select: (snapshot) => snapshot.value,
              theme,
            }),
            onPress: store.next,
            theme,
          })}
          {settingsRow({ label: "Identity", value: "LCS", theme })}
          {settingsRow({ label: "Speed", value: "Readable", theme })}
        </>
      )}
    />
  );
}

export const TextIdentityDemoPage = React.memo(TextIdentityPage);

