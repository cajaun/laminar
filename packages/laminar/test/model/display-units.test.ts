import {
  findNumericLeadLength,
  isAsciiDigit,
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "../../src/model/display-units";

describe("display unit model", () => {
  test.each([
    ["DU-EP-001 empty input", "", []],
    ["DU-EP-002 ASCII text", "Laminar", ["L", "a", "m", "i", "n", "a", "r"]],
    ["DU-EP-003 surrogate pair", "A😀B", ["A", "😀", "B"]],
    ["DU-EP-004 combining sequence", "e\u0301", ["e\u0301"]],
    ["DU-EP-005 joined emoji", "👨‍👩‍👧‍👦", ["👨‍👩‍👧‍👦"]],
  ])("%s splits user-perceived glyphs", (_id, input, expected) => {
    expect(splitDisplayUnits(input)).toEqual(expected);
  });

  test("DU-REG-001 preserves the width of plain spaces during measurement", () => {
    expect(normalizeDisplayUnit(" ")).toBe("\u00A0");
    expect(normalizeDisplayUnit("\t")).toBe("\t");
    expect(normalizeDisplayUnit("A")).toBe("A");
  });

  test.each([
    ["DU-BVA-001 lower digit boundary", "0", true],
    ["DU-BVA-002 upper digit boundary", "9", true],
    ["DU-BVA-003 below digit boundary", "/", false],
    ["DU-BVA-004 above digit boundary", ":", false],
    ["DU-EP-006 non-ASCII digit", "９", false],
  ])("%s classifies ASCII digits", (_id, unit, expected) => {
    expect(isAsciiDigit(unit)).toBe(expected);
  });

  test.each([
    ["DU-BVA-005 empty units", [], 0],
    ["DU-EP-007 no numeric tail", ["$", "A"], 2],
    ["DU-EP-008 first unit numeric", ["1", "2"], 0],
    ["DU-EP-009 formatted numeric lead", ["$", " ", "1", "0"], 2],
  ])("%s locates the first numeric lane", (_id, units, expected) => {
    expect(findNumericLeadLength(units)).toBe(expected);
  });

  test("DU-DT-001 falls back to Unicode code points without Intl.Segmenter", () => {
    const originalSegmenter = Intl.Segmenter;
    let fallbackSplit!: (input: string) => string[];

    Object.defineProperty(Intl, "Segmenter", {
      configurable: true,
      value: undefined,
    });
    try {
      jest.isolateModules(() => {
        fallbackSplit =
          require("../../src/model/display-units").splitDisplayUnits;
      });
    } finally {
      Object.defineProperty(Intl, "Segmenter", {
        configurable: true,
        value: originalSegmenter,
      });
    }

    expect(fallbackSplit("A😀B")).toEqual(["A", "😀", "B"]);
  });
});
