import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useCyclicValueStoreSnapshot,
  useNumberFlowDemoStore,
} from "../use-demo-state";

type NumberFlowStore = ReturnType<typeof useNumberFlowDemoStore>;

const NumberFlowPreview = React.memo(function NumberFlowPreview({
  store,
}: {
  readonly store: NumberFlowStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <Laminar
      text={state.value}
      variant="number"
      numberMode="ticker"
      fontSize={32}
      autoSize
      align="left"
      style={{
        color: "#000000",
        fontFamily: "Sf-semibold",
      }}
    />
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
      settingsStore={store}
      renderSettings={(state) => (
        <>
          {settingsRow({
            label: "Number Flow",
            value: state.value,
            onPress: store.next,
          })}
          {settingsRow({ label: "Reverse", value: state.previousValue })}
          {settingsRow({ label: "Next", value: state.nextValue })}
        </>
      )}
    />
  );
}

export const NumberFlowDemoPage = React.memo(NumberFlowPage);
