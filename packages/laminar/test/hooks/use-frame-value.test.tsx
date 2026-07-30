import { useFrameValue } from "../../src/hooks/use-frame-value";
import { renderHook } from "../support/render-hook";

describe("useFrameValue", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("HFV-ST-001 preserves ordinary updates and detects sustained bursts", () => {
    let now = 1_000;
    jest.spyOn(performance, "now").mockImplementation(() => now);
    const hook = renderHook(
      ({ value }: { value: string }) => useFrameValue(value),
      { value: "A" }
    );

    now += 100;
    hook.rerender({ value: "B" });
    expect(hook.result).toEqual({
      value: "B",
      isBursting: false,
    });

    now += 10;
    hook.rerender({ value: "C" });
    now += 10;
    hook.rerender({ value: "D" });

    expect(hook.result).toEqual({
      value: "D",
      isBursting: true,
    });
  });

  test("HFV-ST-002 leaves burst mode after an idle interval", () => {
    let now = 2_000;
    jest.spyOn(performance, "now").mockImplementation(() => now);
    const hook = renderHook(
      ({ value }: { value: string }) => useFrameValue(value),
      { value: "A" }
    );

    for (const value of ["B", "C", "D"]) {
      now += 10;
      hook.rerender({ value });
    }
    expect(hook.result.isBursting).toBe(true);

    now += 100;
    hook.rerender({ value: "E" });
    expect(hook.result).toEqual({
      value: "E",
      isBursting: false,
    });
  });
});
