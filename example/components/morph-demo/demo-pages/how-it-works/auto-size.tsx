import React from "react";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  MechanismFrame,
  settingsRow,
  settingsValue,
  TeachingLabel,
} from "../shared";
import { AutoSizeComparison } from "../illustrations";
import type { DemoPageProps } from "../types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useAutoSizeDemoStore,
  useCyclicValueStoreSnapshot,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

const autoSizeContainerStyle = {
  alignSelf: "center" as const,
};

type AutoSizeStore = ReturnType<typeof useAutoSizeDemoStore>;

const AutoSizeValue = React.memo(function AutoSizeValue({
  store,
  theme,
}: {
  readonly store: AutoSizeStore;
  readonly theme: ReturnType<typeof useDemoTheme>;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const previewTextStyle = React.useMemo(
    () => ({
      color: theme.primary,
      fontFamily: "Sf-semibold" as const,
      fontSize: 32,
    }),
    [theme.primary],
  );

  return (
    <Laminar
      text={state.value}
      autoSize
      clipToBounds={false}
      fontSize={32}
      style={previewTextStyle}
      containerStyle={autoSizeContainerStyle}
    />
  );
});

const AutoSizeMechanismPreview = React.memo(function AutoSizeMechanismPreview({
  store,
}: {
  readonly store: AutoSizeStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <MechanismFrame>
      <AutoSizeComparison value={state.value} />
    </MechanismFrame>
  );
});

const AutoSizePreview = React.memo(function AutoSizePreview({
  store,
}: {
  readonly store: AutoSizeStore;
}) {
  const theme = useDemoTheme();
  const previewFrameStyle = React.useMemo(
    () => ({
      borderWidth: 1.5,
      borderStyle: "dashed" as const,
      borderColor: theme.accent,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 12,
      backgroundColor: theme.teachingSurface,
    }),
    [theme.accent, theme.teachingSurface],
  );

  return (
    <>
      <View style={previewFrameStyle}>
        <AutoSizeValue store={store} theme={theme} />
      </View>
      <TeachingLabel>the measured boundary follows the content</TeachingLabel>
      <AutoSizeMechanismPreview store={store} />
    </>
  );
});

function AutoSizePage({ height, width }: DemoPageProps) {
  const store = useAutoSizeDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<AutoSizePreview store={store} />}
      settingsStore={store}
      renderStaticSettings={(theme) => (
        <>
          {settingsRow({
            label: "String",
            value: settingsValue({
              store,
              select: (snapshot) => snapshot.value,
              theme,
            }),
            onPress: store.next,
            theme,
          })}
          {settingsRow({ label: "Auto Size", value: "On", theme })}
          {settingsRow({ label: "Container", value: "Measured", theme })}
        </>
      )}
    />
  );
}

export const AutoSizeDemoPage = React.memo(AutoSizePage);

