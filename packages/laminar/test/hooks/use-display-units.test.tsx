import { useDisplayUnits } from "../../src/hooks/use-display-units";
import { renderHook } from "../support/render-hook";

describe("useDisplayUnits", () => {
  test("HUD-ST-001 recomputes normalized graphemes when value changes", () => {
    const hook = renderHook(
      ({ value, enabled }: { value: string; enabled: boolean }) =>
        useDisplayUnits(value, enabled),
      { value: "A B", enabled: true }
    );

    expect(hook.result).toEqual(["A", "\u00A0", "B"]);
    hook.rerender({ value: "😀", enabled: true });
    expect(hook.result).toEqual(["😀"]);
  });

  test("HUD-DT-001 suppresses unit work when disabled and resumes when enabled", () => {
    const hook = renderHook(
      ({ enabled }: { enabled: boolean }) => useDisplayUnits("A B", enabled),
      { enabled: false }
    );

    expect(hook.result).toEqual([]);
    hook.rerender({ enabled: true });
    expect(hook.result).toEqual(["A", "\u00A0", "B"]);
  });
});
