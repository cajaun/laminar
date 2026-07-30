import { reconcileNumericLanes } from "../../src/model/numeric-lanes";

describe("numeric lane reconciliation", () => {
  test.each([
    ["NL-EP-001 increasing", "9", "10", 1],
    ["NL-EP-002 decreasing", "10", "9", -1],
    ["NL-BVA-001 equal magnitude", "$1.00", "$1.00", 0],
    ["NL-EP-003 nonnumeric values", "abc", "xyz", 0],
    ["NL-EP-004 negative to positive", "-1", "1", 1],
  ] as const)("%s derives numeric flow direction", (_id, previous, next, direction) => {
    const result = reconcileNumericLanes(
      previous,
      next,
      previous.split("").map((_, index) => index),
      previous.length
    );

    expect(result.direction).toBe(direction);
  });

  test("NL-REG-001 preserves right-aligned place-value lanes when digits grow", () => {
    const result = reconcileNumericLanes("99", "100", [10, 11], 12);

    expect(result.laneKeys).toEqual([12, 13, 14]);
    expect(result.nextSeed).toBe(15);
  });

  test("NL-ST-001 preserves unchanged rightmost lanes across formatted growth", () => {
    const result = reconcileNumericLanes("$99", "$199", [4, 5, 6], 7);

    expect(result.laneKeys).toEqual([4, 7, 5, 6]);
    expect(result.direction).toBe(1);
    expect(result.nextSeed).toBe(8);
  });

  test("NL-ST-002 preserves unchanged lead units and replaces changed lead units", () => {
    const unchanged = reconcileNumericLanes("USD 12", "USD 13", [1, 2, 3, 4, 5, 6], 7);
    const changed = reconcileNumericLanes("USD 12", "EUR 12", [1, 2, 3, 4, 5, 6], 7);

    expect(unchanged.laneKeys.slice(0, 4)).toEqual([1, 2, 3, 4]);
    expect(changed.laneKeys.slice(0, 4)).toEqual([7, 8, 9, 4]);
  });

  test("NL-EP-005 supports punctuation-only and empty values", () => {
    expect(reconcileNumericLanes("", "", [], 0)).toEqual({
      laneKeys: [],
      nextSeed: 0,
      direction: 0,
    });
    expect(reconcileNumericLanes("$", "€", [3], 4).laneKeys).toEqual([4]);
  });

  test("NL-REG-002 treats grouping and decimal punctuation as positional lanes", () => {
    const result = reconcileNumericLanes("1,000.00", "2,000.00", [0, 1, 2, 3, 4, 5, 6, 7], 8);

    expect(result.laneKeys).toEqual([8, 1, 2, 3, 4, 5, 6, 7]);
  });
});
