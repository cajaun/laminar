import { useRef, useSyncExternalStore } from "react";
import {
  animationLayerValues,
  autoSizeValues,
  buttonWords,
  confirmContinueWords,
  editorWords,
  fontSizes,
  fontWeights,
  multiIconValues,
  numberFlowValues,
  slotMechanismValues,
  standaloneWords,
  singleIconValues,
  stepBackward,
  stepForward,
  textIdentityWords,
  transactionStates,
} from "./demo-data";

export const DEFAULT_DEMO_FONT_SIZE = fontSizes[1];

export type CyclicValueSnapshot<T> = Readonly<{
  value: T;
  previousValue: T;
  nextValue: T;
}>;

export type DemoSnapshotStore<T> = Readonly<{
  getSnapshot: () => CyclicValueSnapshot<T>;
  subscribe: (listener: () => void) => () => void;
}>;

export type CyclicValueStore<T> = DemoSnapshotStore<T> & Readonly<{
  next: () => void;
  previous: () => void;
}>;

function createCyclicValueStore<T>(
  values: readonly T[],
  initialIndex = 0,
): CyclicValueStore<T> {
  let index = initialIndex;
  let snapshot = createSnapshot();
  const listeners = new Set<() => void>();

  function createSnapshot(): CyclicValueSnapshot<T> {
    return {
      value: values[index] ?? values[0]!,
      previousValue:
        values[stepBackward(index, values.length)] ?? values[0]!,
      nextValue: values[stepForward(index, values.length)] ?? values[0]!,
    };
  }

  function setIndex(nextIndex: number) {
    if (nextIndex === index) {
      return;
    }

    index = nextIndex;
    snapshot = createSnapshot();
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    next: () => setIndex(stepForward(index, values.length)),
    previous: () => setIndex(stepBackward(index, values.length)),
  };
}

export function useCyclicValueStore<T>(
  values: readonly T[],
  initialIndex = 0,
): CyclicValueStore<T> {
  const storeRef = useRef<CyclicValueStore<T> | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createCyclicValueStore(values, initialIndex);
  }

  return storeRef.current;
}

export function useCyclicValueStoreSnapshot<T>(
  store: DemoSnapshotStore<T>,
): CyclicValueSnapshot<T> {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
}

export function useTextIdentityDemoStore() {
  return useCyclicValueStore(textIdentityWords);
}

export function useAnimationLayerDemoStore() {
  return useCyclicValueStore(animationLayerValues);
}

export function useAutoSizeDemoStore() {
  return useCyclicValueStore(autoSizeValues);
}

export function useEditorDemoStore() {
  const word = useCyclicValueStore(editorWords);
  const fontSize = useCyclicValueStore(fontSizes, 1);
  const fontWeight = useCyclicValueStore(fontWeights, 1);
  const settingsStoreRef = useRef<DemoSnapshotStore<EditorSettingsValue> | null>(null);

  if (settingsStoreRef.current === null) {
    const stores = [word, fontSize, fontWeight];
    let snapshot = createEditorSettingsSnapshot(word, fontSize, fontWeight);
    const listeners = new Set<() => void>();

    stores.forEach((store) => {
      store.subscribe(() => {
        snapshot = createEditorSettingsSnapshot(word, fontSize, fontWeight);
        listeners.forEach((listener) => listener());
      });
    });

    settingsStoreRef.current = {
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listeners.add(listener);

        return () => listeners.delete(listener);
      },
    };
  }

  return { word, fontSize, fontWeight, settings: settingsStoreRef.current };
}

type EditorSettingsValue = Readonly<{
  word: CyclicValueSnapshot<(typeof editorWords)[number]>;
  fontSize: CyclicValueSnapshot<(typeof fontSizes)[number]>;
  fontWeight: CyclicValueSnapshot<(typeof fontWeights)[number]>;
}>;

function createEditorSettingsSnapshot(
  word: CyclicValueStore<(typeof editorWords)[number]>,
  fontSize: CyclicValueStore<(typeof fontSizes)[number]>,
  fontWeight: CyclicValueStore<(typeof fontWeights)[number]>,
): CyclicValueSnapshot<EditorSettingsValue> {
  const value = {
    word: word.getSnapshot(),
    fontSize: fontSize.getSnapshot(),
    fontWeight: fontWeight.getSnapshot(),
  };

  return {
    value,
    previousValue: value,
    nextValue: value,
  };
}

export function useWordsDemoStore() {
  return useCyclicValueStore(standaloneWords);
}

export function useButtonDemoStore() {
  return useCyclicValueStore(buttonWords);
}

export function useSingleIconDemoStore() {
  return useCyclicValueStore(singleIconValues);
}

export function useMultiIconDemoStore() {
  return useCyclicValueStore(multiIconValues);
}

export function useTransactionDemoStore() {
  return useCyclicValueStore(transactionStates);
}

export function useConfirmationDemoStore() {
  return useCyclicValueStore(confirmContinueWords);
}

export function useSlotMechanismDemoStore() {
  return useCyclicValueStore(slotMechanismValues);
}

export function useNumberFlowDemoStore() {
  return useCyclicValueStore(numberFlowValues);
}
