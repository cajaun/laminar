const computeLcsPairs = (
  previousUnits: readonly string[],
  nextUnits: readonly string[]
): readonly [number, number][] => {
  const previousLength = previousUnits.length;
  const nextLength = nextUnits.length;

  if (previousLength === 0 || nextLength === 0) {
    return [];
  }

  const dp = Array.from({ length: previousLength + 1 }, () =>
    new Array<number>(nextLength + 1).fill(0)
  );

  for (let previousIndex = 1; previousIndex <= previousLength; previousIndex += 1) {
    for (let nextIndex = 1; nextIndex <= nextLength; nextIndex += 1) {
      dp[previousIndex][nextIndex] =
        previousUnits[previousIndex - 1] === nextUnits[nextIndex - 1]
          ? dp[previousIndex - 1][nextIndex - 1] + 1
          : Math.max(dp[previousIndex - 1][nextIndex], dp[previousIndex][nextIndex - 1]);
    }
  }

  const pairs: [number, number][] = [];
  let previousIndex = previousLength;
  let nextIndex = nextLength;

  while (previousIndex > 0 && nextIndex > 0) {
    if (previousUnits[previousIndex - 1] === nextUnits[nextIndex - 1]) {
      pairs.push([previousIndex - 1, nextIndex - 1]);
      previousIndex -= 1;
      nextIndex -= 1;
      continue;
    }

    if (
      dp[previousIndex - 1][nextIndex] > dp[previousIndex][nextIndex - 1] ||
      (dp[previousIndex - 1][nextIndex] === dp[previousIndex][nextIndex - 1] &&
        previousIndex >= nextIndex)
    ) {
      previousIndex -= 1;
    } else {
      nextIndex -= 1;
    }
  }

  pairs.reverse();
  return pairs;
};

type ReconciledTextGlyphState = {
  readonly glyphKeys: readonly string[];
  readonly nextSeed: number;
};

export const reconcileTextGlyphKeys = (
  previousUnits: readonly string[],
  nextUnits: readonly string[],
  previousKeys: readonly string[],
  seed: number,
  namespace: string
): ReconciledTextGlyphState => {
  const previousLength = previousUnits.length;
  const nextLength = nextUnits.length;
  const nextGlyphKeys = new Array<string>(nextUnits.length).fill("");
  let nextSeed = seed;

  let sharedPrefixLength = 0;
  while (
    sharedPrefixLength < previousLength &&
    sharedPrefixLength < nextLength &&
    previousUnits[sharedPrefixLength] === nextUnits[sharedPrefixLength]
  ) {
    nextGlyphKeys[sharedPrefixLength] =
      previousKeys[sharedPrefixLength] ?? `${namespace}:c${nextSeed++}`;
    sharedPrefixLength += 1;
  }

  let sharedSuffixLength = 0;
  while (
    sharedSuffixLength < previousLength - sharedPrefixLength &&
    sharedSuffixLength < nextLength - sharedPrefixLength &&
    previousUnits[previousLength - 1 - sharedSuffixLength] ===
      nextUnits[nextLength - 1 - sharedSuffixLength]
  ) {
    const previousIndex = previousLength - 1 - sharedSuffixLength;
    const nextIndex = nextLength - 1 - sharedSuffixLength;
    nextGlyphKeys[nextIndex] =
      previousKeys[previousIndex] ?? `${namespace}:c${nextSeed++}`;
    sharedSuffixLength += 1;
  }

  const previousMiddleEnd = previousLength - sharedSuffixLength;
  const nextMiddleEnd = nextLength - sharedSuffixLength;
  const previousMiddleUnits = previousUnits.slice(
    sharedPrefixLength,
    previousMiddleEnd
  );
  const nextMiddleUnits = nextUnits.slice(sharedPrefixLength, nextMiddleEnd);

  // lcs keeps shared middle glyphs in place when the text changes
  const matches = computeLcsPairs(previousMiddleUnits, nextMiddleUnits);

  for (const [previousIndex, nextIndex] of matches) {
    const absolutePreviousIndex = previousIndex + sharedPrefixLength;
    const absoluteNextIndex = nextIndex + sharedPrefixLength;

    nextGlyphKeys[absoluteNextIndex] =
      previousKeys[absolutePreviousIndex] ?? `${namespace}:c${nextSeed++}`;
  }

  for (let nextIndex = 0; nextIndex < nextGlyphKeys.length; nextIndex += 1) {
    if (!nextGlyphKeys[nextIndex]) {
      nextGlyphKeys[nextIndex] = `${namespace}:c${nextSeed++}`;
    }
  }

  return {
    glyphKeys: nextGlyphKeys,
    nextSeed,
  };
};
