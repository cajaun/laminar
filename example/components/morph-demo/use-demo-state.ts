import { useCallback, useMemo, useState } from "react";
import {
  animationLayerValues,
  autoSizeValues,
  buttonWords,
  confirmContinueWords,
  editorWords,
  examplePages,
  fontSizes,
  fontWeights,
  numericValues,
  numberLaneValues,
  slotValues,
  standaloneWords,
  stepBackward,
  stepForward,
  textIdentityWords,
} from "./demo-data";

export function useDemoState(activePageIndex: number) {
  const [editorWordIndex, setEditorWordIndex] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [fontWeightIndex, setFontWeightIndex] = useState(1);
  const [standaloneWordIndex, setStandaloneWordIndex] = useState(0);
  const [buttonWordIndex, setButtonWordIndex] = useState(0);
  const [confirmationWordIndex, setConfirmationWordIndex] = useState(0);
  const [numberIndex, setNumberIndex] = useState(0);
  const [slotIndex, setSlotIndex] = useState(0);
  const [textIdentityIndex, setTextIdentityIndex] = useState(0);
  const [numberLaneIndex, setNumberLaneIndex] = useState(0);
  const [animationLayerIndex, setAnimationLayerIndex] = useState(0);
  const [autoSizeIndex, setAutoSizeIndex] = useState(0);

  const activePageId = examplePages[activePageIndex]?.id ?? "numbers";
  const fontSize = fontSizes[fontSizeIndex];
  const fontWeight = fontWeights[fontWeightIndex];
  const editorWord = editorWords[editorWordIndex];
  const standaloneWord = standaloneWords[standaloneWordIndex];
  const buttonWord = buttonWords[buttonWordIndex];
  const confirmationWord = confirmContinueWords[confirmationWordIndex];
  const numberValue = numericValues[numberIndex];
  const slotValue = slotValues[slotIndex];
  const textIdentityWord = textIdentityWords[textIdentityIndex];
  const previousTextIdentityWord =
    textIdentityWords[stepBackward(textIdentityIndex, textIdentityWords.length)];
  const nextTextIdentityWord =
    textIdentityWords[stepForward(textIdentityIndex, textIdentityWords.length)];
  const numberLaneValue = numberLaneValues[numberLaneIndex];
  const animationLayerValue = animationLayerValues[animationLayerIndex];
  const previousAnimationLayerValue =
    animationLayerValues[stepBackward(animationLayerIndex, animationLayerValues.length)];
  const nextAnimationLayerValue =
    animationLayerValues[stepForward(animationLayerIndex, animationLayerValues.length)];
  const autoSizeValue = autoSizeValues[autoSizeIndex];
  const previousAutoSizeValue =
    autoSizeValues[stepBackward(autoSizeIndex, autoSizeValues.length)];
  const nextAutoSizeValue =
    autoSizeValues[stepForward(autoSizeIndex, autoSizeValues.length)];
  const previousNumberValue =
    numericValues[stepBackward(numberIndex, numericValues.length)];
  const nextNumberValue =
    numericValues[stepForward(numberIndex, numericValues.length)];
  const previousSlotValue =
    slotValues[stepBackward(slotIndex, slotValues.length)];
  const nextSlotValue =
    slotValues[stepForward(slotIndex, slotValues.length)];
  const previousNumberLaneValue =
    numberLaneValues[stepBackward(numberLaneIndex, numberLaneValues.length)];
  const nextNumberLaneValue =
    numberLaneValues[stepForward(numberLaneIndex, numberLaneValues.length)];

  const cycleFontSize = useCallback(() => {
    setFontSizeIndex((index) => stepForward(index, fontSizes.length));
  }, []);

  const cycleFontWeight = useCallback(() => {
    setFontWeightIndex((index) => stepForward(index, fontWeights.length));
  }, []);

  const cycleEditorWord = useCallback(() => {
    setEditorWordIndex((index) => stepForward(index, editorWords.length));
  }, []);

  const cycleStandaloneWord = useCallback(() => {
    setStandaloneWordIndex((index) =>
      stepForward(index, standaloneWords.length)
    );
  }, []);

  const cycleButtonWord = useCallback(() => {
    setButtonWordIndex((index) => stepForward(index, buttonWords.length));
  }, []);

  const cycleConfirmation = useCallback(() => {
    setConfirmationWordIndex((index) =>
      stepForward(index, confirmContinueWords.length)
    );
  }, []);

  const cycleNumber = useCallback(() => {
    setNumberIndex((index) => stepForward(index, numericValues.length));
  }, []);

  const cycleSlots = useCallback(() => {
    setSlotIndex((index) => stepForward(index, slotValues.length));
  }, []);

  const morph = useCallback(() => {
    if (activePageId === "textIdentity") {
      setTextIdentityIndex((index) =>
        stepForward(index, textIdentityWords.length)
      );
      return;
    }

    if (activePageId === "numberIdentity") {
      setNumberLaneIndex((index) =>
        stepForward(index, numberLaneValues.length)
      );
      return;
    }

    if (activePageId === "animationLayer") {
      setAnimationLayerIndex((index) =>
        stepForward(index, animationLayerValues.length)
      );
      return;
    }

    if (activePageId === "autoSize") {
      setAutoSizeIndex((index) => stepForward(index, autoSizeValues.length));
      return;
    }

    if (activePageId === "editor") {
      setEditorWordIndex((index) => stepForward(index, editorWords.length));
      return;
    }

    if (activePageId === "words") {
      setStandaloneWordIndex((index) =>
        stepForward(index, standaloneWords.length)
      );
      return;
    }

    if (activePageId === "button") {
      setButtonWordIndex((index) => stepForward(index, buttonWords.length));
      return;
    }

    if (activePageId === "slots") {
      setNumberIndex((index) => stepForward(index, numericValues.length));
      return;
    }

    if (activePageId === "slotValues") {
      setSlotIndex((index) => stepForward(index, slotValues.length));
      return;
    }

    setNumberIndex((index) => stepForward(index, numericValues.length));
  }, [activePageId]);

  const reverse = useCallback(() => {
    if (activePageId === "textIdentity") {
      setTextIdentityIndex((index) =>
        stepBackward(index, textIdentityWords.length)
      );
      return;
    }

    if (activePageId === "numberIdentity") {
      setNumberLaneIndex((index) =>
        stepBackward(index, numberLaneValues.length)
      );
      return;
    }

    if (activePageId === "animationLayer") {
      setAnimationLayerIndex((index) =>
        stepBackward(index, animationLayerValues.length)
      );
      return;
    }

    if (activePageId === "autoSize") {
      setAutoSizeIndex((index) => stepBackward(index, autoSizeValues.length));
      return;
    }

    if (activePageId === "editor") {
      setEditorWordIndex((index) => stepBackward(index, editorWords.length));
      return;
    }

    if (activePageId === "words") {
      setStandaloneWordIndex((index) =>
        stepBackward(index, standaloneWords.length)
      );
      return;
    }

    if (activePageId === "button") {
      setButtonWordIndex((index) => stepBackward(index, buttonWords.length));
      return;
    }

    if (activePageId === "slots") {
      setNumberIndex((index) => stepBackward(index, numericValues.length));
      return;
    }

    if (activePageId === "slotValues") {
      setSlotIndex((index) => stepBackward(index, slotValues.length));
      return;
    }

    setNumberIndex((index) => stepBackward(index, numericValues.length));
  }, [activePageId]);

  return useMemo(
    () => ({
      activePageId,
      fontSize,
      fontWeight,
      editorWord,
      standaloneWord,
      buttonWord,
      confirmationWord,
      textIdentityWord,
      previousTextIdentityWord,
      nextTextIdentityWord,
      numberLaneValue,
      previousNumberLaneValue,
      nextNumberLaneValue,
      animationLayerValue,
      previousAnimationLayerValue,
      nextAnimationLayerValue,
      autoSizeValue,
      previousAutoSizeValue,
      nextAutoSizeValue,
      numberValue,
      previousNumberValue,
      nextNumberValue,
      slotValue,
      previousSlotValue,
      nextSlotValue,
      cycleFontSize,
      cycleFontWeight,
      cycleEditorWord,
      cycleStandaloneWord,
      cycleButtonWord,
      cycleConfirmation,
      cycleNumber,
      cycleSlots,
      morph,
      reverse,
    }),
    [
      activePageId,
      animationLayerValue,
      previousAnimationLayerValue,
      nextAnimationLayerValue,
      autoSizeValue,
      previousAutoSizeValue,
      nextAutoSizeValue,
      buttonWord,
      confirmationWord,
      cycleButtonWord,
      cycleConfirmation,
      cycleEditorWord,
      cycleFontSize,
      cycleFontWeight,
      cycleNumber,
      cycleSlots,
      cycleStandaloneWord,
      editorWord,
      fontSize,
      fontWeight,
      morph,
      nextTextIdentityWord,
      previousTextIdentityWord,
      nextNumberValue,
      nextNumberLaneValue,
      numberLaneValue,
      numberValue,
      nextSlotValue,
      previousNumberLaneValue,
      previousNumberValue,
      previousSlotValue,
      reverse,
      slotValue,
      standaloneWord,
      textIdentityWord,
    ]
  );
}

export type DemoState = ReturnType<typeof useDemoState>;
