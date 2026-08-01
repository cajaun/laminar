const NBSP = "\u00A0";
const graphemeSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

// segment graphemes when the runtime supports them so emoji and combining marks stay whole
export const splitDisplayUnits = (input: string): string[] => {
  if (graphemeSegmenter) {
    return Array.from(
      graphemeSegmenter.segment(input),
      (part) => part.segment
    );
  }

  return Array.from(input);
};

// replace plain spaces because native text measurement can collapse them
export const normalizeDisplayUnit = (unit: string) =>
  unit === " " ? NBSP : unit;

// numeric lanes only treat ascii digits as place-value columns
export const isAsciiDigit = (unit: string) => unit >= "0" && unit <= "9";

// leading symbols and punctuation stay attached to the left side of a number
export const findNumericLeadLength = (units: readonly string[]) => {
  const firstDigitIndex = units.findIndex(isAsciiDigit);

  return firstDigitIndex === -1 ? units.length : firstDigitIndex;
};
