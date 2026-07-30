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
  test("HAW-ST-001 snaps first width and animates subsequent distinct widths", () => {
    const driveToWidth = jest.fn((value: number) => value + 0.5);
    const hook = renderHook(
      ({
        enabled,
        measurementKey,
      }: {
        enabled: boolean;
        measurementKey: string;
      }) =>
        useInlineAutoWidth({ enabled, driveToWidth, measurementKey }),
      { enabled: true, measurementKey: "A" }
    );

    expect(hook.result.animatedWidthStyle).toEqual({});

    act(() => hook.result.captureLayout(layoutEvent(20.1)));
    expect(hook.result.animatedWidthStyle).toEqual({ width: 21 });
    expect(driveToWidth).not.toHaveBeenCalled();

    hook.rerender({ enabled: true, measurementKey: "B" });
    act(() => hook.result.captureLayout(layoutEvent(30.2)));
    expect(driveToWidth).toHaveBeenCalledWith(31);
    hook.rerender({ enabled: true, measurementKey: "B" });
    expect(hook.result.animatedWidthStyle).toEqual({ width: 31.5 });

    hook.rerender({ enabled: true, measurementKey: "A" });
    expect(hook.result.shouldMeasure).toBe(false);
    expect(driveToWidth).toHaveBeenCalledWith(21);
  });

  test("HAW-BVA-001 clamps negative width and rounds fractional boundaries up", () => {
    const driveToWidth = jest.fn((value: number) => value);
    const hook = renderHook(
      () =>
        useInlineAutoWidth({
          enabled: true,
          driveToWidth,
          measurementKey: "boundary",
        }),
      undefined
    );

    act(() => hook.result.captureLayout(layoutEvent(-0.1)));
    expect(hook.result.animatedWidthStyle).toEqual({ width: 0 });
    act(() => hook.result.captureLayout(layoutEvent(0.01)));
    expect(driveToWidth).toHaveBeenCalledWith(1);
  });

  test("HAW-DT-001 ignores disabled and duplicate measurements", () => {
    const driveToWidth = jest.fn((value: number) => value);
    const hook = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useInlineAutoWidth({
          enabled,
          driveToWidth,
          measurementKey: "duplicate",
        }),
      { enabled: false }
    );

    act(() => hook.result.captureLayout(layoutEvent(10)));
    expect(hook.result.animatedWidthStyle).toEqual({});

    hook.rerender({ enabled: true });
    act(() => hook.result.captureLayout(layoutEvent(10)));
    act(() => hook.result.captureLayout(layoutEvent(10)));
    expect(driveToWidth).not.toHaveBeenCalled();

    hook.rerender({ enabled: false });
    expect(hook.result.animatedWidthStyle).toEqual({});
  });
});
