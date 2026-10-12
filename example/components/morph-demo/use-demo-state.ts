import { useCallback, useState } from "react";
import {
  animationLayerValues,
  autoSizeValues,
  buttonWords,
  editorWords,
  fontSizes,
  fontWeights,
  numberFlowValues,
  numberLaneValues,
  numericValues,
  standaloneWords,
  stepBackward,
  stepForward,
  textIdentityWords,
  transactionStates,
} from "./demo-data";

export const DEFAULT_DEMO_FONT_SIZE = fontSizes[1];

type CyclicValue<T> = {
  readonly value: T;
  readonly previousValue: T;
  readonly nextValue: T;
  readonly next: () => void;
  readonly previous: () => void;
};

function useCyclicValue<T>(
  values: readonly T[],
  initialIndex = 0,
): CyclicValue<T> {
  const [index, setIndex] = useState(initialIndex);
  const next = useCallback(() => {
    setIndex((currentIndex) => stepForward(currentIndex, values.length));
  }, [values.length]);
  const previous = useCallback(() => {
    setIndex((currentIndex) => stepBackward(currentIndex, values.length));
  }, [values.length]);

  return {
    value: values[index] ?? values[0]!,
    previousValue:
      values[stepBackward(index, values.length)] ?? values[0]!,
    nextValue: values[stepForward(index, values.length)] ?? values[0]!,
    next,
    previous,
  };
}

export function useTextIdentityDemoState() {
  const text = useCyclicValue(textIdentityWords);

  return {
    textIdentityWord: text.value,
    morph: text.next,
    reverse: text.previous,
  };
}

export function useNumberIdentityDemoState() {
  const number = useCyclicValue(numberLaneValues);

  return {
    numberLaneValue: number.value,
    morph: number.next,
    reverse: number.previous,
  };
}

export function useAnimationLayerDemoState() {
  const digit = useCyclicValue(animationLayerValues);

  return {
    animationLayerValue: digit.value,
    morph: digit.next,
    reverse: digit.previous,
  };
}

export function useAutoSizeDemoState() {
  const text = useCyclicValue(autoSizeValues);

  return {
    autoSizeValue: text.value,
    morph: text.next,
    reverse: text.previous,
  };
}

export function useEditorDemoState() {
  const word = useCyclicValue(editorWords);
  const fontSize = useCyclicValue(fontSizes, 1);
  const fontWeight = useCyclicValue(fontWeights, 1);

  return {
    editorWord: word.value,
    fontSize: fontSize.value,
    fontWeight: fontWeight.value,
    cycleEditorWord: word.next,
    cycleFontSize: fontSize.next,
    cycleFontWeight: fontWeight.next,
    morph: word.next,
    reverse: word.previous,
  };
}

export function useWordsDemoState() {
  const word = useCyclicValue(standaloneWords);

  return {
    standaloneWord: word.value,
    fontSize: DEFAULT_DEMO_FONT_SIZE,
    fontWeight: fontWeights[1],
    cycleStandaloneWord: word.next,
    morph: word.next,
    reverse: word.previous,
  };
}

export function useButtonDemoState() {
  const word = useCyclicValue(buttonWords);

  return {
    buttonWord: word.value,
    fontSize: DEFAULT_DEMO_FONT_SIZE,
    cycleButtonWord: word.next,
    morph: word.next,
    reverse: word.previous,
  };
}

export function useTransactionDemoState() {
  const transaction = useCyclicValue(transactionStates);

  return {
    transactionState: transaction.value,
    cycleTransaction: transaction.next,
    morph: transaction.next,
    reverse: transaction.previous,
  };
}

export function useNumbersDemoState() {
  const number = useCyclicValue(numericValues);

  return {
    numberValue: number.value,
    previousNumberValue: number.previousValue,
    nextNumberValue: number.nextValue,
    fontSize: DEFAULT_DEMO_FONT_SIZE,
    cycleNumber: number.next,
    morph: number.next,
    reverse: number.previous,
  };
}

export function useSlotsDemoState() {
  const number = useCyclicValue(numericValues);

  return {
    numberValue: number.value,
    previousNumberValue: number.previousValue,
    nextNumberValue: number.nextValue,
    fontSize: DEFAULT_DEMO_FONT_SIZE,
    cycleNumber: number.next,
    morph: number.next,
    reverse: number.previous,
  };
}

export function useNumberFlowDemoState() {
  const number = useCyclicValue(numberFlowValues);

  return {
    numberFlowValue: number.value,
    previousNumberFlowValue: number.previousValue,
    nextNumberFlowValue: number.nextValue,
    cycleNumberFlow: number.next,
    morph: number.next,
    reverse: number.previous,
  };
}
