import { StyleSheet } from "react-native";
import { getFractionalTextStyle } from "../../src/view/fractional-text-style";

describe("fractional text style", () => {
  test.each([1, 1.2])("FST-EP-001 keeps full size when scale is %s", (scale) => {
    const style = { fontSize: 20 };

    expect(getFractionalTextStyle(style, 16, scale)).toBe(style);
  });

  test.each([
    [undefined, undefined],
    [{ fontSize: Number.NaN }, undefined],
    [{ fontSize: 0 }, undefined],
    [{ fontSize: -1 }, undefined],
    [undefined, Number.POSITIVE_INFINITY],
    [undefined, 0],
    [undefined, -1],
  ] as const)("FST-BVA-001 preserves style without a usable base size", (style, size) => {
    expect(getFractionalTextStyle(style, size, 0.6)).toBe(style);
  });

  test("FST-DT-001 scales the resolved font size and preserves caller styles", () => {
    const style = [{ fontSize: 20, color: "blue" }, { letterSpacing: 1 }];
    const fractional = getFractionalTextStyle(style, 16, 0.6);

    expect(StyleSheet.flatten(fractional)).toEqual({
      fontSize: 12,
      color: "blue",
      letterSpacing: 1,
    });
    expect(StyleSheet.flatten(getFractionalTextStyle(undefined, 16, 0.5))).toEqual({
      fontSize: 8,
    });
  });
});
