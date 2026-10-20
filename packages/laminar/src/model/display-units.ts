const NBSP = "\u00A0";
const graphemeSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

// segment graphemes so combining marks stay with their base character
export const splitDisplayUnits = (input: string): string[] => {
  if (graphemeSegmenter) {
    return Array.from(
      graphemeSegmenter.segment(input),
      (part) => part.segment
    );
  }

  return Array.from(input);
};

// replace spaces so native text measurement keeps their width
export const normalizeDisplayUnit = (unit: string) =>
  unit === " " ? NBSP : unit;

// treat digits as place value columns
export const isAsciiDigit = (unit: string) => unit >= "0" && unit <= "9";

// group leading symbols and punctuation with the number prefix
export const findNumericLeadLength = (units: readonly string[]) => {
  const firstDigitIndex = units.findIndex(isAsciiDigit);

  return firstDigitIndex === -1 ? units.length : firstDigitIndex;
};

// find trailing decimals without treating grouping commas as separators
export const findFractionStartIndex = (units: readonly string[]) => {
  for (let index = units.length - 2; index >= 0; index -= 1) {
    const separator = units[index];
    if (separator !== "." && separator !== ",") continue;

    const fraction = units.slice(index + 1);
    if (
      fraction.length > 0 &&
      (separator === "." || fraction.length <= 2) &&
      fraction.every(isAsciiDigit)
    ) {
      return index;
    }
  }

  return units.length;
};
