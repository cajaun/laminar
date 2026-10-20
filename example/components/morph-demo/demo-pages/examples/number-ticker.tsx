import React from "react";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "../shared";
import type { DemoPageProps } from "../types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useCyclicValueStoreSnapshot,
  useNumberTickerDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

type NumberTickerStore = ReturnType<typeof useNumberTickerDemoStore>;

const NumberTickerPreview = React.memo(function NumberTickerPreview({
  store,
}: {
  readonly store: NumberTickerStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();

  return (
    <View
      style={{
        width: "100%",
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

function NumberTickerPage({ height, width }: DemoPageProps) {
  const store = useNumberTickerDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<NumberTickerPreview store={store} />}
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

export const NumberTickerDemoPage = React.memo(NumberTickerPage);

