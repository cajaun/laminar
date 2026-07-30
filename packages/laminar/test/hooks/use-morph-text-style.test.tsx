import { StyleSheet } from "react-native";
import { useMorphTextStyle } from "../../src/hooks/use-morph-text-style";
import { renderHook } from "../support/render-hook";

describe("useMorphTextStyle", () => {
  test("HMS-DT-001 composes base, font, and consumer styles in precedence order", () => {
    const hook = renderHook(
      () =>
        useMorphTextStyle({
          fontSize: 20,
          color: "red",
          fontStyle: { fontWeight: "700", color: "blue" },
          style: { color: "green" },
        }),
      undefined
    );

    expect(StyleSheet.flatten(hook.result.textStyle)).toEqual({
      includeFontPadding: false,
      fontSize: 20,
      fontWeight: "700",
      color: "green",
    });
  });

  test("HMS-EP-001 omits optional font properties when not supplied", () => {
    const hook = renderHook(
      () => useMorphTextStyle({}),
      undefined
    );

    expect(StyleSheet.flatten(hook.result.textStyle)).toEqual({
      includeFontPadding: false,
    });
  });
});
