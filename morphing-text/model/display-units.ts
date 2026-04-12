const NBSP = "\u00A0";
const graphemeSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

export const splitDisplayUnits = (input: string): string[] => {
  if (graphemeSegmenter) {
    return Array.from(
      graphemeSegmenter.segment(input),
      (part) => part.segment
    );
  }

  return Array.from(input);
};

// swap plain spaces so measured text keeps its width
export const normalizeDisplayUnit = (unit: string) =>
  unit === " " ? NBSP : unit;

export const isAsciiDigit = (unit: string) => unit >= "0" && unit <= "9";

export const findNumericLeadLength = (units: readonly string[]) => {
  const firstDigitIndex = units.findIndex(isAsciiDigit);

  return firstDigitIndex === -1 ? units.length : firstDigitIndex;
};
