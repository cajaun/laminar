import { reconcileTextGlyphKeys } from "../../src/model/text-keys";

const reconcile = (
  previous: string,
  next: string,
  previousKeys = previous.split("").map((_, index) => `k${index}`),
  seed = previous.length
) =>
  reconcileTextGlyphKeys(
    Array.from(previous),
    Array.from(next),
    previousKeys,
    seed,
    "scope"
  );

describe("text glyph identity reconciliation", () => {
  test("TK-BVA-001 handles both empty boundaries", () => {
    expect(reconcile("", "")).toEqual({ glyphKeys: [], nextSeed: 0 });
    expect(reconcile("", "A")).toEqual({
      glyphKeys: ["scope:c0"],
      nextSeed: 1,
    });
    expect(reconcile("A", "")).toEqual({ glyphKeys: [], nextSeed: 1 });
  });

  test("TK-ST-001 preserves a shared prefix and suffix around replacement", () => {
    const result = reconcile("CAT", "COT");

    expect(result.glyphKeys).toEqual(["k0", "scope:c3", "k2"]);
    expect(result.nextSeed).toBe(4);
  });

  test("TK-ST-002 preserves middle glyphs through insertion", () => {
    const result = reconcile("ACE", "ABCDE");

    expect(result.glyphKeys[0]).toBe("k0");
    expect(result.glyphKeys[2]).toBe("k1");
    expect(result.glyphKeys[4]).toBe("k2");
    expect(new Set(result.glyphKeys).size).toBe(result.glyphKeys.length);
  });

  test("TK-REG-001 uses deterministic LCS tie-breaking for repeated glyphs", () => {
    const first = reconcile("ABAB", "BABA");
    const second = reconcile("ABAB", "BABA");

    expect(first).toEqual(second);
    expect(first.glyphKeys.filter((key) => key.startsWith("k"))).toHaveLength(3);
  });

  test("TK-DT-001 allocates a key when a preserved unit has no prior key", () => {
    const result = reconcileTextGlyphKeys(["A"], ["A"], [], 5, "instance");

    expect(result).toEqual({
      glyphKeys: ["instance:c5"],
      nextSeed: 6,
    });
  });

  test("TK-DT-002 allocates missing historical keys in suffix and LCS paths", () => {
    const suffix = reconcileTextGlyphKeys(
      ["A", "B"],
      ["X", "B"],
      [],
      0,
      "suffix"
    );
    const middle = reconcileTextGlyphKeys(
      ["A", "B", "C"],
      ["X", "B", "Y"],
      [],
      0,
      "middle"
    );

    expect(suffix.glyphKeys.every((key) => key.startsWith("suffix:"))).toBe(true);
    expect(middle.glyphKeys.every((key) => key.startsWith("middle:"))).toBe(true);
    expect(new Set(middle.glyphKeys).size).toBe(3);
  });

  test("TK-EP-001 namespaces all newly allocated identities", () => {
    const result = reconcile("ABC", "XYZ", ["a", "b", "c"], 9);

    expect(result.glyphKeys).toEqual([
      "scope:c9",
      "scope:c10",
      "scope:c11",
    ]);
  });
});
