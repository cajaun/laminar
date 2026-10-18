const NBSP = "\u00A0";
const graphemeSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

// segment graphemes so combining marks stay whole
export const splitDisplayUnits = (input: string): string[] => {
  if (graphemeSegmenter) {
    return Array.from(
      graphemeSegmenter.segment(input),
      (part) => part.segment
    );
  }

  return Array.from(input);
};

// replace plain spaces so native measurement preserves them
export const normalizeDisplayUnit = (unit: string) =>
  unit === " " ? NBSP : unit;

// treat ascii digits as place value columns
export const isAsciiDigit = (unit: string) => unit >= "0" && unit <= "9";

// attach leading symbols and punctuation to the number prefix
export const findNumericLeadLength = (units: readonly string[]) => {
  const firstDigitIndex = units.findIndex(isAsciiDigit);

  return firstDigitIndex === -1 ? units.length : firstDigitIndex;
};
