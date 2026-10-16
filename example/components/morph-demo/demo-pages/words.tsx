import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import {
  useCyclicValueStoreSnapshot,
  useWordsDemoStore,
} from "../use-demo-state";

type WordsStore = ReturnType<typeof useWordsDemoStore>;

const WordsPreview = React.memo(function WordsPreview({
  store,
}: {
  readonly store: WordsStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <Laminar
      text={state.value}
      autoSize={false}
      animationPreset="smooth"
      fontSize={40}
      clipToBounds={false}
      align="center"
      style={{
        color: "#000000",
        fontFamily: "Sf-semibold",
        fontSize: 40,
      }}
    />
  );
});

function WordsPage({ height, width }: DemoPageProps) {
  const store = useWordsDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={40}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<WordsPreview store={store} />}
      settingsStore={store}
      renderSettings={(state) => (
        <>
          {settingsRow({ label: "Word", value: state.value, onPress: store.next })}
          {settingsRow({ label: "Variant", value: "Text" })}
          {settingsRow({ label: "Auto Size", value: "Off" })}
        </>
      )}
    />
  );
}

export const WordsDemoPage = React.memo(WordsPage);
