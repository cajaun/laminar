import React from "react";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "../shared";
import type { DemoPageProps } from "../types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useCyclicValueStoreSnapshot,
  useNumberFlowDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

type NumberFlowStore = ReturnType<typeof useNumberFlowDemoStore>;

const NumberFlowPreview = React.memo(function NumberFlowPreview({
  store,
}: {
  readonly store: NumberFlowStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Laminar
        text={state.value}
        variant="number"
        numberMode="ticker"
        animationPreset="ticker"
        fontSize={64}
        autoSize
        align="center"
        containerStyle={{ alignSelf: "center" }}
        style={{
          color: theme.primary,
          fontFamily: "Sf-semibold",
          fontSize: 64,
          textAlign: "center",
        }}
      />
    </View>
  );
});

function NumberFlowPage({ height, width }: DemoPageProps) {
  const store = useNumberFlowDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<NumberFlowPreview store={store} />}
      fillPreview
      settingsStore={store}
      renderSettings={(state, theme) => (
        <>
          {settingsRow({
            label: "Price",
            value: state.value,
            onPress: store.next,
            theme,
          })}
          {settingsRow({ label: "Mode", value: "Ticker", theme })}
          {settingsRow({ label: "Alignment", value: "Center", theme })}
        </>
      )}
    />
  );
}

export const NumberFlowDemoPage = React.memo(NumberFlowPage);

