export type InputGlyphKind = "digit" | "group" | "decimal" | "text";
export type InputGlyphRole = "prefix" | "body" | "suffix";

export type InputGlyph = {
  readonly kind: InputGlyphKind;
  readonly role: InputGlyphRole;
};

type InputLaneState = {
  readonly laneKeys: readonly number[];
  readonly glyphs: readonly InputGlyph[];
  readonly nextSeed: number;
};

type LocaleSeparators = {
  readonly decimal?: string;
  readonly group?: string;
};

const localeSeparatorCache = new Map<string, LocaleSeparators>();
const punctuationPattern = /^[\p{P}\s]+$/u;

const isDigit = (unit: string) => unit >= "0" && unit <= "9";

const getLocaleSeparators = (locale?: string): LocaleSeparators => {
  if (!locale || typeof Intl === "undefined" || !Intl.NumberFormat) return {};

  const cached = localeSeparatorCache.get(locale);
  if (cached) return cached;

  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const separators = {
      decimal: parts.find((part) => part.type === "decimal")?.value,
      group: parts.find((part) => part.type === "group")?.value,
    };
    localeSeparatorCache.set(locale, separators);
    return separators;
  } catch {
    return {};
  }
};

const getDecimalIndex = (
  units: readonly string[],
  firstDigit: number,
  lastNumericIndex: number,
  separators: LocaleSeparators,
) => {
  const decimalSymbol = separators.decimal;
  if (decimalSymbol) {
    const indexes = units.flatMap((unit, index) =>
      index > firstDigit &&
      index <= lastNumericIndex &&
      unit === decimalSymbol
        ? [index]
        : [],
    );
    return indexes.length === 1 ? indexes[0] : -1;
  }

  for (let index = lastNumericIndex; index > firstDigit; index -= 1) {
    const unit = units[index];
    if (unit !== "." && unit !== ",") continue;
    const occurrences = units.filter((candidate) => candidate === unit).length;
    if (occurrences === 1) return index;
  }

  return -1;
};

export const classifyInputUnits = (
  units: readonly string[],
  locale?: string,
): readonly InputGlyph[] => {
  const firstDigit = units.findIndex(isDigit);
  let lastDigit = -1;
  for (let index = units.length - 1; index >= 0; index -= 1) {
    if (isDigit(units[index])) {
      lastDigit = index;
      break;
    }
  }
  if (firstDigit < 0 || lastDigit < firstDigit) {
    return units.map(() => ({ kind: "text", role: "body" }));
  }

  const separators = getLocaleSeparators(locale);
  let lastNumericIndex = lastDigit;
  while (lastNumericIndex + 1 < units.length) {
    const nextUnit = units[lastNumericIndex + 1];
    if (
      nextUnit !== separators.decimal &&
      nextUnit !== separators.group &&
      nextUnit !== "." &&
      nextUnit !== ","
    ) {
      break;
    }
    lastNumericIndex += 1;
  }

  const body = units.slice(firstDigit, lastNumericIndex + 1);
  const numericBody = body.every(
    (unit) =>
      isDigit(unit) ||
      unit === separators.decimal ||
      unit === separators.group ||
      punctuationPattern.test(unit),
  );

  if (!numericBody) {
    return units.map(() => ({ kind: "text", role: "body" }));
  }

  const decimalIndex = getDecimalIndex(
    units,
    firstDigit,
    lastNumericIndex,
    separators,
  );

  return units.map((unit, index) => {
    if (index < firstDigit) return { kind: "text", role: "prefix" };
    if (index > lastNumericIndex) return { kind: "text", role: "suffix" };
    if (isDigit(unit)) return { kind: "digit", role: "body" };
    return {
      kind: index === decimalIndex ? "decimal" : "group",
      role: "body",
    };
  });
};

const pairSequenceEdges = (
  previousIndexes: readonly number[],
  nextIndexes: readonly number[],
  matchOfNext: number[],
  previousKeys: readonly number[],
  canPair: (previousIndex: number, nextIndex: number) => boolean,
) => {
  let prefix = 0;
  while (
    prefix < previousIndexes.length &&
    prefix < nextIndexes.length &&
    canPair(previousIndexes[prefix], nextIndexes[prefix])
  ) {
    matchOfNext[nextIndexes[prefix]] = previousKeys[previousIndexes[prefix]];
    prefix += 1;
  }

  let suffix = 0;
  while (
    suffix < previousIndexes.length - prefix &&
    suffix < nextIndexes.length - prefix &&
    canPair(
      previousIndexes[previousIndexes.length - 1 - suffix],
      nextIndexes[nextIndexes.length - 1 - suffix],
    )
  ) {
    const previousIndex = previousIndexes[previousIndexes.length - 1 - suffix];
    const nextIndex = nextIndexes[nextIndexes.length - 1 - suffix];
    matchOfNext[nextIndex] = previousKeys[previousIndex];
    suffix += 1;
  }
};

const pairSequence = (
  previousIndexes: readonly number[],
  nextIndexes: readonly number[],
  matchOfNext: number[],
  previousKeys: readonly number[],
  canPair: (previousIndex: number, nextIndex: number) => boolean,
  previousBoundary?: number,
  nextBoundary?: number,
) => {
  if (previousBoundary === undefined || nextBoundary === undefined) {
    pairSequenceEdges(
      previousIndexes,
      nextIndexes,
      matchOfNext,
      previousKeys,
      canPair,
    );
    return;
  }

  const previousPrefix = previousIndexes.filter(
    (index) => index < previousBoundary,
  );
  const nextPrefix = nextIndexes.filter((index) => index < nextBoundary);
  const previousSuffix = previousIndexes.filter(
    (index) => index >= previousBoundary,
  );
  const nextSuffix = nextIndexes.filter((index) => index >= nextBoundary);
  pairSequenceEdges(
    previousPrefix,
    nextPrefix,
    matchOfNext,
    previousKeys,
    canPair,
  );
  pairSequenceEdges(
    previousSuffix,
    nextSuffix,
    matchOfNext,
    previousKeys,
    canPair,
  );
};

const getDigitsBefore = (glyphs: readonly InputGlyph[], index: number) => {
  let count = 0;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (glyphs[cursor]?.kind === "digit") count += 1;
  }
  return count;
};

const getIntegerDigitCount = (glyphs: readonly InputGlyph[]) => {
  const decimalIndex = glyphs.findIndex((glyph) => glyph.kind === "decimal");
  const end = decimalIndex < 0 ? glyphs.length : decimalIndex;
  return glyphs.slice(0, end).filter((glyph) => glyph.kind === "digit").length;
};

const getUnitBoundary = (units: readonly string[], caretIndex: number) => {
  let offset = 0;
  for (let index = 0; index < units.length; index += 1) {
    if (offset >= caretIndex) return index;
    offset += units[index].length;
    if (offset >= caretIndex) return index + 1;
  }
  return units.length;
};

const getEditBoundaries = (
  previousUnits: readonly string[],
  nextUnits: readonly string[],
  caretIndex?: number,
) => {
  if (caretIndex === undefined) return undefined;

  const nextBoundary = getUnitBoundary(nextUnits, Math.max(0, caretIndex));
  const lengthChange = nextUnits.length - previousUnits.length;
  const replacedUnit = lengthChange === 0 ? 1 : 0;
  const previousBoundary = Math.max(
    0,
    Math.min(
      previousUnits.length,
      nextBoundary - lengthChange - replacedUnit,
    ),
  );

  return { previousBoundary, nextBoundary };
};

const pairDigits = (
  previousUnits: readonly string[],
  nextUnits: readonly string[],
  previousIndexes: readonly number[],
  nextIndexes: readonly number[],
  matchOfNext: number[],
  previousKeys: readonly number[],
  previousBoundary?: number,
  nextBoundary?: number,
) => {
  if (previousIndexes.length === nextIndexes.length) {
    for (let index = 0; index < previousIndexes.length; index += 1) {
      const previousIndex = previousIndexes[index];
      const nextIndex = nextIndexes[index];
      matchOfNext[nextIndex] = previousKeys[previousIndex];
    }
    return;
  }

  let prefix = 0;
  const previousPrefixEnd =
    previousBoundary === undefined
      ? previousIndexes.length
      : previousIndexes.findIndex((index) => index >= previousBoundary) < 0
        ? previousIndexes.length
        : previousIndexes.findIndex((index) => index >= previousBoundary);
  const nextPrefixEnd =
    nextBoundary === undefined
      ? nextIndexes.length
      : nextIndexes.findIndex((index) => index >= nextBoundary) < 0
        ? nextIndexes.length
        : nextIndexes.findIndex((index) => index >= nextBoundary);
  while (
    prefix < previousPrefixEnd &&
    prefix < nextPrefixEnd &&
    previousUnits[previousIndexes[prefix]] === nextUnits[nextIndexes[prefix]]
  ) {
    const previousIndex = previousIndexes[prefix];
    const nextIndex = nextIndexes[prefix];
    matchOfNext[nextIndex] = previousKeys[previousIndex];
    prefix += 1;
  }

  let suffix = 0;
  while (
    suffix < previousIndexes.length - prefix &&
    suffix < nextIndexes.length - prefix &&
    (previousBoundary === undefined ||
      previousIndexes[previousIndexes.length - 1 - suffix] >= previousBoundary) &&
    (nextBoundary === undefined ||
      nextIndexes[nextIndexes.length - 1 - suffix] >= nextBoundary) &&
    previousUnits[previousIndexes[previousIndexes.length - 1 - suffix]] ===
      nextUnits[nextIndexes[nextIndexes.length - 1 - suffix]]
  ) {
    const previousIndex = previousIndexes[previousIndexes.length - 1 - suffix];
    const nextIndex = nextIndexes[nextIndexes.length - 1 - suffix];
    matchOfNext[nextIndex] = previousKeys[previousIndex];
    suffix += 1;
  }
};

export const reconcileInputLanes = (
  previousUnits: readonly string[],
  nextUnits: readonly string[],
  previousGlyphs: readonly InputGlyph[],
  nextGlyphs: readonly InputGlyph[],
  previousKeys: readonly number[],
  seed: number,
  caretIndex?: number,
): InputLaneState => {
  const matchOfNext = new Array<number>(nextUnits.length).fill(-1);
  const editBoundaries = getEditBoundaries(
    previousUnits,
    nextUnits,
    caretIndex,
  );
  const previousText = previousGlyphs.flatMap((glyph, index) =>
    glyph.kind === "text" ? [index] : [],
  );
  const nextText = nextGlyphs.flatMap((glyph, index) =>
    glyph.kind === "text" ? [index] : [],
  );

  const canPairText = (previousIndex: number, nextIndex: number) =>
    previousGlyphs[previousIndex].role === nextGlyphs[nextIndex].role &&
    previousUnits[previousIndex] === nextUnits[nextIndex];
  pairSequence(
    previousText,
    nextText,
    matchOfNext,
    previousKeys,
    canPairText,
    editBoundaries?.previousBoundary,
    editBoundaries?.nextBoundary,
  );

  const previousDecimals = previousGlyphs.flatMap((glyph, index) =>
    glyph.kind === "decimal" ? [index] : [],
  );
  const nextDecimals = nextGlyphs.flatMap((glyph, index) =>
    glyph.kind === "decimal" ? [index] : [],
  );
  pairSequence(
    previousDecimals,
    nextDecimals,
    matchOfNext,
    previousKeys,
    (previousIndex, nextIndex) =>
      previousUnits[previousIndex] === nextUnits[nextIndex],
    editBoundaries?.previousBoundary,
    editBoundaries?.nextBoundary,
  );

  const previousIntegerCount = getIntegerDigitCount(previousGlyphs);
  const nextIntegerCount = getIntegerDigitCount(nextGlyphs);
  const previousGroups = previousGlyphs.flatMap((glyph, index) =>
    glyph.kind === "group" ? [index] : [],
  );
  const nextGroups = nextGlyphs.flatMap((glyph, index) =>
    glyph.kind === "group" ? [index] : [],
  );

  if (previousIntegerCount === nextIntegerCount) {
    pairSequence(
      previousGroups,
      nextGroups,
      matchOfNext,
      previousKeys,
      (previousIndex, nextIndex) =>
        previousUnits[previousIndex] === nextUnits[nextIndex] &&
        getDigitsBefore(previousGlyphs, previousIndex) ===
          getDigitsBefore(nextGlyphs, nextIndex),
      editBoundaries?.previousBoundary,
      editBoundaries?.nextBoundary,
    );
  }

  const pairDigitPart = (fractional: boolean) => {
    const previousDecimal = previousGlyphs.findIndex(
      (glyph) => glyph.kind === "decimal",
    );
    const nextDecimal = nextGlyphs.findIndex(
      (glyph) => glyph.kind === "decimal",
    );
    const previousDigits = previousGlyphs.flatMap((glyph, index) =>
      glyph.kind === "digit" &&
      (fractional
        ? previousDecimal >= 0 && index > previousDecimal
        : index < (previousDecimal < 0 ? previousGlyphs.length : previousDecimal))
        ? [index]
        : [],
    );
    const nextDigits = nextGlyphs.flatMap((glyph, index) =>
      glyph.kind === "digit" &&
      (fractional
        ? nextDecimal >= 0 && index > nextDecimal
        : index < (nextDecimal < 0 ? nextGlyphs.length : nextDecimal))
        ? [index]
        : [],
    );
    pairDigits(
      previousUnits,
      nextUnits,
      previousDigits,
      nextDigits,
      matchOfNext,
      previousKeys,
      editBoundaries?.previousBoundary,
      editBoundaries?.nextBoundary,
    );
  };

  pairDigitPart(false);
  pairDigitPart(true);

  let nextSeed = seed;
  const laneKeys = matchOfNext.map((key) => (key >= 0 ? key : nextSeed++));

  return { laneKeys, glyphs: nextGlyphs, nextSeed };
};

export const getInputLaneSnapshot = (
  units: readonly string[],
  locale?: string,
): Omit<InputLaneState, "nextSeed"> => {
  return {
    laneKeys: units.map((_, index) => index),
    glyphs: classifyInputUnits(units, locale),
  };
};
