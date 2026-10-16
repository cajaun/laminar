import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import {
  useCyclicValueStoreSnapshot,
  useNumbersDemoStore,
} from "../use-demo-state";

type NumbersStore = ReturnType<typeof useNumbersDemoStore>;

const NumbersPreview = React.memo(function NumbersPreview({
  store,
}: {
  readonly store: NumbersStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <Laminar
      text={state.value}
      variant="number"
      animationPreset="default"
      fontSize={40}
      clipToBounds={false}
      containerStyle={{ alignSelf: "center" }}
      style={{
        color: "#000000",
        fontFamily: "Sf-semibold",
        fontSize: 40,
        fontVariant: ["tabular-nums"],
        textAlign: "center",
      }}
    />
  );
});

function NumbersPage({ height, width }: DemoPageProps) {
  const store = useNumbersDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={40}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<NumbersPreview store={store} />}
      settingsStore={store}
      renderSettings={(state) => (
        <>
          {settingsRow({ label: "Number", value: state.value, onPress: store.next })}
          {settingsRow({ label: "Reverse", value: state.previousValue })}
          {settingsRow({ label: "Morph", value: state.nextValue })}
        </>
      )}
    />
  );
}

export const NumbersDemoPage = React.memo(NumbersPage);
