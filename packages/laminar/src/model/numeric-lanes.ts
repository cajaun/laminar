import type { NumericFlowDirection } from "../types";
import {
  findNumericLeadLength,
  splitDisplayUnits,
} from "./display-units";

// remove formatting before comparing numeric values
const readNumericMagnitude = (input: string) =>
  parseFloat(input.replace(/[^0-9.-]/g, "")) || 0;

// use the value sign to choose each digit lane direction
const deriveFlowDirection = (
  previousValue: string,
  nextValue: string
): NumericFlowDirection =>
  Math.sign(readNumericMagnitude(nextValue) - readNumericMagnitude(previousValue)) as NumericFlowDirection;

type ReconciledLaneState = {
  readonly laneKeys: readonly number[];
  readonly nextSeed: number;
  readonly direction: NumericFlowDirection;
};

// keep place values right aligned as prefixes change width
export const reconcileNumericLanes = (
  previousValue: string,
  nextValue: string,
  previousKeys: readonly number[],
  seed: number
): ReconciledLaneState => {
  const previousUnits = splitDisplayUnits(previousValue);
  const nextUnits = splitDisplayUnits(nextValue);
  const nextLaneKeys = new Array(nextUnits.length);
  let nextSeed = seed;

  const nextLeadLength = findNumericLeadLength(nextUnits);
  const previousLeadLength = findNumericLeadLength(previousUnits);
  const sharedLeadLength = Math.min(nextLeadLength, previousLeadLength);

  for (let index = 0; index < nextLeadLength; index += 1) {
    nextLaneKeys[index] =
      index < sharedLeadLength && nextUnits[index] === previousUnits[index]
        ? previousKeys[index]
        : nextSeed++;
  }

  const previousTailUnits = previousUnits.slice(previousLeadLength);
  const nextTailUnits = nextUnits.slice(nextLeadLength);
  const previousTailKeys = previousKeys.slice(previousLeadLength);
  const laneCount = Math.max(previousTailUnits.length, nextTailUnits.length);

  const leftPaddedPreviousUnits = [
    ...Array<string>(Math.max(0, laneCount - previousTailUnits.length)).fill(""),
    ...previousTailUnits,
  ];
  const leftPaddedNextUnits = [
    ...Array<string>(Math.max(0, laneCount - nextTailUnits.length)).fill(""),
    ...nextTailUnits,
  ];
  const leftPaddedPreviousKeys = [
    ...Array<number>(Math.max(0, laneCount - previousTailKeys.length)).fill(-1),
    ...previousTailKeys,
  ];

  // add lanes on the left to preserve rightmost place values
  const nextTailOffset = laneCount - nextTailUnits.length;

  for (let index = 0; index < nextTailUnits.length; index += 1) {
    const paddedIndex = nextTailOffset + index;
    const nextUnit = leftPaddedNextUnits[paddedIndex];
    const previousUnit = leftPaddedPreviousUnits[paddedIndex];
    const previousKey = leftPaddedPreviousKeys[paddedIndex];

    nextLaneKeys[nextLeadLength + index] =
      nextUnit === previousUnit && previousKey >= 0 ? previousKey : nextSeed++;
  }

  return {
    laneKeys: nextLaneKeys,
    nextSeed,
    direction: deriveFlowDirection(previousValue, nextValue),
  };
};
