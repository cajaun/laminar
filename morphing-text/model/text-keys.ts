const computeLcsPairs = (
  previousUnits: readonly string[],
  nextUnits: readonly string[]
): readonly [number, number][] => {
  const previousLength = previousUnits.length;
  const nextLength = nextUnits.length;
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
  // lcs keeps shared glyphs in place when the text changes
  const matches = computeLcsPairs(previousUnits, nextUnits);
  const nextGlyphKeys = new Array<string>(nextUnits.length).fill("");
  let nextSeed = seed;

  for (const [previousIndex, nextIndex] of matches) {
    nextGlyphKeys[nextIndex] =
      previousKeys[previousIndex] ?? `${namespace}:c${nextSeed++}`;
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
