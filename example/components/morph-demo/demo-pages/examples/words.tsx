import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "../shared";
import type { DemoPageProps } from "../types";
import {
  useCyclicValueStoreSnapshot,
  useWordsDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

type WordsStore = ReturnType<typeof useWordsDemoStore>;

const WordsPreview = React.memo(function WordsPreview({
  store,
}: {
  readonly store: WordsStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();

  return (
    <Laminar
      text={state.value}
      autoSize={false}
      animationPreset="smooth"
      fontSize={40}
      clipToBounds={false}
      align="center"
      style={{
        color: theme.primary,
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
      renderSettings={(state, theme) => (
        <>
          {settingsRow({ label: "Word", value: state.value, onPress: store.next, theme })}
          {settingsRow({ label: "Variant", value: "Text", theme })}
          {settingsRow({ label: "Auto Size", value: "Off", theme })}
        </>
      )}
    />
  );
}

export const WordsDemoPage = React.memo(WordsPage);

