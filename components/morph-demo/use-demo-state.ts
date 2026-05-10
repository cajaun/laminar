import { useCallback, useMemo, useState } from "react";
import {
  buttonWords,
  editorWords,
  examplePages,
  fontSizes,
  fontWeights,
  numericValues,
  standaloneWords,
  stepBackward,
  stepForward,
} from "./demo-data";

export function useDemoState(activePageIndex: number) {
  const [editorWordIndex, setEditorWordIndex] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [fontWeightIndex, setFontWeightIndex] = useState(1);
  const [standaloneWordIndex, setStandaloneWordIndex] = useState(0);
  const [buttonWordIndex, setButtonWordIndex] = useState(0);
  const [numberIndex, setNumberIndex] = useState(0);

  const activePageId = examplePages[activePageIndex]?.id ?? "numbers";
  const fontSize = fontSizes[fontSizeIndex];
  const fontWeight = fontWeights[fontWeightIndex];
  const editorWord = editorWords[editorWordIndex];
  const standaloneWord = standaloneWords[standaloneWordIndex];
  const buttonWord = buttonWords[buttonWordIndex];
  const numberValue = numericValues[numberIndex];
  const previousNumberValue =
    numericValues[stepBackward(numberIndex, numericValues.length)];
  const nextNumberValue =
    numericValues[stepForward(numberIndex, numericValues.length)];

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

  const cycleNumber = useCallback(() => {
    setNumberIndex((index) => stepForward(index, numericValues.length));
  }, []);

  const morph = useCallback(() => {
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

    setNumberIndex((index) => stepForward(index, numericValues.length));
  }, [activePageId]);

  const reverse = useCallback(() => {
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
      numberValue,
      previousNumberValue,
      nextNumberValue,
      cycleFontSize,
      cycleFontWeight,
      cycleEditorWord,
      cycleStandaloneWord,
      cycleButtonWord,
      cycleNumber,
      morph,
      reverse,
    }),
    [
      activePageId,
      buttonWord,
      cycleButtonWord,
      cycleEditorWord,
      cycleFontSize,
      cycleFontWeight,
      cycleNumber,
      cycleStandaloneWord,
      editorWord,
      fontSize,
      fontWeight,
      morph,
      nextNumberValue,
      numberValue,
      previousNumberValue,
      reverse,
      standaloneWord,
    ]
  );
}

export type DemoState = ReturnType<typeof useDemoState>;
