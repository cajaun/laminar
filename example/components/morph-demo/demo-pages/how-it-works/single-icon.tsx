import React from "react";
import { View } from "react-native";
import { SymbolView } from "expo-symbols";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  settingsRow,
  settingsValue,
  TeachingLabel,
} from "../shared";
import { SingleIconMechanism } from "../illustrations";
import type { DemoPageProps } from "../types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useCyclicValueStoreSnapshot,
  useSingleIconDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

type SingleIconStore = ReturnType<typeof useSingleIconDemoStore>;

const singleIconContainerStyle = {
  alignSelf: "center" as const,
};

const SingleIconValue = React.memo(function SingleIconValue({
  store,
  theme,
}: {
  readonly store: SingleIconStore;
  readonly theme: ReturnType<typeof useDemoTheme>;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const leading = React.useMemo(
    () => ({
      Confirm: (
        <SymbolView name="faceid" size={34} tintColor={theme.accent} />
      ),
    }),
    [theme.accent],
  );
  const previewTextStyle = React.useMemo(
    () => ({
      color: theme.primary,
      fontFamily: "Sf-semibold" as const,
      fontSize: 36,
      textAlign: "center" as const,
    }),
    [theme.primary],
  );

  return (
    <Laminar
      text={state.value}
      leading={leading}
      leadingGap={10}
      autoSize
      clipToBounds={false}
      align="center"
      fontSize={36}
      containerStyle={singleIconContainerStyle}
      style={previewTextStyle}
    />
  );
});

const SingleIconMechanismPreview = React.memo(function SingleIconMechanismPreview({
  store,
}: {
  readonly store: SingleIconStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return <SingleIconMechanism current={state.value} />;
});

const SingleIconPreview = React.memo(function SingleIconPreview({
  store,
}: {
  readonly store: SingleIconStore;
}) {
  const theme = useDemoTheme();
  const previewFrameStyle = React.useMemo(
    () => ({
      borderWidth: 1.5,
      borderStyle: "dashed" as const,
      borderColor: theme.accent,
      borderRadius: 16,
      overflow: "hidden" as const,
      minWidth: 260,
      alignItems: "center" as const,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.teachingSurface,
    }),
    [theme.accent, theme.teachingSurface],
  );

  return (
    <>
      <View style={previewFrameStyle}>
        <SingleIconValue store={store} theme={theme} />
      </View>
      <TeachingLabel>the icon follows its matching word</TeachingLabel>
      <SingleIconMechanismPreview store={store} />
    </>
  );
});

function SingleIconPage({ height, width }: DemoPageProps) {
  const store = useSingleIconDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<SingleIconPreview store={store} />}
      settingsStore={store}
      renderStaticSettings={(theme) => (
        <>
          {settingsRow({
            label: "State",
            value: settingsValue({
              store,
              select: (snapshot) => snapshot.value,
              theme,
            }),
            onPress: store.next,
            theme,
          })}
          {settingsRow({ label: "Leading", value: "Single icon", theme })}
          {settingsRow({ label: "Alignment", value: "Inline", theme })}
        </>
      )}
    />
  );
}

export const SingleIconDemoPage = React.memo(SingleIconPage);

