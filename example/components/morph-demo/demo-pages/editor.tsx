import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import {
  useCyclicValueStoreSnapshot,
  useEditorDemoStore,
} from "../use-demo-state";

type EditorStore = ReturnType<typeof useEditorDemoStore>;

const EditorPreview = React.memo(function EditorPreview({
  store,
}: {
  readonly store: EditorStore;
}) {
  const word = useCyclicValueStoreSnapshot(store.word);
  const fontSize = useCyclicValueStoreSnapshot(store.fontSize);
  const fontWeight = useCyclicValueStoreSnapshot(store.fontWeight);

  return (
    <Laminar
      text={word.value}
      autoSize={false}
      animationPreset="smooth"
      fontSize={fontSize.value}
      clipToBounds={false}
      align="center"
      style={{
        color: "#000000",
        fontFamily: fontWeight.value.fontFamily,
        fontSize: fontSize.value,
      }}
    />
  );
});

const EditorSettings = React.memo(function EditorSettings({
  store,
}: {
  readonly store: EditorStore;
}) {
  const word = useCyclicValueStoreSnapshot(store.word);
  const fontSize = useCyclicValueStoreSnapshot(store.fontSize);
  const fontWeight = useCyclicValueStoreSnapshot(store.fontWeight);

  return (
    <>
      {settingsRow({ label: "Word", value: word.value, onPress: store.word.next })}
      {settingsRow({
        label: "Font Size",
        value: `${fontSize.value}pt`,
        onPress: store.fontSize.next,
      })}
      {settingsRow({
        label: "Font Weight",
        value: fontWeight.value.label,
        onPress: store.fontWeight.next,
      })}
    </>
  );
});

function EditorPage({ height, width }: DemoPageProps) {
  const store = useEditorDemoStore();
  const fontSize = useCyclicValueStoreSnapshot(store.fontSize).value;

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={fontSize}
      onReverse={store.word.previous}
      onMorph={store.word.next}
      preview={<EditorPreview store={store} />}
      settings={<EditorSettings store={store} />}
    />
  );
}

export const EditorDemoPage = React.memo(EditorPage);
