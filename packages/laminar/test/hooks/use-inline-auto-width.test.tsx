import { act } from "react-test-renderer";
import { useInlineAutoWidth } from "../../src/hooks/use-inline-auto-width";
import { renderHook } from "../support/render-hook";

const layoutEvent = (width: number) =>
  ({
    nativeEvent: {
      layout: { width, height: 10, x: 0, y: 0 },
    },
  }) as never;

describe("useInlineAutoWidth", () => {
  test("HAW-ST-001 applies the first probe immediately and animates later widths", () => {
    const driveToWidth = jest.fn((value: number) => value + 0.5);
    const hook = renderHook(
      ({ measurementKey }: { measurementKey: string }) =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey,
        }),
      { measurementKey: "A" },
    );

    expect(hook.result.isReady).toBe(true);
    expect(hook.result.animatedWidthStyle).toEqual({});

    act(() => hook.result.captureLayout(layoutEvent(20.1)));
    hook.rerender({ measurementKey: "A" });
    expect(hook.result.animatedWidthStyle).toEqual({ width: 21 });
    expect(driveToWidth).not.toHaveBeenCalled();

    hook.rerender({ measurementKey: "B" });
    act(() => hook.result.captureLayout(layoutEvent(30.2)));
    hook.rerender({ measurementKey: "B" });
    expect(driveToWidth).toHaveBeenCalledWith(31);
    expect(hook.result.animatedWidthStyle).toEqual({ width: 31.5 });
  });

  test("HAW-BVA-001 clamps negative width and rounds fractional boundaries up", () => {
    const driveToWidth = jest.fn((value: number) => value);
    const hook = renderHook(
      ({ measurementKey }: { measurementKey: string }) =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey,
        }),
      { measurementKey: "boundary" },
    );

    act(() => hook.result.captureLayout(layoutEvent(-0.1)));
    hook.rerender({ measurementKey: "boundary" });
    expect(hook.result.animatedWidthStyle).toEqual({ width: 0 });

    hook.rerender({ measurementKey: "next" });
    act(() => hook.result.captureLayout(layoutEvent(0.01)));
    expect(driveToWidth).toHaveBeenCalledWith(1);
  });

  test("HAW-DT-001 ignores disabled measurements", () => {
    const driveToWidth = jest.fn((value: number) => value);
    const hook = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useInlineAutoWidth({
          enabled,
          driveToWidth,
          measurementKey: "disabled",
        }),
      { enabled: false },
    );

    act(() => hook.result.captureLayout(layoutEvent(10)));
    expect(hook.result.animatedWidthStyle).toEqual({});
    expect(driveToWidth).not.toHaveBeenCalled();
  });

  test("HAW-ST-004 tracks measured widths without animating them", () => {
    const driveToWidth = jest.fn((value: number) => value + 1);
    const hook = renderHook(
      ({ measurementKey }: { measurementKey: string }) =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey,
          trackMeasuredWidth: true,
        }),
      { measurementKey: "tracked" },
    );

    expect(hook.result.isReady).toBe(false);
    expect(hook.result.shouldMeasure).toBe(true);

    act(() => hook.result.captureLayout(layoutEvent(18.2)));

    expect(hook.result.measuredWidth).toBe(19);
    expect(hook.result.isReady).toBe(true);
    expect(hook.result.shouldMeasure).toBe(false);
    expect(driveToWidth).not.toHaveBeenCalled();

    act(() => hook.result.captureLayout(layoutEvent(18.2)));
    expect(hook.result.measuredWidth).toBe(19);
  });

  test("HAW-ST-003 ignores layout events from replaced measurement probes", () => {
    const driveToWidth = jest.fn((value: number) => value);
    const hook = renderHook(
      ({ measurementKey }: { measurementKey: string }) =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey,
        }),
      { measurementKey: "A" },
    );

    const firstCapture = hook.result.captureLayout;
    act(() => firstCapture(layoutEvent(20)));

    hook.rerender({ measurementKey: "B" });
    act(() => firstCapture(layoutEvent(999)));
    expect(driveToWidth).not.toHaveBeenCalledWith(999);

    act(() => hook.result.captureLayout(layoutEvent(30)));
    expect(driveToWidth).toHaveBeenCalledWith(30);
  });

  test("HAW-ST-002 evicts the least recently used width after promoting a hit", () => {
    const driveToWidth = jest.fn((value: number) => value);
    const hook = renderHook(
      ({ measurementKey }: { measurementKey: string }) =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey,
        }),
      { measurementKey: "key-0" },
    );

    act(() => hook.result.captureLayout(layoutEvent(10)));

    for (let index = 1; index <= 64; index += 1) {
      hook.rerender({ measurementKey: `key-${index}` });
      act(() => hook.result.captureLayout(layoutEvent(index + 10)));
    }

    hook.rerender({ measurementKey: "key-1" });
    expect(hook.result.shouldMeasure).toBe(false);

    hook.rerender({ measurementKey: "key-65" });
    act(() => hook.result.captureLayout(layoutEvent(75)));

    hook.rerender({ measurementKey: "key-2" });
    expect(hook.result.shouldMeasure).toBe(true);
  });
});
