import React from "react";
import { Laminar } from "react-native-laminar";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { DemoPageLayout, settingsRow } from "../shared";
import type { DemoPageProps } from "../types";
import { SymbolView } from "expo-symbols";
import {
  useButtonDemoStore,
  useCyclicValueStoreSnapshot,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";
import { LoadingSpinner } from "../illustrations/loading-spinner";

type ButtonStore = ReturnType<typeof useButtonDemoStore>;

const ButtonPreview = React.memo(function ButtonPreview({
  store,
}: {
  readonly store: ButtonStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();

  return (
    <PressableScale
      onPress={store.next}
      style={{
        alignSelf: "center",
        height: 56,
        borderRadius: 36,
        backgroundColor: theme.accent,
        paddingHorizontal: 40 * 0.72,
        paddingVertical: 40 * 0.22,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Laminar
        text={state.value}
        autoSize
        leading={{
          "Running Simulation": (
            <LoadingSpinner color={theme.accentForeground} />
          ),
          "Simulation Done!": (
            <SymbolView
              name="checkmark.circle.fill"
              size={32}
              tintColor={theme.accentForeground}
            />
          ),
        }}
        leadingGap={4}
        animationPreset="default"
        clipToBounds={false}
        style={{
          color: theme.accentForeground,
          fontFamily: "Sf-semibold",
          fontSize: 32,
        }}
      />
    </PressableScale>
  );
});

function ButtonPage({ height, width }: DemoPageProps) {
  const store = useButtonDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={40}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<ButtonPreview store={store} />}
      settingsStore={store}
      renderSettings={(state, theme) => (
        <>
          {settingsRow({
            label: "Button Text",
            value: state.value,
            onPress: store.next,
            theme,
          })}
          {settingsRow({ label: "Surface", value: "Pressable", theme })}
          {settingsRow({ label: "Auto Size", value: "On", theme })}
        </>
      )}
    />
  );
}

export const ButtonDemoPage = React.memo(ButtonPage);

