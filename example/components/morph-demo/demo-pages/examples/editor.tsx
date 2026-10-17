import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "../shared";
import type { DemoPageProps } from "../types";
import {
  useCyclicValueStoreSnapshot,
  useEditorDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

type EditorStore = ReturnType<typeof useEditorDemoStore>;

const EditorPreview = React.memo(function EditorPreview({
  store,
}: {
  readonly store: EditorStore;
}) {
  const word = useCyclicValueStoreSnapshot(store.word);
  const fontSize = useCyclicValueStoreSnapshot(store.fontSize);
  const fontWeight = useCyclicValueStoreSnapshot(store.fontWeight);
  const theme = useDemoTheme();
  const currentFontSize = fontSize.value;
  const currentFontFamily = fontWeight.value.fontFamily;

  return (
    <Laminar
      text={word.value}
      autoSize={false}
      animationPreset="smooth"
      fontSize={currentFontSize}
      clipToBounds={false}
      align="center"
      style={{
        color: theme.primary,
        fontFamily: currentFontFamily,
        fontSize: currentFontSize,
      }}
    />
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
      settingsStore={store.settings}
      renderSettings={(state, theme) => (
        <>
          {settingsRow({
            label: "Word",
            value: state.value.word.value,
            onPress: store.word.next,
            theme,
          })}
          {settingsRow({
            label: "Font Size",
            value: `${state.value.fontSize.value}pt`,
            onPress: store.fontSize.next,
            theme,
          })}
          {settingsRow({
            label: "Font Weight",
            value: state.value.fontWeight.value.label,
            theme,
            onPress: store.fontWeight.next,
          })}
        </>
      )}
    />
  );
}

export const EditorDemoPage = React.memo(EditorPage);

