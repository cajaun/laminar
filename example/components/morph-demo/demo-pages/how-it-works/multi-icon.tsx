import React from "react";
import { SymbolView } from "expo-symbols";
import { Laminar } from "react-native-laminar";
import { PressableScale } from "@/shared/ui/pressable-scale";
import {
  DemoPageLayout,
  settingsRow,
  settingsValue,
  TeachingLabel,
} from "../shared";
import { MultiIconMechanism } from "../illustrations";
import { LoadingSpinner } from "../illustrations/loading-spinner";
import type { DemoPageProps } from "../types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useCyclicValueStoreSnapshot,
  useMultiIconDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

type MultiIconStore = ReturnType<typeof useMultiIconDemoStore>;

const multiIconContainerStyle = {
  alignSelf: "center" as const,
};

const MultiIconValue = React.memo(function MultiIconValue({
  store,
  theme,
}: {
  readonly store: MultiIconStore;
  readonly theme: ReturnType<typeof useDemoTheme>;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const leading = React.useMemo(
    () => ({
      "Running Simulation": <LoadingSpinner color={theme.accent} />,
      "Simulation Done!": (
        <SymbolView
          name="checkmark.circle.fill"
          size={32}
          tintColor={theme.accent}
        />
      ),
    }),
    [theme.accent],
  );
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
      leading={leading}
      leadingGap={4}
      clipToBounds={false}
      containerStyle={multiIconContainerStyle}
      style={previewTextStyle}
    />
  );
});

const MultiIconMechanismPreview = React.memo(function MultiIconMechanismPreview({
  store,
}: {
  readonly store: MultiIconStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return <MultiIconMechanism current={state.value} />;
});

const MultiIconPreview = React.memo(function MultiIconPreview({
  store,
}: {
  readonly store: MultiIconStore;
}) {
  const theme = useDemoTheme();
  const previewButtonStyle = React.useMemo(
    () => ({
      alignItems: "center" as const,
      alignSelf: "center" as const,
      height: 56,
      borderWidth: 1.5,
      borderStyle: "dashed" as const,
      borderColor: theme.accent,
      borderRadius: 16,
      backgroundColor: theme.teachingSurface,
      paddingHorizontal: 40 * 0.72,
      paddingVertical: 40 * 0.22,
      justifyContent: "center" as const,
    }),
    [theme.accent, theme.teachingSurface],
  );

  return (
    <>
      <PressableScale onPress={store.next} style={previewButtonStyle}>
        <MultiIconValue store={store} theme={theme} />
      </PressableScale>
      <TeachingLabel>the icons follow their matching simulation states</TeachingLabel>
      <MultiIconMechanismPreview store={store} />
    </>
  );
});

function MultiIconPage({ height, width }: DemoPageProps) {
  const store = useMultiIconDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<MultiIconPreview store={store} />}
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
          {settingsRow({ label: "Leading", value: "Multiple icons", theme })}
          {settingsRow({ label: "Alignment", value: "Inline", theme })}
        </>
      )}
    />
  );
}

export const MultiIconDemoPage = React.memo(MultiIconPage);

