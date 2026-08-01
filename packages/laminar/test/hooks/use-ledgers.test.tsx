import { Text } from "react-native";
import type { ReactNode } from "react";
import { useNumericLanes } from "../../src/hooks/use-numeric-lanes";
import { useTextGlyphs } from "../../src/hooks/use-text-glyphs";
import { renderHook } from "../support/render-hook";

describe("identity ledger hooks", () => {
  test("HNL-ST-001 numeric ledger preserves stable lanes over an update sequence", () => {
    const hook = renderHook(
      ({ value }: { value: string }) => useNumericLanes(value),
      { value: "$99" }
    );
    const initialKeys = hook.result.laneKeys;

    hook.rerender({ value: "$199" });
    expect(hook.result.direction).toBe(1);
    expect(hook.result.laneKeys.slice(-2)).toEqual(initialKeys.slice(-2));

    hook.rerender({ value: "$98" });
    expect(hook.result.direction).toBe(-1);
    expect(hook.result.leadLength).toBe(1);
  });

  test("HTG-ST-001 glyph ledger preserves unchanged identities and normalizes spaces", () => {
    const hook = renderHook(
      ({ value }: { value: string }) => useTextGlyphs(value, "test"),
      { value: "A C" }
    );
    const [a, space, c] = hook.result;

    expect(space.value).toBe("\u00A0");
    hook.rerender({ value: "AB C" });

    expect(hook.result[0].id).toBe(a.id);
    expect(hook.result[2].id).toBe(space.id);
    expect(hook.result[3].id).toBe(c.id);
    expect(new Set(hook.result.map((glyph) => glyph.id)).size).toBe(4);
  });

  test("HTG-REG-001 separate namespaces never collide", () => {
    const first = renderHook(() => useTextGlyphs("AA", "first"), undefined);
    const second = renderHook(() => useTextGlyphs("AA", "second"), undefined);

    expect(first.result.map(({ id }) => id)).toEqual(["first:c0", "first:c1"]);
    expect(second.result.map(({ id }) => id)).toEqual([
      "second:c0",
      "second:c1",
    ]);
  });

  test("HTG-DT-002 leading elements reconcile as removable inline tokens", () => {
    const initialProps: { value: string; leading?: ReactNode } = {
      value: "Confirm",
      leading: <Text>icon</Text>,
    };
    const hook = renderHook(
      ({ value, leading }: { value: string; leading?: ReactNode }) =>
        useTextGlyphs(value, "leading", leading),
      initialProps
    );
    const leadingToken = hook.result[0];

    expect(leadingToken.kind).toBe("element");
    expect(leadingToken.element).toBeTruthy();

    hook.rerender({
      value: "Confirm Slippage",
      leading: undefined,
    });

    expect(hook.result.every((glyph) => glyph.kind === "text")).toBe(true);
    expect(hook.result.some((glyph) => glyph.id === leadingToken.id)).toBe(false);
  });
});
